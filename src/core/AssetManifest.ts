// קבועי מפתחות נכסים - מניעת שגיאות טייפו בעת שימוש בנכסים של Phaser

// מפתחות תמונות רקע
export const BG = {
  FOREST: 'bg_forest',
  DESERT: 'bg_desert',
  CAVES:  'bg_caves',
  HUB:    'bg_hub',
} as const;

// מפתחות ספרייטים של אויבים
export const ENEMY_SPRITES = {
  GOBLIN: 'enemy_goblin',
  SCOUT:  'enemy_scout',
  OGRE:   'enemy_ogre',
} as const;

// מפתחות ספרייטים של מגדלים
export const TOWER_SPRITES = {
  ARCHER:   'tower_archer',
  MAGE:     'tower_mage',
  CATAPULT: 'tower_catapult',
  FREEZE:   'tower_freeze',
} as const;

// מפתחות ספרייטים של גיבורים
export const HERO_SPRITES = {
  WARRIOR: 'hero_warrior',
  ARCHER:  'hero_archer',
} as const;

// מפתחות ממשק משתמש
export const UI = {
  BACK_BTN:    'ui_back_btn',
  PAUSE_BTN:   'ui_pause_btn',
  GOLD_ICON:   'ui_gold_icon',
  GEM_ICON:    'ui_gem_icon',
  HEART_ICON:  'ui_heart_icon',
  STAR_FULL:   'ui_star_full',
  STAR_EMPTY:  'ui_star_empty',
} as const;

// מפתחות פרויקטילים
export const PROJECTILE_SPRITES = {
  ARROW:   'proj_arrow',
  ORB:     'proj_orb',
  BOULDER: 'proj_boulder',
} as const;

// מפתחות ספרייטשיטים של יחידות (344×192 px לפריים, רשת 4×4: 4 כיוונים × 4 מצבים)
export const UNIT_SPRITES = {
  ARCHER_HERO: 'unit_archer_hero',
  WARRIOR:     'unit_warrior',
  GOBLIN:      'unit_goblin',
  WOLF:        'unit_wolf',
  RINO:        'unit_rino',
  RABBIT:      'unit_rabbit',
  ICE_WIZARD:  'unit_ice_wizard',
} as const;

// מפתחות קבצי JSON שנטענים ב-Preloader
export const DATA_KEYS = {
  CAMPAIGN:       'data_campaign',
  MAP_001:        'data_map_001',
  MAP_002:        'data_map_002',
  MAP_003:        'data_map_003',
  WAVES_001:      'data_waves_001',
  WAVES_002:      'data_waves_002',
  WAVES_003:      'data_waves_003',
  ENEMIES:        'data_enemies',
  TOWERS:         'data_towers',
  HEROES:         'data_heroes',
  TOWER_UPGRADES: 'data_tower_upgrades',
  HERO_UPGRADES:  'data_hero_upgrades',
} as const;
