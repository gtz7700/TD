// גיבור קשת - ירי מהיר burst, canPlaceOnPath=false

import Phaser from 'phaser';
import { BaseHero } from './BaseHero';
import { UNIT_SPRITES } from '../../core/AssetManifest';
import type { CombatManager } from '../../managers/CombatManager';
import type { IHeroDef } from '../../types/UnitTypes';

export class ArcherHero extends BaseHero {
  // קשת יורה כל 2 שניות (מהיר יותר מהיכולת הרגילה)
  protected readonly abilityCooldownMax = 2000;

  // יצירת גיבור קשת - ירוק עם מסגרת זהב
  constructor(
    scene: Phaser.Scene,
    instanceId: string,
    def: IHeroDef,
    x: number, y: number
  ) {
    super(scene, instanceId, def, x, y, 0x228b22);
    this.bodySprite = scene.add.sprite(x, y, UNIT_SPRITES.ARCHER_HERO)
      .setFrame(0).setDisplaySize(48, 48).setDepth(18);
  }

  // יכולת Rapid Shot - ירי בודד לאויב הקרוב ביותר בטווח 220px
  protected activateAbility(combatManager: CombatManager): void {
    const RANGE = 220;
    const target = combatManager.getNearestEnemyInRange(this.x, this.y, RANGE);
    if (!target) return;
    combatManager.applyDamage({
      sourceInstanceId: this.instanceId,
      targetInstanceId: target.instanceId,
      rawDamage: this.def.baseDamage,
      element: 'Physical',
      isAoe: false,
    });
  }
}
