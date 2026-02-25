// פרויקטיל בסיס - מחלקה מופשטת עם מיקום, בעלות ונתיב

import Phaser from 'phaser';
import type { CombatManager } from '../../managers/CombatManager';
import type { ElementType } from '../../types/UnitTypes';

export abstract class BaseProjectile extends Phaser.GameObjects.Rectangle {
  protected readonly sourceInstanceId: string;
  protected readonly damage: number;
  protected readonly element: ElementType;
  protected done = false;

  // אתחול פרויקטיל עם נתוני מקור ונזק
  constructor(
    scene: Phaser.Scene,
    x: number, y: number,
    damage: number,
    element: ElementType,
    sourceInstanceId: string,
    color: number,
    size = 8
  ) {
    super(scene, x, y, size, size, color);
    this.setDepth(35);
    scene.add.existing(this);

    this.sourceInstanceId = sourceInstanceId;
    this.damage = damage;
    this.element = element;
  }

  // עדכון מסגרתי - מחזיר true כשהפרויקטיל הגיע למטרה/פג תוקף
  abstract update(delta: number, combatManager: CombatManager): boolean;
}
