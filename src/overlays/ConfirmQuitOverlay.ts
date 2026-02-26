// שכבת אישור יציאה - מוצגת לפני עזיבת משחק פעיל

import Phaser from 'phaser';
import { ConfirmModal } from '../ui/ConfirmModal';
import { EventBus } from '../core/EventBus';
import { Events } from '../types/EventTypes';

export class ConfirmQuitOverlay {
  private readonly modal: ConfirmModal;

  // יצירת מודל אישור יציאה עם ניווט דרך EventBus (UIScene מטפל במעבר)
  constructor(scene: Phaser.Scene) {
    this.modal = new ConfirmModal(
      scene,
      'Leave the game?\nYour progress will be lost.',
      'Quit',
      'Stay',
      () => EventBus.emit(Events.UI_NAVIGATE_REQUEST, { sceneKey: 'CampaignMapScene' }), // יציאה דרך UIScene
      () => {},  // ביטול - חזרה למשחק
    );
  }

  // הצגת חלון האישור
  show(): void {
    this.modal.show();
  }
}
