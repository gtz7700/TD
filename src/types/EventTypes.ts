// קבועי שמות אירועים ומיפוי טיפוסי עומסים - מרכז התקשורת בין המערכות

import type { UnitPlacementData } from './UnitTypes';
import type { DragPreviewState, SwapRequest } from './PlacementTypes';
import type { IEnemyState } from './EnemyTypes';
import type { IHitResult, AoePayload, IStatusEffect } from './CombatTypes';
import type { ICurrencyDelta, IPlayerWallet, RewardPayload } from './EconomyTypes';

// מרחב שמות של כל קבועי האירועים במשחק
export namespace Events {
  // --- הנחת יחידות ---
  export const UNIT_DRAG_START = 'unit:drag_start';
  export const UNIT_DRAG_MOVE = 'unit:drag_move';
  export const UNIT_DRAG_END = 'unit:drag_end';
  export const UNIT_PLACED = 'unit:placed';
  export const UNIT_REMOVED = 'unit:removed';
  export const SWAP_REQUESTED = 'unit:swap_requested';
  export const SWAP_COMPLETED = 'unit:swap_completed';
  export const SWAP_FAILED = 'unit:swap_failed';

  // --- לחימה ---
  export const ENEMY_SPAWNED = 'enemy:spawned';
  export const ENEMY_DAMAGED = 'enemy:damaged';
  export const ENEMY_DIED = 'enemy:died';
  export const ENEMY_REACHED_EXIT = 'enemy:reached_exit';
  export const TOWER_FIRED = 'tower:fired';
  export const AOE_TRIGGERED = 'combat:aoe_triggered';
  export const STATUS_EFFECT_APPLIED = 'combat:status_effect_applied';

  // --- גלים ---
  export const WAVE_STARTED = 'wave:started';
  export const WAVE_COMPLETE = 'wave:complete';
  export const ALL_WAVES_COMPLETE = 'wave:all_complete';

  // --- משק ---
  export const CURRENCY_CHANGED = 'economy:currency_changed';
  export const REWARD_GRANTED = 'economy:reward_granted';
  export const XP_LEVEL_UP = 'economy:xp_level_up';

  // --- חיים ---
  export const LIFE_LOST = 'life:lost';
  export const PLAYER_DEFEATED = 'life:player_defeated';

  // --- מצב משחק ---
  export const GAME_PAUSED = 'game:paused';
  export const GAME_RESUMED = 'game:resumed';
  export const LEVEL_COMPLETE = 'game:level_complete';
  export const LEVEL_FAILED = 'game:level_failed';

  // --- ממשק משתמש ---
  export const TOWER_SELECTED = 'ui:tower_selected';
  export const TOWER_DESELECTED = 'ui:tower_deselected';
  export const UPGRADE_PURCHASED = 'ui:upgrade_purchased';
  export const TOWER_SOLD = 'ui:tower_sold';

  // --- ניווט UI בין סצנות ---
  export const UI_NAVIGATE_REQUEST  = 'ui:navigate_request';  // בקשת מעבר לסצנה אחרת דרך UIScene
  export const GAME_RETRY_REQUESTED = 'game:retry_requested'; // בקשת הפעלה מחדש של הרמה

  // --- בחירת יחידות והנחה (מגש בחירה) ---
  export const WAVE_PREP_STARTED        = 'wave:prep_started';         // ספירה לאחור לפני גל ראשון
  export const UNIT_SELECTED            = 'unit:selected';             // בחירת יחידה מהמגש
  export const UNIT_DESELECTED          = 'unit:deselected';           // ביטול בחירה
  export const UNIT_PLACEMENT_ATTEMPTED = 'unit:placement_attempted';  // ניסיון הנחה על המפה
  export const UNIT_PLACEMENT_FAILED    = 'unit:placement_failed';     // הנחה נכשלה

  // --- בחירת מגדל מונח (טווח ויזואלי) ---
  export const TOWER_CLICKED = 'tower:clicked'; // לחיצה על מגדל מונח → הצגת עיגול טווח
}

// מיפוי מלא של עומסי האירועים לכל שם אירוע
export interface EventPayloadMap {
  [Events.UNIT_DRAG_START]: { unitId: string; unitType: 'tower' | 'hero' };
  [Events.UNIT_DRAG_MOVE]: DragPreviewState;
  [Events.UNIT_DRAG_END]: { placed: boolean; data?: UnitPlacementData };
  [Events.UNIT_PLACED]: UnitPlacementData;
  [Events.UNIT_REMOVED]: { instanceId: string; slotId: string };
  [Events.SWAP_REQUESTED]: SwapRequest;
  [Events.SWAP_COMPLETED]: SwapRequest;
  [Events.SWAP_FAILED]: { reason: string };
  [Events.ENEMY_SPAWNED]: IEnemyState;
  [Events.ENEMY_DAMAGED]: { enemyInstanceId: string; result: IHitResult };
  [Events.ENEMY_DIED]: { instanceId: string; defId: string; worldX: number; worldY: number };
  [Events.ENEMY_REACHED_EXIT]: { instanceId: string; lifeDamage: number };
  [Events.TOWER_FIRED]: { towerInstanceId: string; targetInstanceId: string; projectileType: string };
  [Events.AOE_TRIGGERED]: AoePayload;
  [Events.STATUS_EFFECT_APPLIED]: { enemyInstanceId: string; effect: IStatusEffect };
  [Events.WAVE_STARTED]: { waveNumber: number };
  [Events.WAVE_COMPLETE]: { waveNumber: number; goldBonus: number };
  [Events.ALL_WAVES_COMPLETE]: { levelId: string };
  [Events.CURRENCY_CHANGED]: ICurrencyDelta & { newWallet: IPlayerWallet };
  [Events.REWARD_GRANTED]: RewardPayload;
  [Events.XP_LEVEL_UP]: { newLevel: number; rewards: RewardPayload };
  [Events.LIFE_LOST]: { amount: number; remaining: number };
  [Events.PLAYER_DEFEATED]: Record<string, never>;
  [Events.GAME_PAUSED]: Record<string, never>;
  [Events.GAME_RESUMED]: Record<string, never>;
  [Events.LEVEL_COMPLETE]: { levelId: string; stars: 1 | 2 | 3; gemsEarned: number };
  [Events.LEVEL_FAILED]: { levelId: string };
  [Events.TOWER_SELECTED]: { instanceId: string };
  [Events.TOWER_DESELECTED]: Record<string, never>;
  [Events.UPGRADE_PURCHASED]: { nodeId: string; targetInstanceId: string };
  [Events.TOWER_SOLD]: { instanceId: string; refundGold: number };
  [Events.UI_NAVIGATE_REQUEST]: { sceneKey: string; data?: Record<string, unknown> };
  [Events.GAME_RETRY_REQUESTED]: Record<string, never>;
  [Events.WAVE_PREP_STARTED]: { totalMs: number };
  [Events.UNIT_SELECTED]: { unitId: string; unitType: 'tower' | 'hero' };
  [Events.UNIT_DESELECTED]: Record<string, never>;
  [Events.UNIT_PLACEMENT_ATTEMPTED]: { unitId: string; unitType: 'tower' | 'hero'; worldX: number; worldY: number };
  [Events.UNIT_PLACEMENT_FAILED]: { reason: 'no_slot' | 'cant_afford' | 'blocked' };
  [Events.TOWER_CLICKED]: { instanceId: string; x: number; y: number; range: number };
}
