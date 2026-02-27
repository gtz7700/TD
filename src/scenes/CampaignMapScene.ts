// מסך הלובי הראשי — מפת הקמפיין עם צמתי שלבים, פרופיל שחקן ופס ניווט
// מבוסס על עיצוב Gemini Hub JSON (קואורדינטות מנורמלות 0–1000 → Canvas 912×909)

import Phaser from 'phaser';
import { StarRating } from '../ui/StarRating';
import { SaveManager } from '../core/SaveManager';
import { DATA_KEYS, BG } from '../core/AssetManifest';
import { fadeIn, fadeToScene } from '../utils/SceneTransition';

// ─── ממירי קואורדינטות Gemini (0–1000) → Canvas (912×909) ──────────────────
const CX = (n: number): number => (n * 912) / 1000;
const CY = (n: number): number => (n * 909) / 1000;

type NodeState = 'completed' | 'active' | 'locked';

export class CampaignMapScene extends Phaser.Scene {
  constructor() {
    super({ key: 'CampaignMapScene' });
  }

  create(): void {
    const { width, height } = this.scale;
    const progress     = SaveManager.getProgress();
    const campaignData = this.cache.json.get(DATA_KEYS.CAMPAIGN) as {
      levels: Array<{ id: string; name: string; order: number }>;
    };
    const levels = campaignData.levels;

    fadeIn(this);

    // ─── 1. רקע — מותח לכל גודל ה-Canvas ────────────────────────────────────
    this.add.image(0, 0, BG.HUB)
      .setOrigin(0, 0)
      .setDisplaySize(width, height)
      .setDepth(0);

    // ─── Coming Soon Overlay (נוצר ראשון כדי שהניווט יוכל להפנות אליו) ──────
    const comingSoonOverlay = this.buildComingSoonOverlay(width, height);

    // ─── 2. פרופיל שחקן ───────────────────────────────────────────────────────
    // Gemini anchor: playerProfile { x: 140, y: 80 }
    this.buildPlayerProfile(CX(140), CY(80), progress.playerLevel, progress.xp);

    // ─── 3. תצוגת מטבעות (ג'ולות + זהב) — פינה ימנית עליונה ─────────────────
    this.buildCurrencyDisplay(progress.gems);

    // ─── 4. זיהוי השלב הפעיל לכפתור BATTLE ──────────────────────────────────
    // active = פתוח + 0 כוכבים. fallback → שלב פתוח ראשון
    const activeLevel = levels.find(l => {
      const lp = progress.campaignProgress[l.id];
      return (lp?.unlocked ?? false) && (lp?.stars ?? 0) === 0;
    });
    const firstUnlocked = levels.find(l => progress.campaignProgress[l.id]?.unlocked ?? false);
    const battleMapId   = activeLevel?.id ?? firstUnlocked?.id ?? levels[0]?.id ?? 'map_001';

    // ─── 5. צמתי שלבים ────────────────────────────────────────────────────────
    // Gemini progressionMap.stages (normalized):
    //   stage_1: { x: 300, y: 250 }  stage_2: { x: 420, y: 140 }  stage_3: { x: 550, y: 140 }
    const stageAnchors = [
      { x: CX(300), y: CY(250) },
      { x: CX(420), y: CY(140) },
      { x: CX(550), y: CY(140) },
    ];

    levels.forEach((level, i) => {
      const anchor = stageAnchors[i];
      if (!anchor) return;

      const lp    = progress.campaignProgress[level.id];
      const stars = (lp?.stars ?? 0) as 0 | 1 | 2 | 3;
      const state: NodeState = !(lp?.unlocked ?? false)
        ? 'locked'
        : stars > 0 ? 'completed' : 'active';

      this.buildStageNode(anchor.x, anchor.y, `${i + 1}`, level.name, state, stars, level.id);
    });

    // Boss stage — Gemini: boss_stage { x: 740, y: 765 } — נעול תמיד
    this.buildStageNode(CX(740), CY(765), '☠', 'Dragon Keep', 'locked', 0, '');

    // ─── 6. פאנלים יומיים (static placeholders) ──────────────────────────────
    this.buildDailyPanels(width);

    // ─── 7. פס ניווט תחתון ───────────────────────────────────────────────────
    this.buildNavBar(width, height, comingSoonOverlay);

    // ─── 8. כפתור BATTLE — Gemini btn_battle { x: 450, y: 900 } ─────────────
    this.buildBattleButton(CX(450), CY(862), battleMapId);
  }

  // ─── פרופיל שחקן: אווטאר + שם + רמה + XP Bar ────────────────────────────
  private buildPlayerProfile(cx: number, cy: number, level: number, xp: number): void {
    const xpMax   = level * 100;
    const xpRatio = Math.min(xp / xpMax, 1);

    // עיגול אווטאר
    this.add.circle(cx, cy, 28, 0x1a3a7a).setDepth(20);
    this.add.circle(cx, cy, 23, 0x0a1a3a).setDepth(20);
    this.add.text(cx, cy, '★', { fontSize: '18px', color: '#ffd700' })
      .setOrigin(0.5).setDepth(21);

    // שם + רמה
    const tx = cx + 36;
    this.add.text(tx, cy - 14, 'COMMANDER NADAV', {
      fontSize: '11px', fontStyle: 'bold', color: '#ffffff',
    }).setOrigin(0, 0.5).setDepth(20);

    this.add.text(tx, cy + 2, `Lv. ${level}`, {
      fontSize: '11px', color: '#ffd700',
    }).setOrigin(0, 0.5).setDepth(20);

    // XP Bar
    const BAR_W = CX(200);
    const BAR_H = 7;
    const barY  = cy + 18;

    // רקע
    this.add.rectangle(tx + BAR_W / 2, barY, BAR_W, BAR_H, 0x333333).setDepth(20);
    // מילוי
    if (xpRatio > 0) {
      this.add.rectangle(tx, barY, BAR_W * xpRatio, BAR_H, 0x00ddff)
        .setOrigin(0, 0.5).setDepth(20);
    }
    // תווית XP
    this.add.text(tx + BAR_W + 4, barY, `${xp}/${xpMax} XP`, {
      fontSize: '8px', color: '#777777',
    }).setOrigin(0, 0.5).setDepth(20);
  }

  // ─── תצוגת ג'ולות + זהב (פינה ימנית עליונה) ─────────────────────────────
  private buildCurrencyDisplay(gems: number): void {
    const right = 912 - 10;
    const PW    = 125;
    const PH    = 28;

    const drawPill = (y: number, color: number): void => {
      const g = this.add.graphics().setDepth(20);
      g.fillStyle(color, 0.88);
      g.fillRoundedRect(right - PW, y - PH / 2, PW, PH, 8);
    };

    // ג'ולות
    drawPill(CY(55), 0x112244);
    this.add.text(right - PW + 8, CY(55), '💎', { fontSize: '14px' })
      .setOrigin(0, 0.5).setDepth(21);
    this.add.text(right - PW + 30, CY(55), `${gems}`, {
      fontSize: '13px', color: '#aaeeff', fontStyle: 'bold',
    }).setOrigin(0, 0.5).setDepth(21);

    // זהב (session-only — תמיד 0 בלובי)
    drawPill(CY(92), 0x221100);
    this.add.text(right - PW + 8, CY(92), '🪙', { fontSize: '14px' })
      .setOrigin(0, 0.5).setDepth(21);
    this.add.text(right - PW + 30, CY(92), '0', {
      fontSize: '13px', color: '#ffd700', fontStyle: 'bold',
    }).setOrigin(0, 0.5).setDepth(21);
  }

  // ─── צומת שלב: עיגול + אייקון + שם + כוכבים + אנימציה + אינטראקציה ──────
  private buildStageNode(
    x: number, y: number,
    icon: string,
    name: string,
    state: NodeState,
    stars: 0 | 1 | 2 | 3,
    mapId: string,
  ): void {
    const R = 36;

    const ringColor = state === 'completed' ? 0xffd700
      : state === 'active'                  ? 0x44ffaa
      : 0x2a2a2a;

    const fillColor = state === 'locked' ? 0x111111 : 0x0d2040;

    const iconColor = state === 'completed' ? '#ffd700'
      : state === 'active'                  ? '#aaffcc'
      : '#444444';

    // טבעת + מעגל פנימי
    const ring = this.add.circle(x, y, R + 5, ringColor).setDepth(10);
    this.add.circle(x, y, R, fillColor).setDepth(10);

    // אייקון מרכזי (✓ לשלבים שהושלמו)
    const displayIcon = state === 'completed' ? '✓' : icon;
    this.add.text(x, y, displayIcon, {
      fontSize: '22px', fontStyle: 'bold', color: iconColor,
    }).setOrigin(0.5).setDepth(11);

    // שם השלב מתחת
    this.add.text(x, y + R + 10, name, {
      fontSize: '9px',
      color: state === 'locked' ? '#555555' : '#cccccc',
      backgroundColor: '#00000077',
      padding: { x: 4, y: 2 },
    }).setOrigin(0.5, 0).setDepth(11);

    // כוכבים (רק לשלבים שהושלמו)
    if (state === 'completed' && stars > 0) {
      new StarRating(this, x, y + R + 34, stars);
    }

    // אנימציית פעימה לשלב הפעיל הנוכחי
    if (state === 'active') {
      this.tweens.add({
        targets:  ring,
        scaleX:   1.15,
        scaleY:   1.15,
        duration: 750,
        yoyo:     true,
        repeat:   -1,
        ease:     'Sine.easeInOut',
      });
    }

    // אזור לחיצה (רק לשלבים פתוחים)
    if (state !== 'locked' && mapId) {
      this.add.rectangle(x, y, (R + 5) * 2, (R + 5) * 2, 0x000000, 0)
        .setDepth(12)
        .setInteractive({ useHandCursor: true })
        .on('pointerdown', () =>
          fadeToScene(this, 'GameScene', { mapId } as Record<string, unknown>)
        );
    }
  }

  // ─── פאנלים יומיים — placeholders סטטיים ────────────────────────────────
  private buildDailyPanels(width: number): void {
    // Daily Quest — שמאל תחתון
    const qx = 120, qy = CY(700);
    const qg = this.add.graphics().setDepth(20);
    qg.fillStyle(0x001122, 0.85);
    qg.fillRoundedRect(qx - 110, qy - 28, 220, 56, 8);
    this.add.text(qx, qy - 9, '📋 Daily Quest', { fontSize: '10px', color: '#ffcc44' })
      .setOrigin(0.5).setDepth(21);
    this.add.text(qx, qy + 9, 'Defeat 20 enemies: 0/20', { fontSize: '9px', color: '#888888' })
      .setOrigin(0.5).setDepth(21);

    // Daily Reward — ימין עליון
    const rx = width - 80, ry = CY(180);
    const rg = this.add.graphics().setDepth(20);
    rg.fillStyle(0x110022, 0.85);
    rg.fillRoundedRect(rx - 75, ry - 28, 150, 56, 8);
    this.add.text(rx, ry - 9, '🎁 Daily Reward', { fontSize: '10px', color: '#ffcc44' })
      .setOrigin(0.5).setDepth(21);
    this.add.text(rx, ry + 9, '⏰ 12:34:56', { fontSize: '11px', color: '#cccccc' })
      .setOrigin(0.5).setDepth(21);
  }

  // ─── פס ניווט תחתון: COMMANDERS | CAMPAIGN (active) | TOWERS ─────────────
  private buildNavBar(
    width: number,
    height: number,
    overlay: Phaser.GameObjects.Container,
  ): void {
    // Gemini nav buttons: btn_commanders { x:300, y:900 }, btn_towers { x:600, y:900 }
    const navY    = CY(900); // ~818 px
    const bgStart = CY(858); // ~779 px — תחילת רצועת הניווט

    // רצועת רקע
    const navBg = this.add.graphics().setDepth(28);
    navBg.fillStyle(0x060a10, 0.92);
    navBg.fillRect(0, bgStart, width, height - bgStart);

    // ── COMMANDERS → HeroGalleryScene ──
    const cmdBtn = this.add.text(CX(300), navY, 'COMMANDERS', {
      fontSize: '12px', fontStyle: 'bold', color: '#9999bb',
      padding: { x: 8, y: 6 },
    }).setOrigin(0.5).setDepth(30).setInteractive({ useHandCursor: true });
    cmdBtn.on('pointerover',  () => cmdBtn.setColor('#ffffff'));
    cmdBtn.on('pointerout',   () => cmdBtn.setColor('#9999bb'));
    cmdBtn.on('pointerdown',  () => fadeToScene(this, 'HeroGalleryScene'));

    // ── CAMPAIGN — מחוון "מסך נוכחי" (לא לחיץ) ──
    this.add.text(CX(450), CY(871), '▲', {
      fontSize: '8px', color: '#44ffaa',
    }).setOrigin(0.5).setDepth(30);
    this.add.text(CX(450), CY(883), 'CAMPAIGN', {
      fontSize: '10px', fontStyle: 'bold', color: '#44ffaa',
    }).setOrigin(0.5).setDepth(30);

    // ── TOWERS → Coming Soon ──
    const towBtn = this.add.text(CX(600), navY, 'TOWERS', {
      fontSize: '12px', fontStyle: 'bold', color: '#9999bb',
      padding: { x: 8, y: 6 },
    }).setOrigin(0.5).setDepth(30).setInteractive({ useHandCursor: true });
    towBtn.on('pointerover',  () => towBtn.setColor('#ffffff'));
    towBtn.on('pointerout',   () => towBtn.setColor('#9999bb'));
    towBtn.on('pointerdown',  () => overlay.setVisible(true));
  }

  // ─── כפתור BATTLE — מפעיל את השלב הפעיל האחרון ─────────────────────────
  private buildBattleButton(x: number, y: number, mapId: string): void {
    const W = 160, H = 44;
    const btn = this.add.rectangle(x, y, W, H, 0xcc1111)
      .setStrokeStyle(2, 0xff4444)
      .setDepth(30)
      .setInteractive({ useHandCursor: true });

    this.add.text(x, y, '⚔  BATTLE!', {
      fontSize: '18px', fontStyle: 'bold', color: '#ffffff',
    }).setOrigin(0.5).setDepth(31);

    btn.on('pointerover',  () => btn.setFillStyle(0xff2222));
    btn.on('pointerout',   () => btn.setFillStyle(0xcc1111));
    btn.on('pointerdown',  () =>
      fadeToScene(this, 'GameScene', { mapId } as Record<string, unknown>)
    );
  }

  // ─── Coming Soon Overlay — מוצג לכפתורי ניווט שאינם מיושמים ─────────────
  private buildComingSoonOverlay(width: number, height: number): Phaser.GameObjects.Container {
    const overlay = this.add.container(0, 0).setDepth(50).setVisible(false);

    const dim = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.78)
      .setInteractive(); // בולם קליקים על רכיבים שמאחור

    const panel = this.add.rectangle(width / 2, height / 2, 280, 120, 0x111133)
      .setStrokeStyle(2, 0x3355cc);

    const msg = this.add.text(width / 2, height / 2 - 18, '🚧 Coming Soon!', {
      fontSize: '22px', color: '#ffffff',
    }).setOrigin(0.5);

    const closeBtn = this.add.text(width / 2, height / 2 + 24, '[ OK ]', {
      fontSize: '15px', color: '#7799ff',
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    dim.on('pointerdown',      () => overlay.setVisible(false));
    closeBtn.on('pointerdown', () => overlay.setVisible(false));

    overlay.add([dim, panel, msg, closeBtn]);
    return overlay;
  }
}
