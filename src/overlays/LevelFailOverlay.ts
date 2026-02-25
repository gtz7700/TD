// שכבת כישלון ברמה - מוצגת כאשר השחקן מאבד את כל חייו

import Phaser from 'phaser';

export class LevelFailOverlay extends Phaser.GameObjects.Container {
  // יצירת שכבת כישלון עם אפשרויות ניסיון חוזר או יציאה
  constructor(scene: Phaser.Scene) {
    const { width, height } = scene.scale;
    super(scene, 0, 0);

    scene.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.75);

    scene.add.text(width / 2, height / 2 - 80, 'DEFEATED', {
      fontSize: '44px', fontStyle: 'bold', color: '#ff4444',
    }).setOrigin(0.5);

    // כפתור ניסיון חוזר
    const retryBtn = scene.add.rectangle(width / 2, height / 2 + 20, 200, 55, 0x1e3a5f)
      .setInteractive({ useHandCursor: true });
    scene.add.text(width / 2, height / 2 + 20, 'Retry', {
      fontSize: '20px', color: '#fff',
    }).setOrigin(0.5);
    retryBtn.on('pointerdown', () => scene.scene.restart());

    // כפתור יציאה
    const quitBtn = scene.add.rectangle(width / 2, height / 2 + 90, 200, 55, 0x3a1a1a)
      .setInteractive({ useHandCursor: true });
    scene.add.text(width / 2, height / 2 + 90, 'Quit', {
      fontSize: '20px', color: '#fff',
    }).setOrigin(0.5);
    quitBtn.on('pointerdown', () => scene.scene.start('CampaignMapScene'));

    scene.add.existing(this);
    this.setDepth(145).setVisible(false);
  }

  // הצגת שכבת הכישלון
  show(): void { this.setVisible(true); }
}
