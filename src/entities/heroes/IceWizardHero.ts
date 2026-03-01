// גיבור קוסם קרח - האטת האויבים בסביבתו עם AOE קרח כל 4 שניות

import Phaser from 'phaser';
import { BaseHero } from './BaseHero';
import { UNIT_SPRITES } from '../../core/AssetManifest';
import type { CombatManager } from '../../managers/CombatManager';
import type { IHeroDef } from '../../types/UnitTypes';

export class IceWizardHero extends BaseHero {
  protected readonly abilityCooldownMax: number = 4000; // Freeze Nova כל 4 שניות

  constructor(
    scene: Phaser.Scene,
    instanceId: string,
    def: IHeroDef,
    x: number, y: number
  ) {
    super(scene, instanceId, def, x, y, 0x3399cc);
    this.bodySprite = scene.add.sprite(x, y, UNIT_SPRITES.ICE_WIZARD)
      .setFrame(2).setDisplaySize(48, 48).setDepth(10 + y * 0.05);
  }

  // Freeze Nova — נזק קרח ב-140px רדיוס, מאט אויבים
  protected activateAbility(combatManager: CombatManager): void {
    this.bodySprite.setTint(0xaaddff);
    this.scene.time.delayedCall(350, () => {
      if (this.bodySprite.active) this.bodySprite.clearTint();
    });
    combatManager.applyAoe({
      center: { x: this.x, y: this.y },
      radius: 140,
      damage: this.def.baseDamage,
      element: 'Ice',
      sourceInstanceId: this.instanceId,
    });
  }
}
