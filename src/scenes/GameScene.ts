// סצנת המשחק הראשית - יוצרת ומתאמת את כל מנהלי המשחק בזמן ריצה

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
import { HUD } from '../ui/HUD';
import { PauseOverlay } from '../overlays/PauseOverlay';
import { ConfirmQuitOverlay } from '../overlays/ConfirmQuitOverlay';
import { WaveCompleteOverlay } from '../overlays/WaveCompleteOverlay';
import { LevelCompleteOverlay } from '../overlays/LevelCompleteOverlay';
import { LevelFailOverlay } from '../overlays/LevelFailOverlay';
import { TowerInfoOverlay } from '../overlays/TowerInfoOverlay';
import { BackButton } from '../ui/BackButton';

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

  // ממשקי משתמש (ה-overlays פעילים דרך EventBus - לא נדרשת גישה ישירה בכולם)
  private _hud!: HUD;
  private _pauseOverlay!: PauseOverlay;
  private confirmQuitOverlay!: ConfirmQuitOverlay;
  private waveCompleteOverlay!: WaveCompleteOverlay;
  private levelCompleteOverlay!: LevelCompleteOverlay;
  private levelFailOverlay!: LevelFailOverlay;
  private _towerInfoOverlay!: TowerInfoOverlay;

  constructor() {
    super({ key: 'GameScene' });
  }

  // אתחול: קבלת מזהה המפה מנתוני ההפעלה
  init(data: { mapId: string }): void {
    (this as unknown as { _mapId: string })._mapId = data.mapId ?? 'map_001';
  }

  // יצירה: אתחול כל המנהלים ורישומם, הגדרת האזנה לאירועים
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
    // heroManager נוצר לפני upgradeManager כדי שהפניה תהיה תקינה
    this.heroManager      = new HeroManager(this, this.combatManager);
    this.upgradeManager   = new UpgradeManager(this.towerManager, this.heroManager);

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

    // יצירת שכבות ממשק
    this._hud                  = new HUD(this);
    this._pauseOverlay         = new PauseOverlay(this);
    this.confirmQuitOverlay   = new ConfirmQuitOverlay(this);
    this.waveCompleteOverlay  = new WaveCompleteOverlay(this);
    this.levelCompleteOverlay = new LevelCompleteOverlay(this);
    this.levelFailOverlay     = new LevelFailOverlay(this);
    this._towerInfoOverlay     = new TowerInfoOverlay(this);

    // כפתור השהייה / יציאה
    new BackButton(this, () => this.confirmQuitOverlay.show());

    // האזנה לאירועי מצב משחק
    EventBus.on(Events.PLAYER_DEFEATED, () => this.onPlayerDefeated());
    EventBus.on(Events.LEVEL_COMPLETE,  (p) => this.onLevelComplete(p.stars, p.gemsEarned));
    EventBus.on(Events.WAVE_COMPLETE,   (p) => this.waveCompleteOverlay.show(p.waveNumber, p.goldBonus));
    EventBus.on(Events.GAME_PAUSED,     () => this.scene.pause());
    EventBus.on(Events.GAME_RESUMED,    () => this.scene.resume());

    // התחלת הגל הראשון
    this.waveManager.startNextWave();
  }

  // עדכון מסגרתי - מתרחש כל פריים
  update(_time: number, delta: number): void {
    this.enemyManager.update(delta);
    this.towerManager.update(delta);
    this.projectileManager.update(delta);
    this.heroManager.update(delta);
  }

  // טיפול בתבוסת השחקן - הצגת מסך כישלון
  private onPlayerDefeated(): void {
    const mapId = (this as unknown as { _mapId: string })._mapId;
    this.levelFailOverlay.show();
    EventBus.emit(Events.LEVEL_FAILED, { levelId: mapId });
  }

  // טיפול בהשלמת רמה - הצגת מסך הצלחה
  private onLevelComplete(stars: 1 | 2 | 3, gemsEarned: number): void {
    this.levelCompleteOverlay.show(stars, gemsEarned);
  }

  // ניקוי: מסיר את כל המאזינים ומנקה את הפנקס
  shutdown(): void {
    EventBus.clearAll();
    GameRegistry.clear();
  }
}
