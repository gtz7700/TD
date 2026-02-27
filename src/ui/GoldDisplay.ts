// תצוגת זהב עם פאנל רקע - מציג את כמות הזהב הנוכחית

import Phaser from 'phaser';

const PANEL_W = 130;
const PANEL_H = 36;

export class GoldDisplay {
  private readonly valueText: Phaser.GameObjects.Text;

  // יצירת פאנל זהב מעוצב עם רקע כהה וכפתור מעגלי
  constructor(scene: Phaser.Scene, x: number, y: number) {
    const container = scene.add.container(x, y).setDepth(100);

    // רקע עגול שקוף-למחצה
    const bg = scene.add.graphics();
    bg.fillStyle(0x000000, 0.65);
    bg.fillRoundedRect(0, 0, PANEL_W, PANEL_H, 6);
    bg.lineStyle(1, 0x888888, 0.8);
    bg.strokeRoundedRect(0, 0, PANEL_W, PANEL_H, 6);

    // אייקון מטבע זהב - שני עיגולים מוספים לcontainer
    const coin      = scene.add.circle(20, PANEL_H / 2, 9, 0xffd700);
    const coinInner = scene.add.circle(20, PANEL_H / 2, 6, 0xffaa00);

    // טקסט ערך
    this.valueText = scene.add.text(36, PANEL_H / 2, '0', {
      fontSize: '16px', fontStyle: 'bold', color: '#ffd700',
    }).setOrigin(0, 0.5);

    container.add([bg, coin, coinInner, this.valueText]);
  }

  // עדכון ערך הזהב המוצג — guard נגד Text שהושמד (race-condition בין סצנות)
  setValue(gold: number): void {
    if (this.valueText.active) {
      this.valueText.setText(`${gold}`);
    }
  }
}
