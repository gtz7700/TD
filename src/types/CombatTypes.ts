// הגדרות טיפוסים עבור מערכת הלחימה - נזק, פגיעות ואפקטי סטטוס

import type { ElementType } from './UnitTypes';

export interface IStatusEffect {
  type: ElementType; // סוג האלמנט שיצר את האפקט
  multiplier: number; // מכפיל אפקט (למשל 0.5 = האטה ב-50%)
  durationMs: number; // משך האפקט הכולל
  remainingMs: number; // זמן נותר לאפקט הפעיל
}

export interface IDamageEvent {
  sourceInstanceId: string; // מגדל/גיבור שיצר את הנזק
  targetInstanceId: string; // אויב שמקבל את הנזק
  rawDamage: number; // נזק גולמי לפני חישוב מגן
  element: ElementType;
  isAoe: boolean; // האם הנזק מדורתי
  aoeRadius?: number; // רדיוס AOE אם רלוונטי
  aoeCenter?: { x: number; y: number }; // מרכז הפיצוץ ב-AOE
}

export interface IHitResult {
  shieldAbsorbed: number; // כמות נזק שנספגה על ידי מגן
  hpDamaged: number; // נזק שהגיע ל-HP לאחר מגן
  overkill: number; // עודף נזק מעל ה-HP שנותר
  enemyDied: boolean; // האם האויב מת כתוצאה מהפגיעה
  statusApplied?: IStatusEffect; // אפקט סטטוס שהוחל (אם רלוונטי)
}

export interface AoePayload {
  center: { x: number; y: number }; // נקודת מרכז הפיצוץ
  radius: number; // רדיוס נזק מדורתי
  damage: number; // כמות הנזק
  element: ElementType;
  sourceInstanceId: string; // מגדל/פרויקטיל שיצר את ה-AOE
}
