// תפריט ראשי - מסך הבית עם ניווט לכל חלקי המשחק

import Phaser from 'phaser';
import { SaveManager } from '../core/SaveManager';
import { fadeIn, fadeToScene } from '../utils/SceneTransition';

export class MainMenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MainMenuScene' });
  }

  // יצירת ממשק תפריט ראשי עם כפתורים לכל מסכי המשחק
  create(): void {
    const { width, height } = this.scale;
    const cx = width / 2;

    // fade-in חלק בכניסה
    fadeIn(this);

    // רקע
    this.add.rectangle(0, 0, width, height, 0x1a1a2e).setOrigin(0);

    // כותרת המשחק
    this.add.text(cx, 180, 'TOWER DEFENSE', {
      fontSize: '42px',
      fontStyle: 'bold',
      color: '#ffd700',
    }).setOrigin(0.5);

    // הצגת רמת שחקן ואבנים
    const { playerLevel, gems } = SaveManager.getProgress();
    this.add.text(cx, 250, `Level ${playerLevel}  ◆ ${gems}`, {
      fontSize: '18px', color: '#aaaaff',
    }).setOrigin(0.5);

    // כפתור מסע קמפיין
    this.createButton(cx, 380, 'CAMPAIGN', () => fadeToScene(this, 'CampaignMapScene'));

    // כפתור גלריית גיבורים
    this.createButton(cx, 480, 'HERO GALLERY', () => fadeToScene(this, 'HeroGalleryScene'));

    // גרסה
    this.add.text(cx, height - 30, 'v0.1.0', {
      fontSize: '12px', color: '#555555',
    }).setOrigin(0.5);
  }

  // יצירת כפתור מעוצב עם אירוע לחיצה
  private createButton(x: number, y: number, label: string, onClick: () => void): void {
    const btn = this.add.rectangle(x, y, 260, 60, 0x2d5a27)
      .setInteractive({ useHandCursor: true });

    this.add.text(x, y, label, {
      fontSize: '22px', fontStyle: 'bold', color: '#ffffff',
    }).setOrigin(0.5).setDepth(1);

    btn.on('pointerdown', onClick);
    btn.on('pointerover',  () => btn.setFillStyle(0x3d7a37));
    btn.on('pointerout',   () => btn.setFillStyle(0x2d5a27));
  }
}
