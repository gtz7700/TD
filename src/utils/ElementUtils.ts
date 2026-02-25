// טבלת יחסי אלמנטים ואפקטי סטטוס - מה יעיל על מה ולכמה זמן

import type { ElementType } from '../types/UnitTypes';
import type { IStatusEffect } from '../types/CombatTypes';

// מכפיל נזק אלמנטלי - עתיד לשמש עבור מערכת יתרונות/חסרונות
const DAMAGE_MULTIPLIERS: Record<ElementType, Record<ElementType, number>> = {
  Fire:     { Fire: 1.0, Ice: 2.0, Poison: 0.5, Lightning: 1.0, Physical: 1.0, None: 1.0 },
  Ice:      { Fire: 0.5, Ice: 1.0, Poison: 1.0, Lightning: 0.5, Physical: 1.0, None: 1.0 },
  Poison:   { Fire: 1.5, Ice: 1.0, Poison: 1.0, Lightning: 1.0, Physical: 1.0, None: 1.0 },
  Lightning:{ Fire: 1.0, Ice: 1.5, Poison: 1.0, Lightning: 1.0, Physical: 1.0, None: 1.0 },
  Physical: { Fire: 1.0, Ice: 1.0, Poison: 1.0, Lightning: 1.0, Physical: 1.0, None: 1.0 },
  None:     { Fire: 1.0, Ice: 1.0, Poison: 1.0, Lightning: 1.0, Physical: 1.0, None: 1.0 },
};

// חישוב מכפיל נזק על פי יחסי האלמנטים
export function getDamageMultiplier(
  attackerElement: ElementType,
  defenderElement: ElementType
): number {
  return DAMAGE_MULTIPLIERS[attackerElement][defenderElement] ?? 1.0;
}

// יצירת אפקט סטטוס על פי האלמנט התוקף (null אם אין אפקט)
export function getStatusEffect(element: ElementType): IStatusEffect | null {
  switch (element) {
    case 'Ice':
      return { type: 'Ice',     multiplier: 0.5,  durationMs: 2000, remainingMs: 2000 };
    case 'Poison':
      return { type: 'Poison',  multiplier: 0.15, durationMs: 3000, remainingMs: 3000 };
    case 'Lightning':
      return { type: 'Lightning', multiplier: 1.0, durationMs: 500,  remainingMs: 500 };
    default:
      return null;
  }
}

// בדיקה האם אלמנט מסוים מחיל האטה על המהירות
export function isSlowingElement(element: ElementType): boolean {
  return element === 'Ice';
}
