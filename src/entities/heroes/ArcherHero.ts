// גיבור קשת - ירי חץ עוקב לאויב הקרוב, canPlaceOnPath=false

import Phaser from 'phaser';
import { BaseHero } from './BaseHero';
import { UNIT_SPRITES } from '../../core/AssetManifest';
import { GameRegistry } from '../../core/GameRegistry';
import type { CombatManager } from '../../managers/CombatManager';
import type { ProjectileManager } from '../../managers/ProjectileManager';
import type { IHeroDef } from '../../types/UnitTypes';

export class ArcherHero extends BaseHero {
  // הקשת יורה כל 2 שניות (מהיר מהיכולת הרגילה)
  protected readonly abilityCooldownMax: number = 2000;

  constructor(
    scene: Phaser.Scene,
    instanceId: string,
    def: IHeroDef,
    x: number, y: number
  ) {
    super(scene, instanceId, def, x, y, 0x228b22);
    this.bodySprite = scene.add.sprite(x, y, UNIT_SPRITES.ARCHER_HERO)
      .setFrame(2).setDisplaySize(48, 48).setDepth(10 + y * 0.05); // y-sort
  }

  // Rapid Shot — מוצא את האויב הקרוב ביותר בטווח ומשגר חץ ויזואלי
  protected activateAbility(combatManager: CombatManager): void {
    const RANGE = 220;
    const target = combatManager.getNearestEnemyInRange(this.x, this.y, RANGE);
    if (!target) return;

    // בהבהוב זהוב קצר = אנימציית ירי
    this.bodySprite.setTint(0xffee44);
    this.scene.time.delayedCall(200, () => {
      if (this.bodySprite.active) this.bodySprite.clearTint();
    });

    // חץ ויזואלי — הנזק מוחל על ידי ArrowProjectile בפגיעה
    const pm = GameRegistry.get<ProjectileManager>('projectileManager');
    if (pm) pm.spawnHeroArrow(this.instanceId, this.x, this.y, target, this.def.baseDamage);
  }
}
