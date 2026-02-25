// כלי עזר מתמטיים כלליים לחישובי משחק

// חישוב זווית בין שתי נקודות (ברדיאנים)
export function angleBetween(
  x1: number, y1: number,
  x2: number, y2: number
): number {
  return Math.atan2(y2 - y1, x2 - x1);
}

// חישוב מרחק אוקלידי בין שתי נקודות
export function distanceBetween(
  x1: number, y1: number,
  x2: number, y2: number
): number {
  return Math.hypot(x2 - x1, y2 - y1);
}

// מספר אקראי בתחום [min, max)
export function randomInRange(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

// בחירת אינדקס אקראי על פי משקלות הסתברות
export function weightedRandom(weights: number[]): number {
  const total = weights.reduce((s, w) => s + w, 0);
  let r = Math.random() * total;
  for (let i = 0; i < weights.length; i++) {
    r -= weights[i];
    if (r < 0) return i;
  }
  return weights.length - 1;
}

// הגבלת ערך בין min ל-max
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

// המרת רדיאנים למעלות
export function radToDeg(radians: number): number {
  return radians * (180 / Math.PI);
}
