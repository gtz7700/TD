// אויב רגיל - מהירות בינונית, גורם -2 נזק לשחקן עם הגעה

import Phaser from 'phaser';
import { BaseEnemy } from './BaseEnemy';
import { PathManager } from '../../managers/PathManager';
import type { IEnemyDef } from '../../types/EnemyTypes';

export class RegularEnemy extends BaseEnemy {
  // יצירת אויב רגיל - צבע ירוק כהה להבחנה
  constructor(
    scene: Phaser.Scene,
    instanceId: string,
    def: IEnemyDef,
    route: string[],
    pathManager: PathManager
  ) {
    super(scene, instanceId, def, route, pathManager);
    this.setFillStyle(0x44aa44); // ירוק כהה = אויב רגיל
  }
}
