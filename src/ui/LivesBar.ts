// פס חיים ויזואלי עם פאנל רקע - מציג את מספר החיים שנותרו לשחקן

import Phaser from 'phaser';

const PANEL_W = 130;
const PANEL_H = 36;

export class LivesBar {
  private readonly valueText: Phaser.GameObjects.Text;
  private readonly heartIcon: Phaser.GameObjects.Text;
  private currentLives: number;

  // יצירת פאנל חיים מעוצב עם לב ומספר חיים — x,y הם פינה שמאלית עליונה
  constructor(scene: Phaser.Scene, x: number, y: number, initialLives: number) {
    this.currentLives = initialLives;

    const container = scene.add.container(x, y).setDepth(100);

    // רקע עגול שקוף-למחצה
    const bg = scene.add.graphics();
    bg.fillStyle(0x000000, 0.65);
    bg.fillRoundedRect(0, 0, PANEL_W, PANEL_H, 6);
    bg.lineStyle(1, 0x888888, 0.8);
    bg.strokeRoundedRect(0, 0, PANEL_W, PANEL_H, 6);

    // אייקון לב (❤ טקסט במקום מעגל)
    this.heartIcon = scene.add.text(20, PANEL_H / 2, '♥', {
      fontSize: '18px', color: '#ff4444',
    }).setOrigin(0.5);

    // טקסט ערך חיים
    this.valueText = scene.add.text(36, PANEL_H / 2, `${initialLives}`, {
      fontSize: '16px', fontStyle: 'bold', color: '#ff4444',
    }).setOrigin(0, 0.5);

    container.add([bg, this.heartIcon, this.valueText]);
  }

  // עדכון ערך החיים עם שינוי צבע לפי מצב סכנה
  setValue(lives: number): void {
    this.currentLives = lives;
    const color    = lives > 20 ? 0xff4444 : lives > 10 ? 0xffaa00 : 0xff0000;
    const colorHex = lives > 20 ? '#ff4444' : lives > 10 ? '#ffaa00' : '#ff0000';

    this.heartIcon.setColor(colorHex);
    this.valueText.setColor(colorHex).setText(`${lives}`);
  }

  // גישה לערך הנוכחי
  get value(): number { return this.currentLives; }
}
