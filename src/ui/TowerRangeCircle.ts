// עיגול טווח מגדל - מוצג בבחירה ובגרירה של מגדל

import Phaser from 'phaser';

export class TowerRangeCircle {
  private readonly circle: Phaser.GameObjects.Graphics;

  // יצירת עיגול טווח שקוף
  constructor(scene: Phaser.Scene) {
    this.circle = scene.add.graphics().setDepth(30).setVisible(false);
  }

  // הצגת עיגול הטווח בנקודה נתונה עם רדיוס מסוים
  show(x: number, y: number, radius: number): void {
    this.circle.clear();
    this.circle.lineStyle(2, 0xffffff, 0.5);
    this.circle.strokeCircle(x, y, radius);
    this.circle.fillStyle(0xffffff, 0.05);
    this.circle.fillCircle(x, y, radius);
    this.circle.setVisible(true);
  }

  // הסתרת עיגול הטווח
  hide(): void {
    this.circle.setVisible(false);
  }
}
