// אבן קטפולטה - טיסה בקשת עם AOE בנחיתה

import Phaser from 'phaser';
import { BaseProjectile } from './BaseProjectile';
import { EventBus } from '../../core/EventBus';
import { Events } from '../../types/EventTypes';
import type { CombatManager } from '../../managers/CombatManager';
import type { ElementType } from '../../types/UnitTypes';

const BOULDER_SPEED = 200;

export class CatapultBoulder extends BaseProjectile {
  private readonly toX: number;
  private readonly toY: number;
  private readonly aoeRadius: number;
  private vx: number;
  private vy: number;
  private _arcProgress = 0; // 0-1 לחישוב גובה קשת (שמור לשימוש עתידי)

  // אתחול אבן קטפולטה עם נקודת נחיתה ורדיוס AOE
  constructor(
    scene: Phaser.Scene,
    fromX: number, fromY: number,
    toX: number, toY: number,
    damage: number,
    element: ElementType,
    aoeRadius: number,
    sourceInstanceId: string
  ) {
    super(scene, fromX, fromY, damage, element, sourceInstanceId, 0x8b6914, 14);
    this.toX = toX;
    this.toY = toY;
    this.aoeRadius = aoeRadius;

    const dist = Math.hypot(toX - fromX, toY - fromY);
    this.vx = dist > 0 ? ((toX - fromX) / dist) * BOULDER_SPEED : 0;
    this.vy = dist > 0 ? ((toY - fromY) / dist) * BOULDER_SPEED : 0;
  }

  // תנועה בקשת - AOE על נחיתה בנקודת המטרה
  update(delta: number, combatManager: CombatManager): boolean {
    const dt = delta / 1000;
    this.x += this.vx * dt;
    this.y += this.vy * dt;

    // סיום: הגעה לנקודת המטרה - פיצוץ AOE
    if (Math.hypot(this.x - this.toX, this.y - this.toY) < 15) {
      const aoePayload = {
        center: { x: this.toX, y: this.toY },
        radius: this.aoeRadius,
        damage: this.damage,
        element: this.element,
        sourceInstanceId: this.sourceInstanceId,
      };

      EventBus.emit(Events.AOE_TRIGGERED, aoePayload);
      combatManager.applyAoe(aoePayload);
      return true;
    }
    return false;
  }
}
