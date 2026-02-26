import Phaser from 'phaser';
import { BaseEnemy } from './BaseEnemy';
import type { IEnemyDef } from '../../types/EnemyTypes';

export class TankEnemy extends BaseEnemy {
  constructor(
    scene: Phaser.Scene,
    instanceId: string,
    def: IEnemyDef,
    curve: Phaser.Curves.Path
  ) {
    super(scene, instanceId, def, curve);
    this.setDepth(21); // rendered above regular enemies

    // Ogre: bulky rectangle body + forward snout — big and slow
    const g = this.bodyGfx.setDepth(22);
    // body block
    g.fillStyle(0xcc5500, 1);
    g.fillRect(-9, -9, 18, 18);
    g.lineStyle(1.5, 0xff8844, 0.9);
    g.strokeRect(-9, -9, 18, 18);
    // front snout (pointing right = forward)
    g.fillStyle(0xdd6611, 1);
    g.fillTriangle(9, -4, 9, 4, 14, 0);
    // eyes — two small white dots
    g.fillStyle(0xffffff, 0.9);
    g.fillCircle(4, -4, 2);
    g.fillCircle(4,  4, 2);
  }
}
