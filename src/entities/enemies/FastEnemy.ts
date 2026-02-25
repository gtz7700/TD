// אויב מהיר - מהירות גבוהה, גוף קטן, גורם -3 נזק לשחקן עם הגעה

import Phaser from 'phaser';
import { BaseEnemy } from './BaseEnemy';
import { PathManager } from '../../managers/PathManager';
import type { IEnemyDef } from '../../types/EnemyTypes';

export class FastEnemy extends BaseEnemy {
  // יצירת אויב מהיר - צבע צהוב להבחנה מהירה
  constructor(
    scene: Phaser.Scene,
    instanceId: string,
    def: IEnemyDef,
    route: string[],
    pathManager: PathManager
  ) {
    super(scene, instanceId, def, route, pathManager);
    this.setFillStyle(0xeecc00); // צהוב = מהיר ומסוכן
  }
}
