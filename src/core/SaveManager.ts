// ניהול שמירה וטעינה של נתוני שחקן - שמירה ב-localStorage

import type { ISaveData, PlayerProgressData } from '../types/SaveTypes';

const SAVE_KEY = 'td_save_v1';

const DEFAULT_SAVE: ISaveData = {
  version: 1,
  lastSaved: new Date().toISOString(),
  progress: {
    campaignProgress: {
      map_001: { unlocked: true,  stars: 0 },
      map_002: { unlocked: false, stars: 0 },
      map_003: { unlocked: false, stars: 0 },
    },
    heroGalleryUnlocks:  { warrior: true, archer_hero: true, ice_wizard: true },
    heroGalleryUpgrades: { warrior: [],   archer_hero: [], ice_wizard: [] },
    playerLevel: 1,
    xp: 0,
    gems: 0,
  },
};

class SaveManagerClass {
  private data: ISaveData = structuredClone(DEFAULT_SAVE);

  // טעינת נתונים מ-localStorage; אם לא קיים - החזרת ברירת מחדל
  load(): ISaveData {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (raw) {
        this.data = JSON.parse(raw) as ISaveData;
        // מיזוג נעילות גיבורים ברירת מחדל — מבטיח שגיבורים חדשים יופיעו גם בשמירות ישנות
        this.data.progress.heroGalleryUnlocks = {
          ...DEFAULT_SAVE.progress.heroGalleryUnlocks,
          ...this.data.progress.heroGalleryUnlocks,
        };
      } else {
        this.data = structuredClone(DEFAULT_SAVE);
      }
    } catch {
      console.warn('[SaveManager] Failed to load save, using defaults');
      this.data = structuredClone(DEFAULT_SAVE);
    }
    return this.data;
  }

  // שמירת המצב הנוכחי ל-localStorage עם חותמת זמן עדכנית
  save(): void {
    this.data.lastSaved = new Date().toISOString();
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(this.data));
    } catch {
      console.error('[SaveManager] Failed to write save data');
    }
  }

  // שליפת נתוני ההתקדמות הנוכחיים (קריאה בלבד)
  getProgress(): Readonly<PlayerProgressData> {
    return this.data.progress;
  }

  // עדכון שדה ספציפי בנתוני ההתקדמות ושמירה מיידית
  updateProgress(partial: Partial<PlayerProgressData>): void {
    Object.assign(this.data.progress, partial);
    this.save();
  }

  // איפוס מוחלט של נתוני השמירה
  reset(): void {
    this.data = structuredClone(DEFAULT_SAVE);
    this.save();
  }
}

export const SaveManager = new SaveManagerClass();
