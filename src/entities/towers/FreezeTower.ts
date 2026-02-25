// מגדל קפיאה - מחיל האטה על אויבים, נזק מינימלי, אלמנט Ice

import Phaser from 'phaser';
import { BaseTower } from './BaseTower';
import { GameRegistry } from '../../core/GameRegistry';
import type { ITowerDef } from '../../types/UnitTypes';
import type { BaseEnemy } from '../enemies/BaseEnemy';
import type { ProjectileManager } from '../../managers/ProjectileManager';

export class FreezeTower extends BaseTower {
  // יצירת מגדל קפיאה - כחול בהיר כסמל לקרח
  constructor(
    scene: Phaser.Scene,
    instanceId: string,
    def: ITowerDef,
    x: number, y: number
  ) {
    super(scene, instanceId, def, x, y, 0x4488cc);
  }

  // ירי פריז - מחיל אפקט Ice דרך ProjectileManager (טיפוס 'freeze' ב-towerDef.id)
  protected fire(target: BaseEnemy): void {
    const pm = GameRegistry.get<ProjectileManager>('projectileManager');
    if (!pm) return;
    pm.spawn(this.def, this.instanceId, this.x, this.y, target.x, target.y, target.instanceId);
  }
}
