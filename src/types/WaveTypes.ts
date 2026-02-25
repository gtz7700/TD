// הגדרות טיפוסים עבור מבנה גלי אויבים

export interface EnemySpawnEntry {
  enemyId: string; // מפנה לרשומה ב-enemies.json
  count: number; // כמות אויבים להוליד
  intervalMs: number; // המתנה בין כל הולדה בתוך הקבוצה
}

export interface IWaveGroup {
  spawnNodeId: string; // איזו כניסה משמשת לקבוצה זו
  entries: EnemySpawnEntry[]; // רצף הולדת אויבים בקבוצה
  delayMs: number; // עיכוב לפני תחילת הקבוצה (אחרי הקבוצה הקודמת)
}

export interface IWaveDef {
  waveNumber: number;
  groups: IWaveGroup[]; // קבוצות מקבילות אפשריות מכניסות שונות
  preBonusGold: number; // זהב שניתן לשחקן לפני תחילת הגל
}

export interface IWaveConfig {
  levelId: string; // מזהה הרמה שאליה משוייכת הקונפיגורציה
  waves: IWaveDef[]; // כל הגלים של הרמה בסדר עולה
}
