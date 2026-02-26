import Phaser from 'phaser';
import { BaseEnemy } from './BaseEnemy';
import type { IEnemyDef } from '../../types/EnemyTypes';

export class RegularEnemy extends BaseEnemy {
  constructor(
    scene: Phaser.Scene,
    instanceId: string,
    def: IEnemyDef,
    curve: Phaser.Curves.Path
  ) {
    super(scene, instanceId, def, curve);

    // Goblin: fat arrow pointing right (+x = forward direction before rotation)
    //   tip at (9, 0), back corners at (-6, ±7)
    const g = this.bodyGfx;
    g.fillStyle(0x44aa44, 1);
    g.fillTriangle(9, 0, -6, -7, -6, 7);
    g.lineStyle(1, 0xaaffaa, 0.8);
    g.strokeTriangle(9, 0, -6, -7, -6, 7);
    // tiny eye — offset left (front of arrow in local +x)
    g.fillStyle(0xffffff, 0.9);
    g.fillCircle(5, -2, 2);
  }
}
