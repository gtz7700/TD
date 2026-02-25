// מנהל אויבים - מאגר, הולדה, תנועה ומחזור חיים של אויבים

import Phaser from 'phaser';
import { EventBus } from '../core/EventBus';
import { Events } from '../types/EventTypes';
import { PathManager } from './PathManager';
import { BaseEnemy } from '../entities/enemies/BaseEnemy';
import { RegularEnemy } from '../entities/enemies/RegularEnemy';
import { FastEnemy } from '../entities/enemies/FastEnemy';
import { TankEnemy } from '../entities/enemies/TankEnemy';
import { DATA_KEYS } from '../core/AssetManifest';
import type { IEnemyDef } from '../types/EnemyTypes';

export class EnemyManager {
  private readonly scene: Phaser.Scene;
  private readonly pathManager: PathManager;
  private readonly activeEnemies: Map<string, BaseEnemy> = new Map();
  private readonly enemyDefs: Map<string, IEnemyDef> = new Map();
  private spawnCounter = 0;

  // טעינת הגדרות אויבים ממטמון ה-JSON
  constructor(scene: Phaser.Scene, pathManager: PathManager) {
    this.scene = scene;
    this.pathManager = pathManager;

    const data = scene.cache.json.get(DATA_KEYS.ENEMIES) as { enemies: IEnemyDef[] };
    data.enemies.forEach(def => this.enemyDefs.set(def.id, def));

    // הסרת אויב מהרשימה לאחר שהגיע ליציאה (נזק לחיים מטופל ב-LifeManager)
    EventBus.on(Events.ENEMY_REACHED_EXIT, (p) => this.removeEnemy(p.instanceId));
  }

  // הולדת אויב חדש בנקודת כניסה נתונה
  spawn(enemyId: string, spawnNodeId: string): BaseEnemy | null {
    const def = this.enemyDefs.get(enemyId);
    if (!def) {
      console.warn(`[EnemyManager] Unknown enemy: ${enemyId}`);
      return null;
    }

    const instanceId = `enemy_${this.spawnCounter++}`;
    const route = this.pathManager.resolveRoute(spawnNodeId);
    const spawnNode = this.pathManager.routeToNodes(route)[0];

    let enemy: BaseEnemy;
    switch (def.category) {
      case 'Fast':  enemy = new FastEnemy(this.scene, instanceId, def, route, this.pathManager); break;
      case 'Tank':  enemy = new TankEnemy(this.scene, instanceId, def, route, this.pathManager); break;
      default:      enemy = new RegularEnemy(this.scene, instanceId, def, route, this.pathManager);
    }

    enemy.setPosition(spawnNode.x, spawnNode.y);
    this.activeEnemies.set(instanceId, enemy);

    EventBus.emit(Events.ENEMY_SPAWNED, {
      instanceId,
      defId: enemyId,
      currentHP: def.maxHP,
      currentShield: def.maxShield,
      currentNodeIndex: 0,
      chosenRoutePath: route,
      activeEffects: [],
      isAlive: true,
    });

    return enemy;
  }

  // עדכון כל האויבים הפעילים (נקרא מ-GameScene.update)
  update(delta: number): void {
    this.activeEnemies.forEach(enemy => enemy.update(delta));
  }

  // שליפת כל האויבים הפעילים (לשימוש מנהל מגדלים)
  getActive(): ReadonlyMap<string, BaseEnemy> {
    return this.activeEnemies;
  }

  // שליפת אויב לפי מזהה אינסטנס
  getEnemy(instanceId: string): BaseEnemy | undefined {
    return this.activeEnemies.get(instanceId);
  }

  // הסרת אויב מהרשימה הפעילה לאחר מוות
  removeEnemy(instanceId: string): void {
    const enemy = this.activeEnemies.get(instanceId);
    enemy?.destroy();
    this.activeEnemies.delete(instanceId);
  }

  // שאילתת כל האויבים בתוך רדיוס נקודה (לחישוב AOE)
  getEnemiesInRadius(cx: number, cy: number, radius: number): BaseEnemy[] {
    return [...this.activeEnemies.values()].filter(e => {
      const dx = e.x - cx;
      const dy = e.y - cy;
      return Math.hypot(dx, dy) <= radius;
    });
  }
}
