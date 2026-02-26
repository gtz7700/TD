// מנהל הנחת יחידות - אלגוריתם מרחבי עם בדיקת גבולות, חפיפה והחלפה

import Phaser from 'phaser';
import { EventBus } from '../core/EventBus';
import { Events } from '../types/EventTypes';
import { MapManager } from './MapManager';
import { rectContainsRect, rectsOverlap, hitboxFromCenter } from '../utils/RectUtils';
import type { ISlotState, PlacedUnit, DragPreviewState, SwapRequest } from '../types/PlacementTypes';
import type { ITowerDef, IHeroDef } from '../types/UnitTypes';


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
    const checkRect = slotState.def.exactHitbox ?? rect;

    // בדיקה 1: תיבת הפגיעה נמצאת לחלוטין בתוך האזור (exactHitbox מדויק יותר מ-rect)
    const hitbox = hitboxFromCenter(dropX, dropY, def.hitboxWidth, def.hitboxHeight);
    if (!rectContainsRect(checkRect, hitbox)) return false;

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

    const placed: PlacedUnit = {
      instanceId,
      unitId: def.id,
      unitType,
      worldX,
      worldY,
      hitboxRect: hitboxFromCenter(worldX, worldY, def.hitboxWidth, def.hitboxHeight),
    };

    slotState.placedUnits.push(placed);
    EventBus.emit(Events.UNIT_PLACED, { instanceId, unitId: def.id, unitType, slotId, worldX, worldY });
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

    const rectA = stateA.def.exactHitbox ?? stateA.def.rect;
    const rectB = stateB.def.exactHitbox ?? stateB.def.rect;
    if (!rectContainsRect(rectB, hitboxA) || !rectContainsRect(rectA, hitboxB)) {
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

  // Place a unit at the tapped point. Respects slot capacity:
  // - capacity 1: single unit snapped to slot center
  // - capacity N: units placed side-by-side at N equally spaced X positions
  tryPlaceAtPoint(
    def: ITowerDef | IHeroDef,
    unitType: 'tower' | 'hero',
    worldX: number,
    worldY: number
  ): boolean {
    for (const [, state] of this.slotStates) {
      const { rect, id } = state.def;
      if (
        worldX < rect.x || worldX > rect.x + rect.width ||
        worldY < rect.y || worldY > rect.y + rect.height
      ) continue;

      const capacity = state.def.capacity ?? 1;
      const occupied = state.placedUnits.length;
      if (occupied >= capacity) continue;

      // Divide slot into (capacity + 1) sections; place unit in the next free section
      const cx = rect.x + rect.width * (occupied + 1) / (capacity + 1);
      const cy = rect.y + rect.height / 2;

      if (this.canPlace(def, id, cx, cy)) {
        const instanceId = `${def.id}_${Date.now()}`;
        this.commitPlacement(instanceId, def, unitType, id, cx, cy);
        return true;
      }
    }
    return false;
  }

  // שליפת כל ה-slots לצורך ציור ויזואלי
  getSlotStates(): Map<string, ISlotState> {
    return this.slotStates;
  }
}
