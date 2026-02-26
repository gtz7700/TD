// סצנת ממשק משתמש - רצה במקביל ל-GameScene ומכילה את כל ה-HUD וה-Overlays
// מצלמה שקופה כך שעולם המשחק (GameScene) נראה מבעד

import Phaser from 'phaser';
import { EventBus } from '../core/EventBus';
import { Events } from '../types/EventTypes';
import { HUD } from '../ui/HUD';
import { UnitTray, TRAY_HEIGHT } from '../ui/UnitTray';
import { PauseButton } from '../ui/PauseButton';
import { PauseOverlay } from '../overlays/PauseOverlay';
import { WaveCompleteOverlay } from '../overlays/WaveCompleteOverlay';
import { LevelCompleteOverlay } from '../overlays/LevelCompleteOverlay';
import { LevelFailOverlay } from '../overlays/LevelFailOverlay';
import { TowerInfoOverlay } from '../overlays/TowerInfoOverlay';

const HUD_HEIGHT = 46;

export class UIScene extends Phaser.Scene {
  private _mapId = 'map_001';
  private pauseOverlay!: PauseOverlay;
  private unitTray!: UnitTray;
  private pendingUnitId: string | null = null;
  private pendingUnitType: 'tower' | 'hero' = 'tower';
  private hintText!: Phaser.GameObjects.Text;

  constructor() {
    super({ key: 'UIScene' });
  }

  // קבלת מזהה המפה הנוכחית מ-GameScene
  init(data: { mapId: string }): void {
    this._mapId = data.mapId ?? 'map_001';
  }

  // יצירת כל רכיבי ה-UI המרחפים מעל עולם המשחק
  create(): void {
    const { width, height } = this.scale;

    // מצלמה שקופה - אין רקע, GameScene נראה מבעד
    this.cameras.main.transparent = true;

    // HUD: זהב / חיים / גל
    new HUD(this);

    // כפתור השהייה קטן - פינה ימנית עליונה
    this.pauseOverlay = new PauseOverlay(this);
    new PauseButton(this, () => this.pauseOverlay.show());

    // כל ה-Overlays (מנויים לאירועים עצמאית)
    new WaveCompleteOverlay(this);
    new LevelCompleteOverlay(this);
    new LevelFailOverlay(this);
    new TowerInfoOverlay(this);

    // מגש בחירת יחידות בתחתית
    this.unitTray = new UnitTray(this);

    // טקסט רמז: מוצג כשיחידה נבחרת
    this.hintText = this.add.text(width / 2, height - TRAY_HEIGHT - 10, 'Tap a building slot to place  •  Tap card again to cancel', {
      fontSize: '11px', color: '#ffff88',
      backgroundColor: '#00000077', padding: { x: 6, y: 3 },
    }).setOrigin(0.5, 1).setDepth(115).setVisible(false);

    // fade-in בכניסה לסצנה
    this.cameras.main.fadeIn(300, 0, 0, 0);

    // ─── האזנה לבחירת יחידה מהמגש ─────────────────────────────────────────
    EventBus.on(Events.UNIT_SELECTED, (p) => {
      this.pendingUnitId   = p.unitId;
      this.pendingUnitType = p.unitType;
      this.hintText.setVisible(true);
    });

    // ─── האזנה לביטול בחירה ─────────────────────────────────────────────────
    EventBus.on(Events.UNIT_DESELECTED, () => {
      this.pendingUnitId = null;
      this.hintText.setVisible(false);
      this.unitTray.clearSelection();
    });

    // ─── לאחר הנחה מוצלחת - ניקוי בחירה ─────────────────────────────────────
    EventBus.on(Events.UNIT_PLACED, () => {
      this.pendingUnitId = null;
      this.hintText.setVisible(false);
      this.unitTray.clearSelection();
    });

    // ─── ניווט בין סצנות ─────────────────────────────────────────────────────
    EventBus.on(Events.UI_NAVIGATE_REQUEST, (p) => this.handleNavigate(p.sceneKey));
    EventBus.on(Events.GAME_RETRY_REQUESTED, () => this.handleRetry());

    // ─── נגיעה על המפה - הנחת יחידה שנבחרה ──────────────────────────────────
    this.input.on('pointerdown', (ptr: Phaser.Input.Pointer) => {
      if (!this.pendingUnitId) return;
      if (ptr.y >= height - TRAY_HEIGHT) return; // נגיעה במגש עצמו
      if (ptr.y <= HUD_HEIGHT) return;            // נגיעה ב-HUD
      EventBus.emit(Events.UNIT_PLACEMENT_ATTEMPTED, {
        unitId:   this.pendingUnitId,
        unitType: this.pendingUnitType,
        worldX:   ptr.x,
        worldY:   ptr.y,
      });
    });
  }

  // מעבר לסצנה אחרת - עוצר GameScene ועושה fade החוצה
  private handleNavigate(sceneKey: string): void {
    const gameScene = this.scene.get('GameScene');
    if (gameScene?.scene.isActive()) {
      gameScene.scene.stop();
    }
    this.cameras.main.fadeOut(300, 0, 0, 0);
    this.cameras.main.once(
      Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE,
      () => this.scene.start(sceneKey),
    );
  }

  // הפעלה מחדש של הרמה
  private handleRetry(): void {
    const mapId = this._mapId;
    this.scene.stop();
    this.scene.stop('GameScene');
    this.scene.start('GameScene', { mapId });
  }
}
