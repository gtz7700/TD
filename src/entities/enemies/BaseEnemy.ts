// Base enemy — follows a Catmull-Rom spline path using arc-length parameterisation.
// t = distanceTravelled / curveLength gives uniform speed regardless of waypoint spacing.
// Lateral spread: each enemy gets a random perpendicular offset within the road width,
// plus a slow drift so they weave naturally without ever leaving the road surface.
// Visual shape is drawn on bodyGfx by each subclass; the Rectangle is kept only as a hitbox.

import Phaser from 'phaser';
import { EventBus } from '../../core/EventBus';
import { Events } from '../../types/EventTypes';
import { EnemyHealthBar } from '../../ui/EnemyHealthBar';
import type { IEnemyDef } from '../../types/EnemyTypes';
import type { IStatusEffect } from '../../types/CombatTypes';

// קצב שינוי הסטייה הצדדית (פיקסלים לשניה) — קובע מהירות הנדנוד האורגני
const DRIFT_SPEED_PX_PER_S = 8;
// מגבלת הסטייה המקסימלית מהאופסט הראשוני (פיקסלים) — תנועה עדינה ולא יציאה מהדרך
const MAX_DRIFT_PX = 4;

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

  // Sprite subclasses create for visual body (set in each subclass constructor)
  protected bodySprite!: Phaser.GameObjects.Sprite;

  // כיוון מבט נוכחי (0=FRONT, 1=RIGHT, 2=LEFT, 3=BACK) — מעודכן בכל שינוי כיוון
  private facingDir = 1;
  // מפתח הטקסטורה לאנימציה — מוגדר ע"י setupWalkAnim() בכל תת-מחלקה
  protected animKeyBase = '';
  // מונע החלפת כיוון מהירה מדי בגבולות זווית (ms)
  private dirCooldownMs = 0;

  private readonly curveLength: number;
  private readonly naturalSpeedVariance: number; // 0.9–1.1× so enemies spread along the path
  private exitReached = false;

  // אופסט קבוע לכיוון ניצב למסלול — נקבע אקראית בעת ספאון בגבולות רוחב הדרך
  private readonly lateralOffset: number;
  // סטייה איטית נוספת מעל האופסט הראשוני — יוצרת תנועה אורגנית ומתנדנדת
  private lateralDrift = 0;

  constructor(
    scene: Phaser.Scene,
    instanceId: string,
    def: IEnemyDef,
    curve: Phaser.Curves.Path,
    roadHalfWidthPx = 0
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
    this.naturalSpeedVariance = 0.7 + Math.random() * 0.6; // 0.70 to 1.30 — spreads enemies along path

    // אופסט צדדי: אקראי בטווח ±70% מרוחב חצי-הדרך כדי להשאיר שוליים מהקצה
    this.lateralOffset = roadHalfWidthPx > 0
      ? (Math.random() * 2 - 1) * roadHalfWidthPx * 0.4
      : 0;

    this.healthBar = new EnemyHealthBar(scene, 0, 0, def.maxHP, def.maxShield);
  }

  update(delta: number): void {
    if (this.exitReached) return;

    this.updateEffects(delta);

    this.distanceTravelled += (this.def.speed * this.speedMultiplier * this.naturalSpeedVariance * delta) / 1000;

    const t       = Math.min(this.distanceTravelled / this.curveLength, 1);
    const center  = this.curve.getPoint(t);
    const tangent = this.curve.getTangent(t);
    const angle   = Math.atan2(tangent.y, tangent.x);

    // עדכון הסטייה האיטית — random walk מוגבל בטווח MAX_DRIFT_PX
    const driftDelta = (Math.random() - 0.5) * DRIFT_SPEED_PX_PER_S * (delta / 1000);
    this.lateralDrift = Phaser.Math.Clamp(
      this.lateralDrift + driftDelta,
      -MAX_DRIFT_PX,
      MAX_DRIFT_PX
    );

    // וקטור ניצב לכיוון התנועה (סיבוב 90° של הטנגנט)
    const perpX = -tangent.y;
    const perpY =  tangent.x;

    // מיקום סופי = מרכז + אופסט קבוע + סטייה איטית
    const totalOffset = this.lateralOffset + this.lateralDrift;
    const pos = {
      x: center.x + perpX * totalOffset,
      y: center.y + perpY * totalOffset,
    };

    // מיפוי הזווית ל-4 כיוונים עם אזור רחב יותר (55°) ועיכוב החלפה (400ms)
    // DIAG=55° מונע הבהוב בגבולות: קטעים אלכסוניים קלים נשארים RIGHT/LEFT
    const DIAG = Math.PI * 11 / 36; // 55°
    const newDir = angle >= -DIAG && angle < DIAG               ? 1  // RIGHT
                 : angle >= DIAG  && angle < Math.PI - DIAG     ? 0  // FRONT (ירידה)
                 : angle < -DIAG  && angle >= -(Math.PI - DIAG) ? 3  // BACK (עלייה)
                 : 2;                                                  // LEFT

    this.dirCooldownMs = Math.max(0, this.dirCooldownMs - delta);
    if (newDir !== this.facingDir && this.animKeyBase && this.dirCooldownMs <= 0) {
      this.facingDir = newDir;
      this.dirCooldownMs = 400;
      this.bodySprite.play(`${this.animKeyBase}_walk_${newDir}`, true);
    }

    this.setPosition(pos.x, pos.y);
    this.bodySprite.setPosition(pos.x, pos.y); // ללא setRotation — הכיוון מנוהל ע"י frames
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

  // יצירת אנימציות הליכה (2 פריימים: idle+walk) לכל 4 כיוונים
  // נקרא ע"י תת-מחלקות מיד אחרי יצירת bodySprite
  protected setupWalkAnim(textureKey: string): void {
    this.animKeyBase = textureKey;
    for (let dir = 0; dir < 4; dir++) {
      const key = `${textureKey}_walk_${dir}`;
      if (!this.scene.anims.exists(key)) {
        this.scene.anims.create({
          key,
          frames: [
            { key: textureKey, frame: dir * 2 },      // idle-dir  (col dir*2)
            { key: textureKey, frame: dir * 2 + 1 },  // walk-dir  (col dir*2+1)
          ],
          frameRate: 6,
          repeat: -1,
        });
      }
    }
    this.bodySprite.play(`${textureKey}_walk_1`); // מתחיל פניה ימינה
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
    this.bodySprite.destroy();
    this.healthBar.destroy();
    super.destroy(fromScene);
  }
}
