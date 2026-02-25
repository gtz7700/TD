// רישום מרכזי לניהול הפניות לכל המנהלים והסצנות הפעילות במשחק

// מפה גנרית המאחסנת אובייקטים כלשהם בשמות ייחודיים
class GameRegistryClass {
  private readonly store = new Map<string, unknown>();

  // רישום מנהל/ממשק בשם ייחודי
  register(key: string, instance: unknown): void {
    this.store.set(key, instance);
  }

  // שליפת מנהל על פי שמו - זריקת שגיאה אם לא נמצא
  get<T>(key: string): T {
    const instance = this.store.get(key);
    if (instance === undefined) {
      throw new Error(`[GameRegistry] No instance registered for key: "${key}"`);
    }
    return instance as T;
  }

  // בדיקה האם מנהל מסוים רשום
  has(key: string): boolean {
    return this.store.has(key);
  }

  // הסרת רישום - נקרא בסיום סצנת משחק
  unregister(key: string): void {
    this.store.delete(key);
  }

  // ניקוי כל הרישומים - נקרא בכיבוי המשחק
  clear(): void {
    this.store.clear();
  }
}

export const GameRegistry = new GameRegistryClass();
