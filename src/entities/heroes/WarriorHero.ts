// גיבור לוחם - canPlaceOnPath=true, יכולת Cleave (נזק AOE קרוב)

import Phaser from 'phaser';
import { BaseHero } from './BaseHero';
import { UNIT_SPRITES } from '../../core/AssetManifest';
import type { CombatManager } from '../../managers/CombatManager';
import type { IHeroDef } from '../../types/UnitTypes';

export class WarriorHero extends BaseHero {
  // יצירת לוחם - אדום כהה עם מסגרת זהב
  constructor(
    scene: Phaser.Scene,
    instanceId: string,
    def: IHeroDef,
    x: number, y: number
  ) {
    super(scene, instanceId, def, x, y, 0x8b0000);
    this.bodySprite = scene.add.sprite(x, y, UNIT_SPRITES.WARRIOR)
      .setFrame(0).setDisplaySize(48, 48).setDepth(18);
  }

  // יכולת Cleave - נזק AOE קרוב מסביב לגיבור
  protected activateAbility(combatManager: CombatManager): void {
    combatManager.applyAoe({
      center: { x: this.x, y: this.y },
      radius: 80,
      damage: this.def.baseDamage * 2,
      element: 'Physical',
      sourceInstanceId: this.instanceId,
    });
  }
}
