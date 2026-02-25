// כלי עזר לחישובים גיאומטריים עם מלבנים - שימוש עיקרי במערכת ההנחה

type Rect = { x: number; y: number; width: number; height: number };

// בדיקה האם מלבן פנימי נמצא לחלוטין בתוך מלבן חיצוני
export function rectContainsRect(outer: Rect, inner: Rect): boolean {
  return (
    inner.x >= outer.x &&
    inner.y >= outer.y &&
    inner.x + inner.width  <= outer.x + outer.width &&
    inner.y + inner.height <= outer.y + outer.height
  );
}

// בדיקת חפיפה בין שני מלבנים (Axis-Aligned Bounding Box)
export function rectsOverlap(a: Rect, b: Rect): boolean {
  return !(
    a.x + a.width  <= b.x ||
    b.x + b.width  <= a.x ||
    a.y + a.height <= b.y ||
    b.y + b.height <= a.y
  );
}

// הגבלת מיקום כך שמלבן נישאר בתוך מלבן מכיל (clamping)
export function clampToRect(
  inner: Rect,
  outer: Rect
): { x: number; y: number } {
  const x = Math.max(outer.x, Math.min(inner.x, outer.x + outer.width  - inner.width));
  const y = Math.max(outer.y, Math.min(inner.y, outer.y + outer.height - inner.height));
  return { x, y };
}

// בניית מלבן תיבת פגיעה ממרכז ומידות
export function hitboxFromCenter(
  cx: number, cy: number,
  width: number, height: number
): Rect {
  return { x: cx - width / 2, y: cy - height / 2, width, height };
}
