// מגדל קטפולטה - ירי AOE בקשת, נזק גבוה על אזור

import Phaser from 'phaser';
import { BaseTower } from './BaseTower';
import { GameRegistry } from '../../core/GameRegistry';
import type { ITowerDef } from '../../types/UnitTypes';
import type { BaseEnemy } from '../enemies/BaseEnemy';
import type { ProjectileManager } from '../../managers/ProjectileManager';

export class CatapultTower extends BaseTower {
  protected currentAoeRadius: number;

  // יצירת קטפולטה - חום כהה, גוף גדול
  constructor(
    scene: Phaser.Scene,
    instanceId: string,
    def: ITowerDef,
    x: number, y: number
  ) {
    super(scene, instanceId, def, x, y, 0x8b4513);
    this.currentAoeRadius = def.aoeRadius ?? 80;
  }

  // ירי אבן בקשת לעבר מיקום המטרה - AOE מטופל ב-CatapultBoulder.update()
  protected fire(target: BaseEnemy): void {
    const pm = GameRegistry.get<ProjectileManager>('projectileManager');
    if (!pm) return;
    pm.spawn(this.def, this.instanceId, this.x, this.y, target.x, target.y, target.instanceId);
  }

  // החלת שדרוג גם על רדיוס AOE
  override applyStatDelta(deltas: Partial<{ damage: number; range: number; fireRateMs: number; aoeRadius: number }>): void {
    super.applyStatDelta(deltas);
    if (deltas.aoeRadius) this.currentAoeRadius += deltas.aoeRadius;
  }
}
