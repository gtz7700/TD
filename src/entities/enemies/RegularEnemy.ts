import Phaser from 'phaser';
import { BaseEnemy } from './BaseEnemy';
import { UNIT_SPRITES } from '../../core/AssetManifest';
import type { IEnemyDef } from '../../types/EnemyTypes';

export class RegularEnemy extends BaseEnemy {
  constructor(
    scene: Phaser.Scene,
    instanceId: string,
    def: IEnemyDef,
    curve: Phaser.Curves.Path,
    roadHalfWidthPx = 0
  ) {
    super(scene, instanceId, def, curve, roadHalfWidthPx);

    this.bodySprite = scene.add.sprite(0, 0, UNIT_SPRITES.GOBLIN)
      .setFrame(2).setDisplaySize(48, 48).setDepth(21);
    this.setupWalkAnim(UNIT_SPRITES.GOBLIN);
  }
}
