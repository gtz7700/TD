// הגדרות טיפוסים עבור מגדלים וגיבורים

export type ElementType = 'Fire' | 'Ice' | 'Poison' | 'Lightning' | 'Physical' | 'None';

export interface ITowerDef {
  id: string;
  name: string;
  spriteKey: string; // מפתח הספרייט ב-Phaser
  hitboxWidth: number; // רוחב תיבת הפגיעה לחישוב חפיפה
  hitboxHeight: number; // גובה תיבת הפגיעה
  canPlaceOnPath: boolean; // האם המגדל יכול לעמוד על הנתיב (melee)
  range: number; // רדיוס הטווח בעולם המשחק
  damage: number; // נזק בסיסי לפגיעה
  fireRateMs: number; // מרווח זמן בין ירי בסיסי
  element: ElementType; // אלמנט ייחודי לפגיעות
  isAoe: boolean; // האם הנזק מדורתי
  aoeRadius?: number; // רדיוס נזק מדורתי (אם isAoe=true)
  cost: number; // עלות בזהב להנחה
  upgradeTreeId: string; // מזהה עץ השדרוגים
}

export interface IHeroDef {
  id: string;
  name: string;
  spriteKey: string;
  hitboxWidth: number;
  hitboxHeight: number;
  canPlaceOnPath: boolean; // גיבורי melee יכולים לעמוד על הנתיב
  baseHP: number; // נקודות חיים בסיסיות
  baseDamage: number;
  abilityId: string; // מזהה יכולת מיוחדת
  unlockCostGems: number; // עלות פתיחה בגלינט/אבנים
}

export interface UnitPlacementData {
  unitId: string; // מזהה ההגדרה (tower/hero)
  unitType: 'tower' | 'hero';
  slotId: string; // אזור ההנחה שנבחר
  worldX: number; // מיקום סופי בעולם המשחק
  worldY: number;
  instanceId: string; // מזהה ייחודי לאינסטנס זה
}
