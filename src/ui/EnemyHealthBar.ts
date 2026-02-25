// פס בריאות ומגן מעל ראש האויב - עדכון דינמי בכל פגיעה

import Phaser from 'phaser';

const BAR_WIDTH = 40;
const BAR_HEIGHT = 5;
const SHIELD_OFFSET = 7; // מרחק בין פס HP לפס מגן

export class EnemyHealthBar {
  private readonly hpBg: Phaser.GameObjects.Rectangle;
  private readonly hpFill: Phaser.GameObjects.Rectangle;
  private readonly shieldBg: Phaser.GameObjects.Rectangle;
  private readonly shieldFill: Phaser.GameObjects.Rectangle;

  // יצירת פסי HP ומגן מעל נקודת עיגון
  constructor(
    scene: Phaser.Scene,
    x: number, y: number,
    maxHP: number, maxShield: number
  ) {
    const yHp     = y - 28;
    const yShield = yHp - SHIELD_OFFSET;

    // פס HP
    this.hpBg   = scene.add.rectangle(x, yHp, BAR_WIDTH, BAR_HEIGHT, 0x440000);
    this.hpFill = scene.add.rectangle(x - BAR_WIDTH / 2, yHp, BAR_WIDTH, BAR_HEIGHT, 0x00cc44).setOrigin(0, 0.5);

    // פס מגן (מוסתר אם maxShield === 0)
    this.shieldBg   = scene.add.rectangle(x, yShield, BAR_WIDTH, BAR_HEIGHT, 0x003366);
    this.shieldFill = scene.add.rectangle(x - BAR_WIDTH / 2, yShield, BAR_WIDTH, BAR_HEIGHT, 0x4499ff).setOrigin(0, 0.5);

    if (maxShield === 0) {
      this.shieldBg.setVisible(false);
      this.shieldFill.setVisible(false);
    }

    this.update(maxHP, maxHP, maxShield, maxShield);
  }

  // עדכון גרפי של שני הפסים על פי ערכים נוכחיים ומקסימום
  update(hp: number, maxHP: number, shield: number, maxShield: number): void {
    const hpRatio     = Math.max(0, hp     / maxHP);
    const shieldRatio = maxShield > 0 ? Math.max(0, shield / maxShield) : 0;

    this.hpFill.setDisplaySize(BAR_WIDTH * hpRatio, BAR_HEIGHT);
    if (maxShield > 0) {
      this.shieldFill.setDisplaySize(BAR_WIDTH * shieldRatio, BAR_HEIGHT);
    }
  }

  // עדכון מיקום כאשר האויב זזה
  setPosition(x: number, y: number): void {
    const yHp     = y - 28;
    const yShield = yHp - SHIELD_OFFSET;

    this.hpBg.setPosition(x, yHp);
    this.hpFill.setPosition(x - BAR_WIDTH / 2, yHp);
    this.shieldBg.setPosition(x, yShield);
    this.shieldFill.setPosition(x - BAR_WIDTH / 2, yShield);
  }

  // הסרה מהסצנה עם מות האויב
  destroy(): void {
    this.hpBg.destroy();
    this.hpFill.destroy();
    this.shieldBg.destroy();
    this.shieldFill.destroy();
  }
}
