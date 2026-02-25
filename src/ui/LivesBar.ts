// פס חיים ויזואלי - מציג את מספר החיים שנותרו לשחקן

import Phaser from 'phaser';

export class LivesBar {
  private readonly text: Phaser.GameObjects.Text;
  private currentLives: number;

  // יצירת תצוגת חיים עם ערך התחלתי
  constructor(scene: Phaser.Scene, x: number, y: number, initialLives: number) {
    this.currentLives = initialLives;
    this.text = scene.add.text(x, y, `❤ ${initialLives}`, {
      fontSize: '20px', color: '#ff4444', fontStyle: 'bold',
    }).setOrigin(0.5, 0).setDepth(50);
  }

  // עדכון ערך החיים המוצג
  setValue(lives: number): void {
    this.currentLives = lives;
    const color = lives > 20 ? '#ff4444' : lives > 10 ? '#ffaa00' : '#ff0000';
    this.text.setColor(color).setText(`❤ ${lives}`);
  }

  // גישה לערך הנוכחי
  get value(): number { return this.currentLives; }
}
