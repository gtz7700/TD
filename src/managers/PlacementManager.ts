// מנהל הנחת יחידות - אלגוריתם מרחבי עם בדיקת גבולות, חפיפה והחלפה

import Phaser from 'phaser';
import { EventBus } from '../core/EventBus';
import { Events } from '../types/EventTypes';
import { MapManager } from './MapManager';
import { rectContainsRect, rectsOverlap, hitboxFromCenter } from '../utils/RectUtils';
import type { ISlotState, PlacedUnit, DragPreviewState, SwapRequest } from '../types/PlacementTypes';
import type { ITowerDef, IHeroDef } from '../types/UnitTypes';

// היסט Y של תצוגת הגרירה מעל האצבע ביחידות עולם
const MOBILE_DRAG_Y_OFFSET = -80;

export class PlacementManager {
  private readonly slotStates: Map<string, ISlotState>;
  private _dragState: DragPreviewState | null = null;

  // אתחול: יצירת מצב ריק לכל אזורי ההנחה
  constructor(_scene: Phaser.Scene, mapManager: MapManager) {
    this.slotStates = new Map();
    mapManager.getAllSlots().forEach(def => {
      this.slotStates.set(def.id, { slotId: def.id, def, placedUnits: [] });
    });
  }

  // בדיקת תקינות הנחה: גבולות, canPlaceOnPath, ואי-חפיפה
  canPlace(
    def: ITowerDef | IHeroDef,
    slotId: string,
    dropX: number, dropY: number
  ): boolean {
    const slotState = this.slotStates.get(slotId);
    if (!slotState) return false;

    const { rect, allowOnPath } = slotState.def;

    // בדיקה 1: תיבת הפגיעה נמצאת לחלוטין בתוך האזור
    const hitbox = hitboxFromCenter(dropX, dropY, def.hitboxWidth, def.hitboxHeight);
    if (!rectContainsRect(rect, hitbox)) return false;

    // בדיקה 2: canPlaceOnPath - האם מותר על הנתיב
    if (!allowOnPath && def.canPlaceOnPath) return false;

    // בדיקה 3: אין חפיפה עם יחידות קיימות באותו אזור
    for (const placed of slotState.placedUnits) {
      if (rectsOverlap(placed.hitboxRect, hitbox)) return false;
    }

    return true;
  }

  // ביצוע הנחה בפועל לאחר אישור תקינות
  commitPlacement(
    instanceId: string,
    def: ITowerDef | IHeroDef,
    unitType: 'tower' | 'hero',
    slotId: string,
    worldX: number, worldY: number
  ): void {
    const slotState = this.slotStates.get(slotId);
    if (!slotState) return;

    // יישום היסט Y לפני שמירה
    const adjustedY = worldY + MOBILE_DRAG_Y_OFFSET;

    const placed: PlacedUnit = {
      instanceId,
      unitId: def.id,
      unitType,
      worldX,
      worldY: adjustedY,
      hitboxRect: hitboxFromCenter(worldX, adjustedY, def.hitboxWidth, def.hitboxHeight),
    };

    slotState.placedUnits.push(placed);
    EventBus.emit(Events.UNIT_PLACED, { instanceId, unitId: def.id, unitType, slotId, worldX, worldY: adjustedY });
  }

  // הסרת יחידה מאזורה
  removeUnit(instanceId: string): void {
    for (const [slotId, state] of this.slotStates) {
      const idx = state.placedUnits.findIndex(u => u.instanceId === instanceId);
      if (idx !== -1) {
        state.placedUnits.splice(idx, 1);
        EventBus.emit(Events.UNIT_REMOVED, { instanceId, slotId });
        return;
      }
    }
  }

  // ניסיון החלפת שתי יחידות - מותר רק אם מידות מאפשרות
  requestSwap(req: SwapRequest): void {
    const stateA = this.slotStates.get(req.slotIdA);
    const stateB = this.slotStates.get(req.slotIdB);
    if (!stateA || !stateB) {
      EventBus.emit(Events.SWAP_FAILED, { reason: 'Slot not found' });
      return;
    }

    const unitA = stateA.placedUnits.find(u => u.instanceId === req.instanceIdA);
    const unitB = stateB.placedUnits.find(u => u.instanceId === req.instanceIdB);
    if (!unitA || !unitB) {
      EventBus.emit(Events.SWAP_FAILED, { reason: 'Unit not found' });
      return;
    }

    // בדיקה: האם A מתאים ב-slot של B ולהיפך
    const hitboxA = hitboxFromCenter(unitB.worldX, unitB.worldY, unitA.hitboxRect.width, unitA.hitboxRect.height);
    const hitboxB = hitboxFromCenter(unitA.worldX, unitA.worldY, unitB.hitboxRect.width, unitB.hitboxRect.height);

    if (!rectContainsRect(stateB.def.rect, hitboxA) || !rectContainsRect(stateA.def.rect, hitboxB)) {
      EventBus.emit(Events.SWAP_FAILED, { reason: 'Size constraints violated' });
      return;
    }

    // ביצוע ההחלפה
    [unitA.worldX, unitB.worldX] = [unitB.worldX, unitA.worldX];
    [unitA.worldY, unitB.worldY] = [unitB.worldY, unitA.worldY];
    unitA.hitboxRect = hitboxA;
    unitB.hitboxRect = hitboxB;

    EventBus.emit(Events.SWAP_COMPLETED, req);
  }

  // שליפת כל היחידות המונחות כרגע (לשימוש מנהל מגדלים/גיבורים)
  getAllPlacedUnits(): PlacedUnit[] {
    return [...this.slotStates.values()].flatMap(s => s.placedUnits);
  }
}
