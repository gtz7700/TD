// תצוגת גרירה - ספרייט רפאים עם היסט Y מעל האצבע (mobile UX)

import Phaser from 'phaser';

const MOBILE_DRAG_Y_OFFSET = -80; // הזזת התצוגה מעל האצבע בפיקסלים

export class DragPreview {
  private readonly sprite: Phaser.GameObjects.Rectangle; // placeholder עד שיש ספרייטים
  private readonly rangeCircle: Phaser.GameObjects.Graphics;

  // יצירת ספרייט גרירה עם מעגל טווח
  constructor(scene: Phaser.Scene) {
    this.sprite = scene.add.rectangle(0, 0, 48, 48, 0xffffff, 0.6)
      .setDepth(60).setVisible(false);

    this.rangeCircle = scene.add.graphics().setDepth(55).setVisible(false);
  }

  // עדכון מיקום תצוגת הגרירה - מיישם היסט Y למעלה
  update(worldX: number, worldY: number, range: number, valid: boolean): void {
    const adjustedY = worldY + MOBILE_DRAG_Y_OFFSET;

    this.sprite.setPosition(worldX, adjustedY);
    this.sprite.setFillStyle(valid ? 0x00ff88 : 0xff4444, 0.6);
    this.sprite.setVisible(true);

    this.rangeCircle.clear();
    this.rangeCircle.lineStyle(1, valid ? 0x00ff88 : 0xff4444, 0.4);
    this.rangeCircle.strokeCircle(worldX, adjustedY, range);
    this.rangeCircle.setVisible(true);
  }

  // הסתרת תצוגת הגרירה
  hide(): void {
    this.sprite.setVisible(false);
    this.rangeCircle.setVisible(false);
  }
}
