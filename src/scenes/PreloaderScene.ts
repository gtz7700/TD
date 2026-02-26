// סצנת הטעינה - טוענת את כל נכסי המשחק עם פס התקדמות

import Phaser from 'phaser';
import { DATA_KEYS, BG } from '../core/AssetManifest';

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

    // מעבר לתפריט עם fade-in לאחר השלמת הטעינה
    this.load.on('complete', () => {
      this.cameras.main.fadeOut(200, 0, 0, 0);
      this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
        this.scene.start('MainMenuScene');
      });
    });

    this.loadAssets();
  }

  // טעינת כל נכסי המשחק - תמונות רקע + JSON
  private loadAssets(): void {
    // ─── תמונות רקע למפות ───────────────────────────────────────────────────
    // level-1-bg.jpg כבר הוצב ידנית ב-public/assets/images/maps/
    this.load.image(BG.FOREST, 'assets/images/maps/level-1-bg.png');
    // להוסיף כאן תמונות נוספות בעתיד:
    // this.load.image(BG.DESERT, 'assets/images/maps/level-2-bg.jpg');
    // this.load.image(BG.CAVES,  'assets/images/maps/level-3-bg.jpg');

    // ─── ספרייטים של אויבים (להחליף Rectangle כשמוכן) ──────────────────────
    // this.load.image(ENEMY_SPRITES.GOBLIN, 'assets/images/enemies/goblin.png');
    // this.load.image(ENEMY_SPRITES.SCOUT,  'assets/images/enemies/scout.png');
    // this.load.image(ENEMY_SPRITES.OGRE,   'assets/images/enemies/ogre.png');

    // ─── ספרייטים של מגדלים (להחליף Rectangle כשמוכן) ──────────────────────
    // this.load.image(TOWER_SPRITES.ARCHER,   'assets/images/towers/archer.png');
    // this.load.image(TOWER_SPRITES.MAGE,     'assets/images/towers/mage.png');
    // this.load.image(TOWER_SPRITES.CATAPULT, 'assets/images/towers/catapult.png');
    // this.load.image(TOWER_SPRITES.FREEZE,   'assets/images/towers/freeze.png');

    // ─── ספרייטים של גיבורים ─────────────────────────────────────────────────
    // this.load.image(HERO_SPRITES.WARRIOR, 'assets/images/heroes/warrior.png');
    // this.load.image(HERO_SPRITES.ARCHER,  'assets/images/heroes/archer.png');

    // ─── ספרייטים של UI ──────────────────────────────────────────────────────
    // this.load.image(UI.GOLD_ICON,  'assets/images/ui/gold.png');
    // this.load.image(UI.GEM_ICON,   'assets/images/ui/gem.png');
    // this.load.image(UI.HEART_ICON, 'assets/images/ui/heart.png');
    // this.load.image(UI.STAR_FULL,  'assets/images/ui/star-full.png');
    // this.load.image(UI.STAR_EMPTY, 'assets/images/ui/star-empty.png');

    // ─── אנימציות כ-Spritesheet (כאשר יהיו מוכנות) ──────────────────────────
    // this.load.spritesheet('enemy_goblin_anim', 'assets/spritesheets/goblin.png', { frameWidth: 48, frameHeight: 48 });

    // ─── קבצי JSON ───────────────────────────────────────────────────────────
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
