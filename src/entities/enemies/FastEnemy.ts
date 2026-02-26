import Phaser from 'phaser';
import { BaseEnemy } from './BaseEnemy';
import type { IEnemyDef } from '../../types/EnemyTypes';

export class FastEnemy extends BaseEnemy {
  constructor(
    scene: Phaser.Scene,
    instanceId: string,
    def: IEnemyDef,
    curve: Phaser.Curves.Path
  ) {
    super(scene, instanceId, def, curve);

    // Scout: slim, elongated arrowhead — low-profile to hint at speed
    //   tip at (11, 0), back corners at (-5, ±4), tail fins at (-7, ±5)
    const g = this.bodyGfx;
    g.fillStyle(0xeecc00, 1);
    g.fillTriangle(11, 0, -5, -4, -5, 4);
    // small wing fins for "speedy" look
    g.fillTriangle(-5, -4, -7, -6, -3, -2);
    g.fillTriangle(-5,  4, -7,  6, -3,  2);
    g.lineStyle(1, 0xffee88, 0.75);
    g.strokeTriangle(11, 0, -5, -4, -5, 4);
  }
}
