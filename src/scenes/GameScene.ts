// סצנת המשחק הראשית - יוצרת ומתאמת את כל מנהלי המשחק בזמן ריצה
// ה-UI (HUD, Overlays) מנוהל על ידי UIScene הרצה בשכבה נפרדת

import Phaser from 'phaser';
import { EventBus } from '../core/EventBus';
import { GameRegistry } from '../core/GameRegistry';
import { Events } from '../types/EventTypes';
import { MapManager } from '../managers/MapManager';
import { PathManager } from '../managers/PathManager';
import { PlacementManager } from '../managers/PlacementManager';
import { WaveManager } from '../managers/WaveManager';
import { EnemyManager } from '../managers/EnemyManager';
import { TowerManager } from '../managers/TowerManager';
import { CombatManager } from '../managers/CombatManager';
import { ProjectileManager } from '../managers/ProjectileManager';
import { EconomyManager } from '../managers/EconomyManager';
import { LifeManager } from '../managers/LifeManager';
import { UpgradeManager } from '../managers/UpgradeManager';
import { HeroManager } from '../managers/HeroManager';
import type { ITowerDef, IHeroDef } from '../types/UnitTypes';
import type { ISlotDef } from '../types/MapTypes';

// Draws a slot rect respecting optional rotation (degrees).
// Caller must set lineStyle / fillStyle before calling.
function drawSlotShape(g: Phaser.GameObjects.Graphics, slot: ISlotDef): void {
  const { x, y, width: w, height: h } = slot.rect;
  const rot = slot.rotation ?? 0;
  if (rot === 0) {
    g.fillRect(x, y, w, h);
    g.strokeRect(x, y, w, h);
  } else {
    const r = Phaser.Math.DegToRad(rot);
    const cos = Math.cos(r), sin = Math.sin(r);
    const cx = x + w / 2, cy = y + h / 2;
    const corners: [number, number][] = [[-w/2, -h/2], [w/2, -h/2], [w/2, h/2], [-w/2, h/2]];
    const pts = corners.map(([dx, dy]) => ({
      x: cx + dx * cos - dy * sin,
      y: cy + dx * sin + dy * cos,
    }));
    g.fillPoints(pts, true);
    g.strokePoints(pts, true);
  }
}

export class GameScene extends Phaser.Scene {
  // מנהלים - נוצרים ב-create ומנוקים ב-shutdown
  private mapManager!: MapManager;
  private pathManager!: PathManager;
  private placementManager!: PlacementManager;
  private waveManager!: WaveManager;
  private enemyManager!: EnemyManager;
  private towerManager!: TowerManager;
  private combatManager!: CombatManager;
  private projectileManager!: ProjectileManager;
  private economyManager!: EconomyManager;
  private lifeManager!: LifeManager;
  private upgradeManager!: UpgradeManager;
  private heroManager!: HeroManager;

  // slot interaction graphics
  private slotGraphics!: Phaser.GameObjects.Graphics;
  private pendingPlacementDef: ITowerDef | IHeroDef | null = null;
  private isFlashActive = false;

  // range circle graphics (shown when tapping a placed tower)
  private rangeGraphics!: Phaser.GameObjects.Graphics;
  private _towerClickedThisFrame = false;

  // מהירות משחק (X1/X2/X3) - משפיעה על delta וטיימרים
  private gameSpeed: 1 | 2 | 3 = 1;

  constructor() {
    super({ key: 'GameScene' });
  }

  // אתחול: קבלת מזהה המפה מנתוני ההפעלה
  init(data: { mapId: string }): void {
    (this as unknown as { _mapId: string })._mapId = data.mapId ?? 'map_001';
  }

  // יצירה: אתחול כל המנהלים, תמונת רקע ו-UIScene
  create(): void {
    const mapId = (this as unknown as { _mapId: string })._mapId;

    // אתחול מנהלים בסדר תלות נכון
    this.mapManager       = new MapManager(this, mapId);
    this.pathManager      = new PathManager(this.mapManager);
    this.placementManager = new PlacementManager(this, this.mapManager);
    this.enemyManager     = new EnemyManager(this, this.pathManager);
    this.towerManager     = new TowerManager(this, this.enemyManager);
    this.combatManager    = new CombatManager(this.enemyManager);
    this.projectileManager= new ProjectileManager(this, this.combatManager, this.enemyManager);
    this.waveManager      = new WaveManager(this, this.enemyManager, mapId);
    this.economyManager   = new EconomyManager();
    this.lifeManager      = new LifeManager();
    this.heroManager      = new HeroManager(this, this.combatManager);
    this.upgradeManager   = new UpgradeManager(this.towerManager, this.heroManager);

    // קישור מנהלים הדורשים הפניות נוספות לאחר האתחול
    this.economyManager.setTowerManager(this.towerManager);

    // רישום מנהלים בפנקס הגלובלי לגישה חיצונית
    GameRegistry.register('mapManager',        this.mapManager);
    GameRegistry.register('pathManager',       this.pathManager);
    GameRegistry.register('placementManager',  this.placementManager);
    GameRegistry.register('enemyManager',      this.enemyManager);
    GameRegistry.register('towerManager',      this.towerManager);
    GameRegistry.register('combatManager',     this.combatManager);
    GameRegistry.register('projectileManager', this.projectileManager);
    GameRegistry.register('economyManager',    this.economyManager);
    GameRegistry.register('lifeManager',       this.lifeManager);
    GameRegistry.register('upgradeManager',    this.upgradeManager);
    GameRegistry.register('heroManager',       this.heroManager);

    // ─── תמונת רקע למפה ─────────────────────────────────────────────────────
    const bgKey = this.mapManager.getBackgroundKey();
    if (bgKey && this.textures.exists(bgKey)) {
      const { width, height } = this.scale;
      const HUD_H    = 46;
      const TRAY_H   = 90;
      const gameAreaH = height - HUD_H - TRAY_H;
      const bg = this.add.image(width / 2, HUD_H + gameAreaH / 2, bgKey).setDepth(-1);
      const scale = Math.min(width / bg.width, gameAreaH / bg.height);
      bg.setScale(scale);
    }

    // ─── clear range circle when tapping empty space ─────────────────────────
    this.input.on('pointerdown', () => {
      if (this._towerClickedThisFrame) {
        this._towerClickedThisFrame = false;
      } else {
        this.rangeGraphics.clear();
      }
    });

    // ─── range circle (below towers at depth 14) ────────────────────────────
    this.rangeGraphics = this.add.graphics().setDepth(14);

    EventBus.on(Events.TOWER_CLICKED, (p) => {
      this._towerClickedThisFrame = true;
      this.rangeGraphics.clear();
      this.rangeGraphics.lineStyle(1.5, 0xffffff, 0.45);
      this.rangeGraphics.fillStyle(0xffffff, 0.06);
      this.rangeGraphics.fillCircle(p.x, p.y, p.range);
      this.rangeGraphics.strokeCircle(p.x, p.y, p.range);
    });

    // ─── slot graphics (clean by default — highlights only during interaction) ──
    this.slotGraphics = this.add.graphics().setDepth(1);

    // store selected unit def for hover highlighting
    EventBus.on(Events.UNIT_SELECTED, (p) => {
      this.pendingPlacementDef = this.towerManager.getDef(p.unitId) ?? this.heroManager.getDef(p.unitId) ?? null;
      this.slotGraphics.clear();
    });

    EventBus.on(Events.UNIT_DESELECTED, () => {
      this.pendingPlacementDef = null;
      this.slotGraphics.clear();
    });

    // ─── hover: highlight only the slot under the pointer ────────────────────
    this.input.on('pointermove', (ptr: Phaser.Input.Pointer) => {
      if (!this.pendingPlacementDef || this.isFlashActive) return;
      const { height } = this.scale;
      if (ptr.y < 46 || ptr.y > height - 90) { this.slotGraphics.clear(); return; }
      this.slotGraphics.clear();
      const slot = this.mapManager.getAllSlots().find(s =>
        ptr.x >= s.rect.x && ptr.x <= s.rect.x + s.rect.width &&
        ptr.y >= s.rect.y && ptr.y <= s.rect.y + s.rect.height
      );
      if (!slot) return;
      const cx = slot.rect.x + slot.rect.width / 2;
      const cy = slot.rect.y + slot.rect.height / 2;
      const ok = this.placementManager.canPlace(this.pendingPlacementDef, slot.id, cx, cy);
      const color = ok ? 0x44ff44 : 0xff4444;
      this.slotGraphics.lineStyle(2, color, 0.9);
      this.slotGraphics.fillStyle(color, 0.35);
      drawSlotShape(this.slotGraphics, slot);
    });

    // ─── placement attempt: 200ms flash then resolve ──────────────────────────
    EventBus.on(Events.UNIT_PLACEMENT_ATTEMPTED, (p) => {
      const def = this.towerManager.getDef(p.unitId) ?? this.heroManager.getDef(p.unitId);
      if (!def) return;

      // ─── בדיקת יכולת כלכלית לפני הנחה ──────────────────────────────────────
      if (p.unitType === 'tower') {
        const towerDef = this.towerManager.getDef(p.unitId);
        if (towerDef && this.economyManager.getWallet().gold < towerDef.cost) {
          EventBus.emit(Events.UNIT_PLACEMENT_FAILED, { reason: 'cant_afford' });
          return;
        }
      }

      const ok = this.placementManager.tryPlaceAtPoint(def, p.unitType, p.worldX, p.worldY);

      const slot = this.mapManager.getAllSlots().find(s =>
        p.worldX >= s.rect.x && p.worldX <= s.rect.x + s.rect.width &&
        p.worldY >= s.rect.y && p.worldY <= s.rect.y + s.rect.height
      );

      if (slot) {
        const color = ok ? 0x44ff44 : 0xff4444;
        this.isFlashActive = true;
        this.slotGraphics.clear();
        this.slotGraphics.lineStyle(2, color, 0.9);
        this.slotGraphics.fillStyle(color, 0.5);
        drawSlotShape(this.slotGraphics, slot);
      }

      this.time.delayedCall(200, () => {
        this.isFlashActive = false;
        this.slotGraphics.clear();
        if (ok) {
          EventBus.emit(Events.UNIT_DESELECTED, {} as never);
        } else {
          EventBus.emit(Events.UNIT_PLACEMENT_FAILED, { reason: slot ? 'blocked' : 'no_slot' });
        }
      });
    });

    // ─── השקת UIScene בשכבה שקופה מעל ────────────────────────────────────────
    this.scene.launch('UIScene', { mapId });

    // האזנה לאירועי השהייה/המשך
    EventBus.on(Events.GAME_PAUSED,  () => this.scene.pause());
    EventBus.on(Events.GAME_RESUMED, () => this.scene.resume());

    // שינוי מהירות משחק: X1/X2/X3 — משנה delta ותיזמון טיימרים
    EventBus.on(Events.GAME_SPEED_CHANGED, (p) => {
      this.gameSpeed = p.scale;
      this.time.timeScale = p.scale;
    });

    // דחיית טיק אחד: UIScene.create() יסיים → שידור ארנק ראשוני + התחלת גל
    this.time.delayedCall(0, () => {
      this.economyManager.broadcastWallet();
      this.waveManager.startNextWave();
    });
  }

  // עדכון מסגרתי - מתרחש כל פריים
  update(_time: number, delta: number): void {
    const d = delta * this.gameSpeed;
    this.enemyManager.update(d);
    this.towerManager.update(d);
    this.projectileManager.update(d);
    this.heroManager.update(d);
  }

  // ניקוי: מנקה EventBus ופנקס — UIScene עוצרת את עצמה דרך scene.start()
  shutdown(): void {
    EventBus.clearAll();
    GameRegistry.clear();
  }
}
