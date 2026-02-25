// מגדל קשת - ירי מהיר על מטרה יחידה, נזק Physical

import Phaser from 'phaser';
import { BaseTower } from './BaseTower';
import { GameRegistry } from '../../core/GameRegistry';
import type { ITowerDef } from '../../types/UnitTypes';
import type { BaseEnemy } from '../enemies/BaseEnemy';
import type { ProjectileManager } from '../../managers/ProjectileManager';

export class ArcherTower extends BaseTower {
  // יצירת מגדל קשת - ירוק כהה כמגדל בסיסי
  constructor(
    scene: Phaser.Scene,
    instanceId: string,
    def: ITowerDef,
    x: number, y: number
  ) {
    super(scene, instanceId, def, x, y, 0x2d7a3a);
  }

  // ירי חץ ישיר על המטרה דרך ProjectileManager מה-GameRegistry
  protected fire(target: BaseEnemy): void {
    const pm = GameRegistry.get<ProjectileManager>('projectileManager');
    if (!pm) return;
    pm.spawn(this.def, this.instanceId, this.x, this.y, target.x, target.y, target.instanceId);
  }
}
