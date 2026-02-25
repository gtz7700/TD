// הגדרות טיפוסים עבור שמירת נתוני שחקן - התקדמות, גיבורים ומטבעות

export type HeroUnlockMap = Record<string, boolean>; // heroId -> האם פתוח

export interface PlayerProgressData {
  campaignProgress: Record<string, { // mapId -> נתוני התקדמות
    unlocked: boolean;
    stars: 0 | 1 | 2 | 3; // כוכבים שהושגו
    bestTime?: number; // זמן מינימלי בשניות
  }>;
  heroGalleryUnlocks: HeroUnlockMap; // גיבורים שנפתחו
  heroGalleryUpgrades: Record<string, string[]>; // heroId -> nodeIds שנקנו
  playerLevel: number;
  xp: number;
  gems: number;
}

export interface ISaveData {
  version: number; // גרסת פורמט השמירה לצורך מיגרציה עתידית
  lastSaved: string; // חותמת זמן ISO
  progress: PlayerProgressData;
}
