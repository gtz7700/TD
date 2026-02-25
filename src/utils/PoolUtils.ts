// מאגר אובייקטים גנרי - ממחזר אובייקטים לחיסכון ביצירה ובאיסוף זבל

export class Pool<T> {
  private readonly inactive: T[] = [];  // אובייקטים פנויים לשימוש חוזר
  private readonly active: Set<T> = new Set(); // אובייקטים בשימוש כעת
  private readonly factory: () => T; // פונקציה ליצירת אובייקט חדש
  private readonly reset: (obj: T) => void; // פונקציה לאיפוס אובייקט

  constructor(factory: () => T, reset: (obj: T) => void, initialSize = 0) {
    this.factory = factory;
    this.reset = reset;
    // טרום-מילוי מאגר עם כמות ראשונית
    for (let i = 0; i < initialSize; i++) {
      this.inactive.push(factory());
    }
  }

  // שליפת אובייקט מהמאגר (או יצירת חדש אם ריק)
  obtain(): T {
    const obj = this.inactive.pop() ?? this.factory();
    this.active.add(obj);
    return obj;
  }

  // החזרת אובייקט למאגר ואיפוסו לשימוש עתידי
  release(obj: T): void {
    if (this.active.delete(obj)) {
      this.reset(obj);
      this.inactive.push(obj);
    }
  }

  // שליפת כל האובייקטים הפעילים כרגע (לאיטרציה)
  getActive(): ReadonlySet<T> {
    return this.active;
  }

  // מספר האובייקטים הפעילים כרגע
  get activeCount(): number {
    return this.active.size;
  }

  // ניקוי מוחלט של המאגר
  clear(): void {
    this.active.clear();
    this.inactive.length = 0;
  }
}
