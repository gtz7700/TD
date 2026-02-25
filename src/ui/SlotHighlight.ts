// הדגשת אזור הנחה - מציג משוב ויזואלי בגרירת יחידה מעל slot

import Phaser from 'phaser';
import type { ISlotDef } from '../types/MapTypes';

export class SlotHighlight {
  private readonly graphics: Phaser.GameObjects.Graphics;

  // יצירת שכבת גרפיקה להדגשת אזורים
  constructor(scene: Phaser.Scene) {
    this.graphics = scene.add.graphics().setDepth(25);
  }

  // ציור מלבן הדגשה מסביב לאזור - ירוק לתקין, אדום לבלתי אפשרי
  highlight(slot: ISlotDef, valid: boolean): void {
    this.graphics.clear();
    const color = valid ? 0x00ff88 : 0xff4444;
    this.graphics.lineStyle(3, color, 0.9);
    this.graphics.strokeRect(slot.rect.x, slot.rect.y, slot.rect.width, slot.rect.height);
    this.graphics.fillStyle(color, 0.12);
    this.graphics.fillRect(slot.rect.x, slot.rect.y, slot.rect.width, slot.rect.height);
  }

  // ניקוי כל ההדגשות
  clear(): void {
    this.graphics.clear();
  }
}
