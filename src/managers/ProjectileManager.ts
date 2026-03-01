// מנהל פרויקטילים - מאגר ניהול טיסה ועדכון כל הפרויקטילים הפעילים

import Phaser from 'phaser';
import { CombatManager } from './CombatManager';
import { EnemyManager } from './EnemyManager';
import { BaseProjectile } from '../entities/projectiles/BaseProjectile';
import { ArrowProjectile } from '../entities/projectiles/ArrowProjectile';
import { MageOrb } from '../entities/projectiles/MageOrb';
import { CatapultBoulder } from '../entities/projectiles/CatapultBoulder';
import type { ITowerDef } from '../types/UnitTypes';
import type { BaseEnemy } from '../entities/enemies/BaseEnemy';

export class ProjectileManager {
  private readonly scene: Phaser.Scene;
  private readonly combatManager: CombatManager;
  private readonly enemyManager: EnemyManager;
  private readonly active: Set<BaseProjectile> = new Set();

  // אתחול מנהל הפרויקטילים עם הפניות לסצנה, מנהל הלחימה ומנהל האויבים
  constructor(scene: Phaser.Scene, combatManager: CombatManager, enemyManager: EnemyManager) {
    this.scene = scene;
    this.combatManager = combatManager;
    this.enemyManager = enemyManager;
  }

  // יצירת פרויקטיל מסוג המגדל ושיגורו לעבר המטרה
  spawn(
    towerDef: ITowerDef,
    towerInstanceId: string,
    fromX: number, fromY: number,
    toX: number, toY: number,
    targetInstanceId: string
  ): void {
    let proj: BaseProjectile;

    switch (towerDef.id) {
      case 'mage':
        proj = new MageOrb(this.scene, fromX, fromY, targetInstanceId, towerDef.damage, towerDef.element, towerInstanceId);
        break;
      case 'catapult':
        proj = new CatapultBoulder(this.scene, fromX, fromY, toX, toY, towerDef.damage, towerDef.element, towerDef.aoeRadius ?? 80, towerInstanceId);
        break;
      default: {
        // חץ עוקב אחרי מיקום האויב החי - נדרשת הפניה לאובייקט
        const targetEnemy = this.enemyManager.getEnemy(targetInstanceId);
        if (!targetEnemy) return; // האויב כבר מת לפני שהחץ יצא
        proj = new ArrowProjectile(this.scene, fromX, fromY, targetEnemy, towerDef.damage, towerDef.element, towerInstanceId);
      }
    }

    this.active.add(proj);
  }

  // ירי גיבור — חץ עוקב עם נזק ישיר (ללא def מגדל)
  spawnHeroArrow(
    sourceInstanceId: string,
    fromX: number, fromY: number,
    target: BaseEnemy,
    damage: number
  ): void {
    const proj = new ArrowProjectile(this.scene, fromX, fromY, target, damage, 'Physical', sourceInstanceId);
    this.active.add(proj);
  }

  // עדכון כל הפרויקטילים הפעילים (נקרא מ-GameScene.update)
  update(delta: number): void {
    const toRemove: BaseProjectile[] = [];

    this.active.forEach(proj => {
      const done = proj.update(delta, this.combatManager);
      if (done) toRemove.push(proj);
    });

    toRemove.forEach(proj => {
      proj.destroy();
      this.active.delete(proj);
    });
  }
}
