// מגדל בסיס - מחלקה מופשטת עם טיימר ירי, רדיוס טווח ורכישת מטרות

import Phaser from 'phaser';
import { EventBus } from '../../core/EventBus';
import { Events } from '../../types/EventTypes';
import { distanceBetween } from '../../utils/MathUtils';
import type { EnemyManager } from '../../managers/EnemyManager';
import type { ITowerDef } from '../../types/UnitTypes';
import type { BaseEnemy } from '../enemies/BaseEnemy';

export abstract class BaseTower extends Phaser.GameObjects.Rectangle {
  readonly instanceId: string;
  protected readonly def: ITowerDef;
  protected fireTimer = 0; // צובר זמן עד לירי הבא

  // הגדרות ניתנות לשדרוג (שדרוג מחיל שינוי ישיר על השדות)
  protected currentRange: number;
  protected currentDamage: number;
  protected currentFireRateMs: number;

  // אתחול מגדל עם מאפיינים בסיסיים
  constructor(
    scene: Phaser.Scene,
    instanceId: string,
    def: ITowerDef,
    x: number, y: number,
    color: number
  ) {
    super(scene, x, y, def.hitboxWidth, def.hitboxHeight, color);
    this.setDepth(15).setAlpha(0); // hitbox invisible — white dot provides visual
    scene.add.existing(this);

    this.instanceId         = instanceId;
    this.def                = def;
    this.currentRange       = def.range;
    this.currentDamage      = def.damage;
    this.currentFireRateMs  = def.fireRateMs;

    // tap-to-show-range: emit event picked up by GameScene rangeGraphics
    this.setInteractive();
    this.on('pointerdown', () => {
      EventBus.emit(Events.TOWER_CLICKED, {
        instanceId: this.instanceId,
        x: this.x,
        y: this.y,
        range: this.currentRange,
      });
    });

    // white center dot — makes tower look less like a bare block
    const dot = scene.add.graphics().setDepth(16);
    dot.fillStyle(0xffffff, 0.7);
    dot.fillCircle(x, y, 4);
    this.once('destroy', () => dot.destroy());
  }

  // עדכון מסגרתי - מצבר זמן ויורה כשמגיע הזמן
  update(delta: number, enemyManager: EnemyManager): void {
    this.fireTimer += delta;
    if (this.fireTimer < this.currentFireRateMs) return;

    const target = this.acquireTarget(enemyManager);
    if (!target) return;

    this.fireTimer = 0;
    this.fire(target);

    EventBus.emit(Events.TOWER_FIRED, {
      towerInstanceId: this.instanceId,
      targetInstanceId: target.instanceId,
      projectileType: this.def.id,
    });
  }

  // רכישת מטרה: האויב הקרוב ביותר בטווח
  protected acquireTarget(enemyManager: EnemyManager): BaseEnemy | null {
    let closest: BaseEnemy | null = null;
    let minDist = Infinity;

    enemyManager.getActive().forEach(enemy => {
      const dist = distanceBetween(this.x, this.y, enemy.x, enemy.y);
      if (dist <= this.currentRange && dist < minDist) {
        minDist = dist;
        closest = enemy;
      }
    });

    return closest;
  }

  // יישום שינויי סטטיסטיקות משדרוג (נקרא ע"י UpgradeManager)
  applyStatDelta(deltas: Partial<{
    damage: number; range: number; fireRateMs: number; aoeRadius: number;
  }>): void {
    if (deltas.damage)      this.currentDamage     += deltas.damage;
    if (deltas.range)       this.currentRange      += deltas.range;
    if (deltas.fireRateMs)  this.currentFireRateMs -= deltas.fireRateMs; // הפחתה = ירי מהיר יותר
  }

  // פעולת ירי - ממומשת בתתי-מחלקות
  protected abstract fire(target: BaseEnemy): void;
}
