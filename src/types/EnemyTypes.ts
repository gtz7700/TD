// הגדרות טיפוסים עבור אויבים - הגדרות בסיסיות ומצב רצף

import type { IStatusEffect } from './CombatTypes';
import type { ElementType } from './UnitTypes';

export type EnemyCategory = 'Regular' | 'Fast' | 'Tank';

export interface IEnemyDef {
  id: string;
  category: EnemyCategory;
  spriteKey: string;
  maxHP: number; // נקודות חיים מקסימליות
  maxShield: number; // מגן - נספג לפני HP
  speed: number; // מהירות תנועה ביחידות עולם לשניה
  lifeDamage: number; // נזק לחיי השחקן עם הגעה ליציאה (Regular=2, Fast=3, Tank=5)
  goldReward: number; // זהב שניתן לשחקן עם הריגה
  xpReward: number; // נקודות ניסיון עם הריגה
  hitboxWidth: number;
  hitboxHeight: number;
  element?: ElementType; // סוג אלמנט לחישוב מכפיל נזק - ברירת מחדל None
}

export interface IEnemyState {
  instanceId: string; // מזהה ייחודי לאינסטנס הרץ
  defId: string; // מפנה להגדרת הסוג ב-IEnemyDef
  currentHP: number;
  currentShield: number;
  currentNodeIndex: number; // מיקום במסלול הצמתים שנבחר
  chosenRoutePath: string[]; // רצף מזהי צמתים שנקבע בלידה (כולל ענפים)
  activeEffects: IStatusEffect[]; // אפקטים פעילים (איטון, רעל וכו')
  isAlive: boolean;
}
