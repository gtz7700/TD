// כפתור השהייה קטן - מוצב בפינה ימנית עליונה, לא מסתיר את ה-HUD

import Phaser from 'phaser';

export class PauseButton {
  constructor(scene: Phaser.Scene, onPause: () => void) {
    const { width } = scene.scale;
    const x = width - 52;
    const y = 6;
    const W = 44;
    const H = 34;

    const bg = scene.add.graphics();
    bg.fillStyle(0x1a1a1a, 0.85);
    bg.fillRoundedRect(x, y, W, H, 5);
    bg.lineStyle(1, 0x777777, 0.8);
    bg.strokeRoundedRect(x, y, W, H, 5);

    const label = scene.add.text(x + W / 2, y + H / 2, '⏸', {
      fontSize: '16px', color: '#ffffff',
    }).setOrigin(0.5);

    // אזור לחיצה
    const hitArea = scene.add.rectangle(x + W / 2, y + H / 2, W, H, 0xffffff, 0)
      .setInteractive({ useHandCursor: true });

    bg.setDepth(101);
    label.setDepth(102);
    hitArea.setDepth(102);

    hitArea.on('pointerdown', onPause);
    hitArea.on('pointerover',  () => { bg.clear(); bg.fillStyle(0x333333, 0.9); bg.fillRoundedRect(x, y, W, H, 5); bg.lineStyle(1, 0x999999, 1); bg.strokeRoundedRect(x, y, W, H, 5); });
    hitArea.on('pointerout',   () => { bg.clear(); bg.fillStyle(0x1a1a1a, 0.85); bg.fillRoundedRect(x, y, W, H, 5); bg.lineStyle(1, 0x777777, 0.8); bg.strokeRoundedRect(x, y, W, H, 5); });
  }
}
