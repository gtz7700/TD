// גיבור קשת - ירי מהיר burst, canPlaceOnPath=false

import Phaser from 'phaser';
import { BaseHero } from './BaseHero';
import type { CombatManager } from '../../managers/CombatManager';
import type { IHeroDef } from '../../types/UnitTypes';

export class ArcherHero extends BaseHero {
  // יצירת גיבור קשת - ירוק עם מסגרת זהב
  constructor(
    scene: Phaser.Scene,
    instanceId: string,
    def: IHeroDef,
    x: number, y: number
  ) {
    super(scene, instanceId, def, x, y, 0x228b22);
  }

  // יכולת Rapid Shot - מחיל נזק על האויב הקרוב ביותר עם בונוס
  protected activateAbility(combatManager: CombatManager): void {
    // TODO: שאילתת EnemyManager לאויב הקרוב - כרגע placeholder
    void combatManager;
  }
}
