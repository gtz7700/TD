// סצנת הטעינה - טוענת את כל נכסי המשחק עם פס התקדמות

import Phaser from 'phaser';
import { DATA_KEYS, BG, UNIT_SPRITES } from '../core/AssetManifest';

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
    // לפני המעבר: עיבוד שקיפות לכל הספרייטשיטים (הסרת רקע לבן)
    this.load.on('complete', () => {
      Object.values(UNIT_SPRITES).forEach(key => this.makeTransparent(key, 172, 192));
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
    this.load.image(BG.HUB,    'assets/images/maps/Main Hub.png');
    // להוסיף כאן תמונות נוספות בעתיד:
    // this.load.image(BG.DESERT, 'assets/images/maps/level-2-bg.jpg');
    // this.load.image(BG.CAVES,  'assets/images/maps/level-3-bg.jpg');

    // ─── ספרייטשיטים (172×192 פיקסל לפריים, רשת 8×4: כל עמודה = דמות אחת) ─────
    // layout: col0=FRONT_idle, col1=FRONT_walk, col2=RIGHT_idle, col3=RIGHT_walk,
    //         col4=LEFT_idle,  col5=LEFT_walk,  col6=BACK_idle,  col7=BACK_walk
    // frame = row*8+col | walk-RIGHT_idle=2, walk-RIGHT_walk=3
    const SS = { frameWidth: 172, frameHeight: 192 };
    this.load.spritesheet(UNIT_SPRITES.ARCHER_HERO, 'assets/images/heros/Archer sprites.png', SS);
    this.load.spritesheet(UNIT_SPRITES.WARRIOR,     'assets/images/heros/thunder wizzard sprites.png', SS);
    this.load.spritesheet(UNIT_SPRITES.GOBLIN,      'assets/images/enemy/Goblin Sprite.png', SS);
    this.load.spritesheet(UNIT_SPRITES.WOLF,        'assets/images/enemy/wolf sprites.png', SS);
    this.load.spritesheet(UNIT_SPRITES.RINO,        'assets/images/enemy/rino sprites.png', SS);
    this.load.spritesheet(UNIT_SPRITES.RABBIT,      'assets/images/enemy/Rabbit sprites.png', SS);
    this.load.spritesheet(UNIT_SPRITES.ICE_WIZARD,  'assets/images/heros/ice wizzard sptires.png', SS);

    // ─── ספרייטים של מגדלים (להחליף Rectangle כשמוכן) ──────────────────────
    // this.load.image(TOWER_SPRITES.ARCHER,   'assets/images/towers/archer.png');
    // this.load.image(TOWER_SPRITES.MAGE,     'assets/images/towers/mage.png');
    // this.load.image(TOWER_SPRITES.CATAPULT, 'assets/images/towers/catapult.png');
    // this.load.image(TOWER_SPRITES.FREEZE,   'assets/images/towers/freeze.png');

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

  // הסרת רקע לבן/אפור מספרייטשיט — מאפשר עיבוד pixel-level לאחר הטעינה
  // עובד על ידי יצירת Canvas, שינוי פיקסלים בהירים לשקופים, והחלפת הטקסטורה
  private makeTransparent(key: string, fw: number, fh: number): void {
    const texture = this.textures.get(key);
    if (!texture) return;
    const src = texture.source[0];
    const canvas = document.createElement('canvas');
    canvas.width = src.width; canvas.height = src.height;
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(src.image as HTMLImageElement, 0, 0);
    const id = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const d = id.data;
    for (let i = 0; i < d.length; i += 4) {
      if (d[i] > 200 && d[i + 1] > 200 && d[i + 2] > 200) d[i + 3] = 0;
    }
    ctx.putImageData(id, 0, 0);
    this.textures.remove(key);
    // Phaser's JS runtime accepts HTMLCanvasElement; cast needed for TS types
    this.textures.addSpriteSheet(key, canvas as unknown as HTMLImageElement, { frameWidth: fw, frameHeight: fh });
  }
}
