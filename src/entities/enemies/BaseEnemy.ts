// Base enemy — follows a piecewise-linear Phaser.Curves.Path using arc-length parameterisation.
// t = distanceTravelled / curveLength gives uniform speed regardless of waypoint spacing.
// No perpendicular jitter — enemies stay strictly on the path centerline (never touch grass).
// Visual shape is drawn on bodyGfx by each subclass; the Rectangle is kept only as a hitbox.

import Phaser from 'phaser';
import { EventBus } from '../../core/EventBus';
import { Events } from '../../types/EventTypes';
import { EnemyHealthBar } from '../../ui/EnemyHealthBar';
import type { IEnemyDef } from '../../types/EnemyTypes';
import type { IStatusEffect } from '../../types/CombatTypes';

export abstract class BaseEnemy extends Phaser.GameObjects.Rectangle {
  readonly instanceId: string;
  readonly defId: string;
  readonly def: IEnemyDef;

  currentHP: number;
  currentShield: number;

  protected readonly curve: Phaser.Curves.Path;
  protected distanceTravelled = 0;
  protected readonly healthBar: EnemyHealthBar;
  protected speedMultiplier = 1;
  protected activeEffects: IStatusEffect[] = [];

  // Graphics object subclasses draw their visual body on (drawn once in subclass constructor)
  protected readonly bodyGfx: Phaser.GameObjects.Graphics;

  private readonly curveLength: number;
  private readonly naturalSpeedVariance: number; // 0.9–1.1× so enemies spread along the path
  private exitReached = false;

  constructor(
    scene: Phaser.Scene,
    instanceId: string,
    def: IEnemyDef,
    curve: Phaser.Curves.Path
  ) {
    super(scene, 0, 0, def.hitboxWidth, def.hitboxHeight, 0xff4444);
    this.setDepth(20).setAlpha(0); // hitbox invisible — visuals live on bodyGfx
    scene.add.existing(this);

    this.instanceId    = instanceId;
    this.defId         = def.id;
    this.def           = def;
    this.currentHP     = def.maxHP;
    this.currentShield = def.maxShield;
    this.curve                = curve;
    this.curveLength          = curve.getLength();
    this.naturalSpeedVariance = 0.9 + Math.random() * 0.2;         // 0.90 to 1.10

    // bodyGfx depth 21 = just above the invisible Rectangle (depth 20)
    this.bodyGfx = scene.add.graphics().setDepth(21);

    this.healthBar = new EnemyHealthBar(scene, 0, 0, def.maxHP, def.maxShield);
  }

  update(delta: number): void {
    if (this.exitReached) return;

    this.updateEffects(delta);

    this.distanceTravelled += (this.def.speed * this.speedMultiplier * this.naturalSpeedVariance * delta) / 1000;

    const t       = Math.min(this.distanceTravelled / this.curveLength, 1);
    const pos     = this.curve.getPoint(t);
    const tangent = this.curve.getTangent(t);
    const angle   = Math.atan2(tangent.y, tangent.x);

    // Strict path following: position is exactly getPoint(t) — no lateral offset ever.
    // The "police logic": getPoint(t) IS the nearest point on the path for this t value.
    this.setPosition(pos.x, pos.y);
    this.setRotation(angle);
    this.bodyGfx.setPosition(pos.x, pos.y).setRotation(angle);
    this.healthBar.setPosition(pos.x, pos.y);

    if (t >= 1) {
      this.exitReached = true;
      EventBus.emit(Events.ENEMY_REACHED_EXIT, {
        instanceId: this.instanceId,
        lifeDamage: this.def.lifeDamage,
      });
    }
  }

  private updateEffects(delta: number): void {
    this.speedMultiplier = 1;
    this.activeEffects = this.activeEffects.filter(eff => {
      eff.remainingMs -= delta;
      if (eff.type === 'Ice') this.speedMultiplier *= eff.multiplier;
      return eff.remainingMs > 0;
    });
  }

  addStatusEffect(effect: IStatusEffect): void {
    const existing = this.activeEffects.find(e => e.type === effect.type);
    if (existing) {
      existing.remainingMs = Math.max(existing.remainingMs, effect.durationMs);
    } else {
      this.activeEffects.push({ ...effect });
    }
  }

  destroy(fromScene?: boolean): void {
    this.bodyGfx.destroy();
    this.healthBar.destroy();
    super.destroy(fromScene);
  }
}
