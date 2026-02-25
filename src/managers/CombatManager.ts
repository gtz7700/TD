// מנהל לחימה - מעבד נזק (מגן ראשון, אחר כך HP), אפקטי אלמנטים ו-AOE

import { EventBus } from '../core/EventBus';
import { Events } from '../types/EventTypes';
import { EnemyManager } from './EnemyManager';
import { getStatusEffect, getDamageMultiplier } from '../utils/ElementUtils';
import type { IDamageEvent, IHitResult } from '../types/CombatTypes';

export class CombatManager {
  private readonly enemyManager: EnemyManager;

  // רישום מנהל האויבים לשאילתת מצב בזמן עיבוד נזק
  constructor(enemyManager: EnemyManager) {
    this.enemyManager = enemyManager;
  }

  // עיבוד אירוע נזק: חישוב ספיגת מגן, ניכוי HP ואפקט סטטוס
  applyDamage(event: IDamageEvent): IHitResult {
    const enemy = this.enemyManager.getEnemy(event.targetInstanceId);
    if (!enemy) return { shieldAbsorbed: 0, hpDamaged: 0, overkill: 0, enemyDied: false };

    // מכפיל אלמנטלי
    const multiplier = getDamageMultiplier(event.element, 'Physical'); // TODO: נגזר מ-enemy type
    const totalDamage = Math.round(event.rawDamage * multiplier);

    // חישוב ספיגת מגן
    const shieldAbsorbed = Math.min(enemy.currentShield, totalDamage);
    const remainingDamage = totalDamage - shieldAbsorbed;
    const hpDamaged = Math.min(enemy.currentHP, remainingDamage);
    const overkill = remainingDamage - hpDamaged;

    // עדכון ערכי האויב
    enemy.currentShield -= shieldAbsorbed;
    enemy.currentHP -= hpDamaged;

    // החלת אפקט סטטוס אלמנטלי
    const statusEffect = getStatusEffect(event.element);
    if (statusEffect) {
      enemy.addStatusEffect(statusEffect);
      EventBus.emit(Events.STATUS_EFFECT_APPLIED, {
        enemyInstanceId: event.targetInstanceId,
        effect: statusEffect,
      });
    }

    const result: IHitResult = {
      shieldAbsorbed,
      hpDamaged,
      overkill,
      enemyDied: enemy.currentHP <= 0,
      statusApplied: statusEffect ?? undefined,
    };

    EventBus.emit(Events.ENEMY_DAMAGED, { enemyInstanceId: event.targetInstanceId, result });

    // טיפול במות האויב
    if (result.enemyDied) {
      EventBus.emit(Events.ENEMY_DIED, {
        instanceId: event.targetInstanceId,
        defId: enemy.defId,
        worldX: enemy.x,
        worldY: enemy.y,
      });
      this.enemyManager.removeEnemy(event.targetInstanceId);
    }

    return result;
  }

  // נזק AOE - מחיל נזק על כל אויב ברדיוס
  applyAoe(aoe: import('../types/CombatTypes').AoePayload): void {
    const targets = this.enemyManager.getEnemiesInRadius(aoe.center.x, aoe.center.y, aoe.radius);
    targets.forEach(enemy => {
      this.applyDamage({
        sourceInstanceId: aoe.sourceInstanceId,
        targetInstanceId: enemy.instanceId,
        rawDamage: aoe.damage,
        element: aoe.element,
        isAoe: true,
        aoeRadius: aoe.radius,
        aoeCenter: aoe.center,
      });
    });
  }
}
