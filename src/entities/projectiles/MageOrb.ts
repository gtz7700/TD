// כדור קסם - פרויקטיל מעקב עם אלמנט

import Phaser from 'phaser';
import { BaseProjectile } from './BaseProjectile';
import type { CombatManager } from '../../managers/CombatManager';
import type { ElementType } from '../../types/UnitTypes';

const ORB_SPEED = 280;

export class MageOrb extends BaseProjectile {
  private readonly targetInstanceId: string;

  // יצירת כדור קסם צבעוני על פי אלמנט
  constructor(
    scene: Phaser.Scene,
    fromX: number, fromY: number,
    targetInstanceId: string,
    damage: number,
    element: ElementType,
    sourceInstanceId: string
  ) {
    const color = element === 'Fire' ? 0xff4400 :
                  element === 'Ice'  ? 0x44aaff :
                  element === 'Poison' ? 0x44ff44 : 0xaa44ff;

    super(scene, fromX, fromY, damage, element, sourceInstanceId, color, 10);
    this.targetInstanceId = targetInstanceId;
  }

  // עדכון עם מעקב דינמי אחר המטרה (אם עדיין חי)
  update(delta: number, combatManager: CombatManager): boolean {
    const enemyManager = (combatManager as unknown as { enemyManager: { getEnemy: (id: string) => { x: number; y: number } | undefined } }).enemyManager;
    const target = enemyManager.getEnemy(this.targetInstanceId);

    if (!target) return true; // מטרה מתה - הסרת הפרויקטיל

    const dt   = delta / 1000;
    const dist = Math.hypot(target.x - this.x, target.y - this.y);

    if (dist < 12) {
      combatManager.applyDamage({
        sourceInstanceId: this.sourceInstanceId,
        targetInstanceId: this.targetInstanceId,
        rawDamage: this.damage,
        element: this.element,
        isAoe: false,
      });
      return true;
    }

    this.x += ((target.x - this.x) / dist) * ORB_SPEED * dt;
    this.y += ((target.y - this.y) / dist) * ORB_SPEED * dt;
    return false;
  }
}
