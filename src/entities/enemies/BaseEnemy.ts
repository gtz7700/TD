// אויב בסיס - מחלקה מופשטת עם תנועה לאורך נתיב ופסי HP/מגן

import Phaser from 'phaser';
import { EventBus } from '../../core/EventBus';
import { Events } from '../../types/EventTypes';
import { EnemyHealthBar } from '../../ui/EnemyHealthBar';
import { PathManager } from '../../managers/PathManager';
import { interpolateAlongPath } from '../../utils/PathUtils';
import type { IEnemyDef } from '../../types/EnemyTypes';
import type { IStatusEffect } from '../../types/CombatTypes';

export abstract class BaseEnemy extends Phaser.GameObjects.Rectangle {
  readonly instanceId: string;
  readonly defId: string;
  readonly def: IEnemyDef;

  currentHP: number;
  currentShield: number;

  protected readonly pathManager: PathManager;
  protected readonly route: string[]; // רצף מזהי צמתים שנקבע בלידה
  protected distanceTravelled = 0;
  protected readonly healthBar: EnemyHealthBar;
  protected speedMultiplier = 1; // מושפע מאפקט Ice
  protected activeEffects: IStatusEffect[] = [];
  private readonly pathLength: number; // אורך הנתיב הכולל - מחושב פעם אחת בבנאי
  private exitReached = false; // דגל למניעת שידור חוזר של אירוע היציאה

  // אתחול אויב עם מסלול ופס בריאות
  constructor(
    scene: Phaser.Scene,
    instanceId: string,
    def: IEnemyDef,
    route: string[],
    pathManager: PathManager
  ) {
    super(scene, 0, 0, def.hitboxWidth, def.hitboxHeight, 0xff4444);
    this.setDepth(20);
    scene.add.existing(this);

    this.instanceId  = instanceId;
    this.defId       = def.id;
    this.def         = def;
    this.currentHP   = def.maxHP;
    this.currentShield = def.maxShield;
    this.pathManager = pathManager;
    this.route       = route;

    // חישוב אורך הנתיב פעם אחת בבנאי לביצועים טובים יותר
    const nodes = pathManager.routeToNodes(route);
    this.pathLength = nodes.reduce((total, n, i) => {
      if (i === 0) return total;
      const prev = nodes[i - 1];
      return total + Math.hypot(n.x - prev.x, n.y - prev.y);
    }, 0);

    this.healthBar = new EnemyHealthBar(scene, 0, 0, def.maxHP, def.maxShield);
  }

  // עדכון מסגרתי: תנועה לאורך הנתיב ועיבוד אפקטים פעילים
  update(delta: number): void {
    if (this.exitReached) return;

    this.updateEffects(delta);

    const effectiveSpeed = this.def.speed * this.speedMultiplier;
    this.distanceTravelled += (effectiveSpeed * delta) / 1000;

    const nodes = this.pathManager.routeToNodes(this.route);
    const pos   = interpolateAlongPath(nodes, this.distanceTravelled);

    this.setPosition(pos.x, pos.y);
    this.healthBar.setPosition(pos.x, pos.y);

    // בדיקת הגעה ליציאה - שידור פעם אחת בלבד
    if (this.distanceTravelled >= this.pathLength) {
      this.exitReached = true;
      EventBus.emit(Events.ENEMY_REACHED_EXIT, {
        instanceId: this.instanceId,
        lifeDamage: this.def.lifeDamage,
      });
    }
  }

  // עדכון אפקטי סטטוס פעילים ויישום אפקט האיטה
  private updateEffects(delta: number): void {
    this.speedMultiplier = 1;

    this.activeEffects = this.activeEffects.filter(eff => {
      eff.remainingMs -= delta;
      if (eff.type === 'Ice') this.speedMultiplier *= eff.multiplier;
      return eff.remainingMs > 0;
    });
  }

  // הוספת אפקט סטטוס חדש (או חידוש קיים)
  addStatusEffect(effect: IStatusEffect): void {
    const existing = this.activeEffects.find(e => e.type === effect.type);
    if (existing) {
      existing.remainingMs = Math.max(existing.remainingMs, effect.durationMs);
    } else {
      this.activeEffects.push({ ...effect });
    }
  }

  // ניקוי: הסרת פסי הבריאות והגיאומטריה
  destroy(fromScene?: boolean): void {
    this.healthBar.destroy();
    super.destroy(fromScene);
  }
}
