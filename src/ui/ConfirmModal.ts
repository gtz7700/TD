// מודל אישור גנרי - שני כפתורי בחירה עם callback

import Phaser from 'phaser';

export class ConfirmModal extends Phaser.GameObjects.Container {
  // יצירת מודל אישור עם שאלה וכפתורי אישור/ביטול
  constructor(
    scene: Phaser.Scene,
    message: string,
    confirmLabel: string,
    cancelLabel: string,
    onConfirm: () => void,
    onCancel: () => void,
  ) {
    const { width, height } = scene.scale;
    super(scene, 0, 0);

    // כיסוי שקוף
    const overlay = scene.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.6)
      .setInteractive();

    // מסגרת
    const panel = scene.add.rectangle(width / 2, height / 2, 320, 200, 0x1a1a2e)
      .setStrokeStyle(2, 0x4a90d9);

    // הודעה
    const msg = scene.add.text(width / 2, height / 2 - 50, message, {
      fontSize: '18px', color: '#ffffff', align: 'center', wordWrap: { width: 280 },
    }).setOrigin(0.5);

    // כפתור אישור
    const confirmBtn = scene.add.rectangle(width / 2 - 80, height / 2 + 50, 130, 44, 0x8b2020)
      .setInteractive({ useHandCursor: true });
    const confirmText = scene.add.text(width / 2 - 80, height / 2 + 50, confirmLabel, {
      fontSize: '16px', color: '#ffffff',
    }).setOrigin(0.5);
    confirmBtn.on('pointerdown', () => { this.setVisible(false); onConfirm(); });

    // כפתור ביטול
    const cancelBtn = scene.add.rectangle(width / 2 + 80, height / 2 + 50, 130, 44, 0x2d5a27)
      .setInteractive({ useHandCursor: true });
    const cancelText = scene.add.text(width / 2 + 80, height / 2 + 50, cancelLabel, {
      fontSize: '16px', color: '#ffffff',
    }).setOrigin(0.5);
    cancelBtn.on('pointerdown', () => { this.setVisible(false); onCancel(); });

    this.add([overlay, panel, msg, confirmBtn, confirmText, cancelBtn, cancelText]);
    scene.add.existing(this);
    this.setDepth(200);
    this.setVisible(false);
  }

  // הצגת המודל
  show(): void { this.setVisible(true); }

  // הסתרת המודל
  hide(): void { this.setVisible(false); }
}
