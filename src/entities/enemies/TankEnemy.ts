// אויב כבד - HP ומגן גבוהים, מהירות נמוכה, גורם -5 נזק לשחקן עם הגעה

import Phaser from 'phaser';
import { BaseEnemy } from './BaseEnemy';
import { PathManager } from '../../managers/PathManager';
import type { IEnemyDef } from '../../types/EnemyTypes';

export class TankEnemy extends BaseEnemy {
  // יצירת אויב כבד - צבע כתום כהה להבחנה, גוף גדול יותר
  constructor(
    scene: Phaser.Scene,
    instanceId: string,
    def: IEnemyDef,
    route: string[],
    pathManager: PathManager
  ) {
    super(scene, instanceId, def, route, pathManager);
    this.setFillStyle(0xcc5500); // כתום = כבד ומסוכן מאוד
    this.setDepth(21); // ממוצב מעל אויבים רגילים
  }
}
