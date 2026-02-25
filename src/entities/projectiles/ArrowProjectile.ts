// חץ - פרויקטיל עוקב אחרי מיקום האויב החי בכל פריים

import Phaser from 'phaser';
import { BaseProjectile } from './BaseProjectile';
import type { CombatManager } from '../../managers/CombatManager';
import type { BaseEnemy } from '../enemies/BaseEnemy';
import type { ElementType } from '../../types/UnitTypes';

const ARROW_SPEED = 400; // פיקסלים לשניה
const HIT_RADIUS  = 14;  // רדיוס פגיעה בפיקסלים

export class ArrowProjectile extends BaseProjectile {
  private readonly target: BaseEnemy; // הפניה חיה לאויב לעדכון כיוון בכל פריים
  private dx: number = 0;
  private dy: number = 0;

  // אתחול חץ עם הפניה חיה לאויב המטרה
  constructor(
    scene: Phaser.Scene,
    fromX: number, fromY: number,
    target: BaseEnemy,
    damage: number,
    element: ElementType,
    sourceInstanceId: string
  ) {
    super(scene, fromX, fromY, damage, element, sourceInstanceId, 0xffcc00, 6);
    this.target = target;
    // כיוון ראשוני
    this.updateDirection();
  }

  // עדכון כיוון לעבר מיקום האויב הנוכחי
  private updateDirection(): void {
    const dist = Math.hypot(this.target.x - this.x, this.target.y - this.y);
    if (dist > 0) {
      this.dx = ((this.target.x - this.x) / dist) * ARROW_SPEED;
      this.dy = ((this.target.y - this.y) / dist) * ARROW_SPEED;
    }
  }

  // תנועה עם עדכון כיוון - בדיקת פגיעה בהגעה לקרבת האויב
  update(delta: number, combatManager: CombatManager): boolean {
    // אם האויב מת (הוסר מהסצנה), החץ נעלם
    if (!this.target.active) return true;

    // עדכון כיוון לעבר מיקום האויב הנוכחי
    this.updateDirection();

    const dt = delta / 1000;
    this.x += this.dx * dt;
    this.y += this.dy * dt;

    // פגיעה בהגעה לרדיוס המטרה
    if (Math.hypot(this.x - this.target.x, this.y - this.target.y) < HIT_RADIUS) {
      combatManager.applyDamage({
        sourceInstanceId: this.sourceInstanceId,
        targetInstanceId: this.target.instanceId,
        rawDamage: this.damage,
        element: this.element,
        isAoe: false,
      });
      return true;
    }
    return false;
  }
}
