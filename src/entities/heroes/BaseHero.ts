// גיבור בסיס - מחלקה מופשטת עם יכולת מיוחדת וסטטיסטיקות

import Phaser from 'phaser';
import type { CombatManager } from '../../managers/CombatManager';
import type { IHeroDef } from '../../types/UnitTypes';

export abstract class BaseHero extends Phaser.GameObjects.Rectangle {
  readonly instanceId: string;
  readonly def: IHeroDef;

  protected currentHP: number;
  protected abilityCooldown = 0; // מצבר זמן לצינון יכולת
  protected readonly abilityCooldownMax: number = 8000; // 8 שניות בסיס

  // Sprite providing the visual — set by each subclass constructor
  protected bodySprite!: Phaser.GameObjects.Sprite;

  // אתחול גיבור עם HP בסיסי ומשתני יכולת
  constructor(
    scene: Phaser.Scene,
    instanceId: string,
    def: IHeroDef,
    x: number, y: number,
    color: number
  ) {
    super(scene, x, y, def.hitboxWidth, def.hitboxHeight, color);
    this.setDepth(18).setAlpha(0); // hitbox invisible — sprite provides visuals
    scene.add.existing(this);

    this.instanceId = instanceId;
    this.def        = def;
    this.currentHP  = def.baseHP;
  }

  // עדכון מסגרתי - הפעלת יכולת כשהצינון מסתיים
  update(delta: number, combatManager: CombatManager): void {
    this.abilityCooldown += delta;
    if (this.abilityCooldown >= this.abilityCooldownMax) {
      this.abilityCooldown = 0;
      this.activateAbility(combatManager);
    }
  }

  // הפעלת יכולת מיוחדת - ממומשת בתתי-מחלקות
  protected abstract activateAbility(combatManager: CombatManager): void;

  destroy(fromScene?: boolean): void {
    this.bodySprite?.destroy();
    super.destroy(fromScene);
  }
}
