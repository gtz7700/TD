// סצנת הטעינה - טוענת את כל נכסי המשחק עם פס התקדמות

import Phaser from 'phaser';
import { DATA_KEYS } from '../core/AssetManifest';

export class PreloaderScene extends Phaser.Scene {
  private progressBar!: Phaser.GameObjects.Graphics;
  private progressBox!: Phaser.GameObjects.Graphics;

  constructor() {
    super({ key: 'PreloaderScene' });
  }

  // יצירת ממשק פס ההתקדמות לפני תחילת הטעינה
  create(): void {
    const { width, height } = this.scale;
    const cx = width / 2;
    const cy = height / 2;

    // ציור מסגרת פס ההתקדמות
    this.progressBox = this.add.graphics();
    this.progressBox.fillStyle(0x222222, 0.8);
    this.progressBox.fillRect(cx - 160, cy - 25, 320, 50);

    // פס ההתקדמות הפנימי
    this.progressBar = this.add.graphics();

    // טקסט תווית
    this.add.text(cx, cy - 50, 'Loading...', {
      fontSize: '20px', color: '#ffffff',
    }).setOrigin(0.5);

    // עדכון פס ההתקדמות בכל הורדת נכס
    this.load.on('progress', (value: number) => {
      this.progressBar.clear();
      this.progressBar.fillStyle(0xffd700, 1);
      this.progressBar.fillRect(cx - 155, cy - 20, 310 * value, 40);
    });

    this.load.on('complete', () => this.scene.start('MainMenuScene'));
    this.loadAssets();
  }

  // טעינת כל נכסי המשחק - קבצי JSON בלבד (ישויות משתמשות ב-Rectangle, לא ספרייטים)
  private loadAssets(): void {
    // כל ישויות המשחק (מגדלים, אויבים, גיבורים, פרויקטילים) ממומשות באמצעות
    // Phaser.GameObjects.Rectangle — אין צורך בקבצי PNG כרגע.
    // TODO: הוסף load.image() כאן כאשר ספרייטים אמיתיים יהיו מוכנים.

    // --- קבצי JSON ---
    this.load.json(DATA_KEYS.CAMPAIGN,       'data/maps/campaign.json');
    this.load.json(DATA_KEYS.MAP_001,        'data/maps/map_001.json');
    this.load.json(DATA_KEYS.MAP_002,        'data/maps/map_002.json');
    this.load.json(DATA_KEYS.MAP_003,        'data/maps/map_003.json');
    this.load.json(DATA_KEYS.WAVES_001,      'data/waves/waves_001.json');
    this.load.json(DATA_KEYS.WAVES_002,      'data/waves/waves_002.json');
    this.load.json(DATA_KEYS.WAVES_003,      'data/waves/waves_003.json');
    this.load.json(DATA_KEYS.ENEMIES,        'data/enemies/enemies.json');
    this.load.json(DATA_KEYS.TOWERS,         'data/units/towers.json');
    this.load.json(DATA_KEYS.HEROES,         'data/units/heroes.json');
    this.load.json(DATA_KEYS.TOWER_UPGRADES, 'data/upgrades/tower_upgrades.json');
    this.load.json(DATA_KEYS.HERO_UPGRADES,  'data/upgrades/hero_upgrades.json');

    this.load.start();
  }
}
