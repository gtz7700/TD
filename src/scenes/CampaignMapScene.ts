// מסך בחירת רמה - מפת קמפיין עם מצב נעילה וכוכבים

import Phaser from 'phaser';
import { BackButton } from '../ui/BackButton';
import { StarRating } from '../ui/StarRating';
import { SaveManager } from '../core/SaveManager';
import { DATA_KEYS } from '../core/AssetManifest';
import { fadeIn, fadeToScene } from '../utils/SceneTransition';

export class CampaignMapScene extends Phaser.Scene {
  constructor() {
    super({ key: 'CampaignMapScene' });
  }

  // יצירת מסך בחירת רמה עם כפתורי רמות ומידע על התקדמות
  create(): void {
    const { width, height } = this.scale;
    const progress = SaveManager.getProgress();

    // fade-in חלק בכניסה
    fadeIn(this);

    // רקע
    this.add.rectangle(0, 0, width, height, 0x0d1117).setOrigin(0);

    // כותרת
    this.add.text(width / 2, 60, 'CAMPAIGN', {
      fontSize: '32px', fontStyle: 'bold', color: '#ffd700',
    }).setOrigin(0.5);

    // כפתור חזרה לתפריט הראשי עם fade
    new BackButton(this, () => fadeToScene(this, 'MainMenuScene'));

    // רשימת הרמות מקובץ JSON
    const campaignData = this.cache.json.get(DATA_KEYS.CAMPAIGN) as {
      levels: Array<{ id: string; name: string; order: number }>;
    };

    campaignData.levels.forEach((level, i) => {
      const levelProgress = progress.campaignProgress[level.id];
      const isUnlocked = levelProgress?.unlocked ?? false;
      const stars = (levelProgress?.stars ?? 0) as 0 | 1 | 2 | 3;
      const yPos = 200 + i * 180;

      this.createLevelNode(width / 2, yPos, level.name, isUnlocked, stars, level.id);
    });
  }

  // יצירת צומת רמה בודדת - נעולה/פתוחה עם כוכבים וכפתור כניסה
  private createLevelNode(
    x: number, y: number,
    name: string,
    unlocked: boolean,
    stars: 0 | 1 | 2 | 3,
    mapId: string
  ): void {
    const color = unlocked ? 0x1e3a5f : 0x333333;
    const btn = this.add.rectangle(x, y, 300, 140, color, 1)
      .setStrokeStyle(2, unlocked ? 0x4a90d9 : 0x555555);

    this.add.text(x, y - 30, name, {
      fontSize: '20px', color: unlocked ? '#ffffff' : '#666666',
    }).setOrigin(0.5);

    if (!unlocked) {
      this.add.text(x, y + 20, '🔒 LOCKED', {
        fontSize: '16px', color: '#666666',
      }).setOrigin(0.5);
      return;
    }

    // הצגת כוכבים לרמות פתוחות
    new StarRating(this, x, y + 25, stars);

    // לחיצה מפעילה את GameScene עם fade חלק
    btn.setInteractive({ useHandCursor: true });
    btn.on('pointerdown', () =>
      fadeToScene(this, 'GameScene', { mapId } as Record<string, unknown>)
    );
    btn.on('pointerover',  () => btn.setFillStyle(0x2a4a6f));
    btn.on('pointerout',   () => btn.setFillStyle(0x1e3a5f));
  }
}
