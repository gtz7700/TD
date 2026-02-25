// תצוגת זהב עם אנימציה - מציג את כמות הזהב הנוכחית

import Phaser from 'phaser';

export class GoldDisplay {
  private readonly text: Phaser.GameObjects.Text;

  // יצירת תצוגת זהב עם מיקום ראשוני
  constructor(scene: Phaser.Scene, x: number, y: number) {
    this.text = scene.add.text(x, y, '⬡ 0', {
      fontSize: '20px', color: '#ffd700', fontStyle: 'bold',
    }).setOrigin(0, 0).setDepth(50);
  }

  // עדכון ערך הזהב המוצג
  setValue(gold: number): void {
    this.text.setText(`⬡ ${gold}`);
  }
}
