// שכבת אישור יציאה - מוצגת לפני עזיבת משחק פעיל

import Phaser from 'phaser';
import { ConfirmModal } from '../ui/ConfirmModal';

export class ConfirmQuitOverlay {
  private readonly modal: ConfirmModal;

  // יצירת מודל אישור יציאה עם מעבר לבחירת רמות
  constructor(scene: Phaser.Scene) {
    this.modal = new ConfirmModal(
      scene,
      'Leave the game?\nYour progress will be lost.',
      'Quit',
      'Stay',
      () => scene.scene.start('CampaignMapScene'), // יציאה - חזרה למפה
      () => {},                                     // ביטול - חזרה למשחק
    );
  }

  // הצגת חלון האישור
  show(): void {
    this.modal.show();
  }
}
