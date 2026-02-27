import Phaser from 'phaser';
import { BaseEnemy } from './BaseEnemy';
import { UNIT_SPRITES } from '../../core/AssetManifest';
import type { IEnemyDef } from '../../types/EnemyTypes';

export class TankEnemy extends BaseEnemy {
  constructor(
    scene: Phaser.Scene,
    instanceId: string,
    def: IEnemyDef,
    curve: Phaser.Curves.Path,
    roadHalfWidthPx = 0
  ) {
    super(scene, instanceId, def, curve, roadHalfWidthPx);
    this.setDepth(21); // rendered above regular enemies

    this.bodySprite = scene.add.sprite(0, 0, UNIT_SPRITES.RINO)
      .setFrame(2).setDisplaySize(64, 64).setDepth(22);
    this.setupWalkAnim(UNIT_SPRITES.RINO);
  }
}
