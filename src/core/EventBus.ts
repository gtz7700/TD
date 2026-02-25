// ממסר אירועים מרכזי - מאפשר תקשורת מנותקת בין כל מערכות המשחק

import type { EventPayloadMap } from '../types/EventTypes';

type EventKey = keyof EventPayloadMap;
type Handler<K extends EventKey> = (payload: EventPayloadMap[K]) => void;

class TypedEventBus {
  // מפה פנימית: שם אירוע -> רשימת מאזינים
  private readonly listeners = new Map<string, Set<(...args: unknown[]) => void>>();

  // הרשמה לאירוע עם פונקציית callback מוקלדת
  on<K extends EventKey>(event: K, handler: Handler<K>): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(handler as (...args: unknown[]) => void);
  }

  // הסרת מאזין ספציפי מאירוע
  off<K extends EventKey>(event: K, handler: Handler<K>): void {
    this.listeners.get(event)?.delete(handler as (...args: unknown[]) => void);
  }

  // שליחת אירוע לכל המאזינים הרשומים
  emit<K extends EventKey>(event: K, payload: EventPayloadMap[K]): void {
    this.listeners.get(event)?.forEach(fn => fn(payload));
  }

  // הסרת כל המאזינים לאירוע מסוים (שימושי בניקוי סצנה)
  clearEvent(event: string): void {
    this.listeners.delete(event);
  }

  // ניקוי מוחלט של כל המאזינים - נקרא בסגירת סצנה
  clearAll(): void {
    this.listeners.clear();
  }
}

// singleton - מיובא ישירות ממקום אחד בכל רחבי המשחק
export const EventBus = new TypedEventBus();
