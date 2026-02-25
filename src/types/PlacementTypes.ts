// הגדרות טיפוסים עבור מערכת הנחת יחידות - אזורים, יחידות מונחות וגרירה

import type { ISlotDef } from './MapTypes';

export interface PlacedUnit {
  instanceId: string; // מזהה ייחודי של האינסטנס
  unitId: string; // מפנה להגדרת המגדל/גיבור
  unitType: 'tower' | 'hero';
  worldX: number; // מיקום מדויק בעולם המשחק
  worldY: number;
  hitboxRect: { x: number; y: number; width: number; height: number }; // תיבת פגיעה בעולם
}

export interface ISlotState {
  slotId: string;
  def: ISlotDef; // הגדרת האזור (מלבן, allowOnPath)
  placedUnits: PlacedUnit[]; // כל היחידות הנמצאות כרגע באזור זה
}

export interface DragPreviewState {
  active: boolean; // האם גרירה פעילה כרגע
  unitId: string;
  unitType: 'tower' | 'hero';
  currentWorldX: number;
  currentWorldY: number; // כולל את היסט Y (מעל האצבע)
  isValidPlacement: boolean; // האם המיקום הנוכחי תקין
  targetSlotId: string | null; // אזור מטרה פעיל (אם קיים)
}

export interface SwapRequest {
  instanceIdA: string; // יחידה ראשונה להחלפה
  instanceIdB: string; // יחידה שניה להחלפה
  slotIdA: string;
  slotIdB: string;
}
