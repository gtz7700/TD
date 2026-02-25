// מנהל מגדלים - מחזיק את כל המגדלים המונחים ומנהל את מחזור הירי שלהם

import Phaser from 'phaser';
import { EventBus } from '../core/EventBus';
import { Events } from '../types/EventTypes';
import { EnemyManager } from './EnemyManager';
import { BaseTower } from '../entities/towers/BaseTower';
import { ArcherTower } from '../entities/towers/ArcherTower';
import { MageTower } from '../entities/towers/MageTower';
import { CatapultTower } from '../entities/towers/CatapultTower';
import { FreezeTower } from '../entities/towers/FreezeTower';
import { DATA_KEYS } from '../core/AssetManifest';
import type { ITowerDef } from '../types/UnitTypes';

export class TowerManager {
  private readonly scene: Phaser.Scene;
  private readonly enemyManager: EnemyManager;
  private readonly towers: Map<string, BaseTower> = new Map();
  private readonly towerDefs: Map<string, ITowerDef> = new Map();

  // טעינת הגדרות מגדלים ורישום האזנה לאירועי הנחה/מכירה
  constructor(scene: Phaser.Scene, enemyManager: EnemyManager) {
    this.scene = scene;
    this.enemyManager = enemyManager;

    const data = scene.cache.json.get(DATA_KEYS.TOWERS) as { towers: ITowerDef[] };
    data.towers.forEach(def => this.towerDefs.set(def.id, def));

    // הוספת מגדל חדש עם הנחה
    EventBus.on(Events.UNIT_PLACED, (p) => {
      if (p.unitType === 'tower') this.placeTower(p.instanceId, p.unitId, p.worldX, p.worldY);
    });

    // הסרת מגדל ממכירה
    EventBus.on(Events.TOWER_SOLD, (p) => this.removeTower(p.instanceId));
  }

  // יצירת אינסטנס מגדל מהסוג המתאים ורישומו
  private placeTower(instanceId: string, towerId: string, x: number, y: number): void {
    const def = this.towerDefs.get(towerId);
    if (!def) return;

    let tower: BaseTower;
    switch (towerId) {
      case 'mage':     tower = new MageTower(this.scene, instanceId, def, x, y);    break;
      case 'catapult': tower = new CatapultTower(this.scene, instanceId, def, x, y); break;
      case 'freeze':   tower = new FreezeTower(this.scene, instanceId, def, x, y);  break;
      default:         tower = new ArcherTower(this.scene, instanceId, def, x, y);
    }

    this.towers.set(instanceId, tower);
  }

  // הסרת מגדל מהרשימה
  private removeTower(instanceId: string): void {
    const tower = this.towers.get(instanceId);
    tower?.destroy();
    this.towers.delete(instanceId);
  }

  // עדכון כל המגדלים - ירי כשמגיע זמן (נקרא מ-GameScene.update)
  update(delta: number): void {
    this.towers.forEach(tower => tower.update(delta, this.enemyManager));
  }

  // שליפת מגדל לפי מזהה (לשדרוגים)
  getTower(instanceId: string): BaseTower | undefined {
    return this.towers.get(instanceId);
  }

  // שליפת הגדרת מגדל לפי סוג
  getDef(towerId: string): ITowerDef | undefined {
    return this.towerDefs.get(towerId);
  }
}
