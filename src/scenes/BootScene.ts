// סצנת האתחול - הסצנה הראשונה שרצה, ללא נכסים - עוברת מיד ל-Preloader

import Phaser from 'phaser';
import { SaveManager } from '../core/SaveManager';
import { GameRegistry } from '../core/GameRegistry';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  // אתחול: טעינת נתוני שמירה ורישום המנהלים הגלובליים לפני המשחק
  create(): void {
    // טעינת נתוני שחקן שמורים מ-localStorage
    SaveManager.load();
    GameRegistry.register('saveManager', SaveManager);

    // מעבר מיידי לסצנת הטעינה
    this.scene.start('PreloaderScene');
  }
}
