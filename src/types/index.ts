// יצוא מרכזי של כל טיפוסי המשחק - ייבוא קל ממקום אחד

export type { IMapConfig, IPathNode, ISlotDef, IBranchDef } from './MapTypes';
export type { IWaveConfig, IWaveDef, IWaveGroup, EnemySpawnEntry } from './WaveTypes';
export type { ElementType, ITowerDef, IHeroDef, UnitPlacementData } from './UnitTypes';
export type { EnemyCategory, IEnemyDef, IEnemyState } from './EnemyTypes';
export type { IStatusEffect, IDamageEvent, IHitResult, AoePayload } from './CombatTypes';
export type { IPlayerWallet, ICurrencyDelta, RewardPayload } from './EconomyTypes';
export type { PlacedUnit, ISlotState, DragPreviewState, SwapRequest } from './PlacementTypes';
export type { UpgradeTarget, IUpgradeNode, IUpgradeTree } from './UpgradeTypes';
export type { HeroUnlockMap, PlayerProgressData, ISaveData } from './SaveTypes';
export { Events } from './EventTypes';
export type { EventPayloadMap } from './EventTypes';
