// מנהל גיבורים - מנהל מחזור חיים, יכולות וטיקים של גיבורים מונחים

import Phaser from 'phaser';
import { EventBus } from '../core/EventBus';
import { Events } from '../types/EventTypes';
import { CombatManager } from './CombatManager';
import { BaseHero } from '../entities/heroes/BaseHero';
import { WarriorHero } from '../entities/heroes/WarriorHero';
import { ArcherHero } from '../entities/heroes/ArcherHero';
import { DATA_KEYS } from '../core/AssetManifest';
import type { IHeroDef } from '../types/UnitTypes';

export class HeroManager {
  private readonly scene: Phaser.Scene;
  private readonly combatManager: CombatManager;
  private readonly heroes: Map<string, BaseHero> = new Map();
  private readonly heroDefs: Map<string, IHeroDef> = new Map();

  // טעינת הגדרות גיבורים ורישום אירוע הנחה
  constructor(scene: Phaser.Scene, combatManager: CombatManager) {
    this.scene = scene;
    this.combatManager = combatManager;

    const data = scene.cache.json.get(DATA_KEYS.HEROES) as { heroes: IHeroDef[] };
    data.heroes.forEach(def => this.heroDefs.set(def.id, def));

    EventBus.on(Events.UNIT_PLACED, (p) => {
      if (p.unitType === 'hero') this.placeHero(p.instanceId, p.unitId, p.worldX, p.worldY);
    });

    EventBus.on(Events.UNIT_REMOVED, (p) => {
      if (this.heroes.has(p.instanceId)) this.removeHero(p.instanceId);
    });
  }

  // יצירת אינסטנס גיבור ורישומו
  private placeHero(instanceId: string, heroId: string, x: number, y: number): void {
    const def = this.heroDefs.get(heroId);
    if (!def) return;

    let hero: BaseHero;
    switch (heroId) {
      case 'archer_hero': hero = new ArcherHero(this.scene, instanceId, def, x, y); break;
      default:            hero = new WarriorHero(this.scene, instanceId, def, x, y);
    }

    this.heroes.set(instanceId, hero);
  }

  // הסרת גיבור
  private removeHero(instanceId: string): void {
    this.heroes.get(instanceId)?.destroy();
    this.heroes.delete(instanceId);
  }

  // עדכון כל הגיבורים (נקרא מ-GameScene.update)
  update(delta: number): void {
    this.heroes.forEach(hero => hero.update(delta, this.combatManager));
  }

  // שליפת גיבור לפי מזהה
  getHero(instanceId: string): BaseHero | undefined {
    return this.heroes.get(instanceId);
  }
}
