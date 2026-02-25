// הגדרות טיפוסים עבור מערכת המשק - מטבעות, ניסיון ותגמולים

export interface IPlayerWallet {
  gold: number; // זהב - מרוויח בתוך הרמה לשדרוגים זמניים
  gems: number; // גלינט/אבנים - מרוויח בסיום רמות לשדרוגים קבועים
  xp: number; // ניסיון - מוביל להעלאת רמת שחקן
  playerLevel: number; // רמת השחקן הנוכחית
}

export interface ICurrencyDelta {
  gold?: number; // שינוי בזהב (חיובי=הרוויח, שלילי=הוצאה)
  gems?: number; // שינוי בגלינט
  xp?: number; // שינוי בניסיון
}

export interface RewardPayload {
  source: 'enemyKill' | 'waveBonus' | 'levelComplete' | 'xpLevelUp'; // מקור התגמול
  delta: ICurrencyDelta; // כמות שהתווספה
  metadata?: Record<string, unknown>; // מידע נוסף (למשל מזהה אויב)
}
