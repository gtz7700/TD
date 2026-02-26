// Level fail overlay - shown when the player loses all lives

import Phaser from 'phaser';
import { EventBus } from '../core/EventBus';
import { Events } from '../types/EventTypes';

export class LevelFailOverlay extends Phaser.GameObjects.Container {
  constructor(scene: Phaser.Scene) {
    const { width, height } = scene.scale;
    const cx = width / 2;
    const cy = height / 2;
    super(scene, 0, 0);

    // All objects added to THIS container so setVisible(false) hides everything
    const bg = scene.add.rectangle(cx, cy, width, height, 0x000000, 0.75)
      .setInteractive();

    const title = scene.add.text(cx, cy - 80, 'DEFEATED', {
      fontSize: '44px', fontStyle: 'bold', color: '#ff4444',
    }).setOrigin(0.5);

    const retryBtn = scene.add.rectangle(cx, cy + 20, 200, 55, 0x1e3a5f)
      .setInteractive({ useHandCursor: true });
    const retryTxt = scene.add.text(cx, cy + 20, 'Retry', {
      fontSize: '20px', color: '#fff',
    }).setOrigin(0.5);
    retryBtn.on('pointerdown', () => EventBus.emit(Events.GAME_RETRY_REQUESTED, {} as never));

    const quitBtn = scene.add.rectangle(cx, cy + 90, 200, 55, 0x3a1a1a)
      .setInteractive({ useHandCursor: true });
    const quitTxt = scene.add.text(cx, cy + 90, 'Quit', {
      fontSize: '20px', color: '#fff',
    }).setOrigin(0.5);
    quitBtn.on('pointerdown', () =>
      EventBus.emit(Events.UI_NAVIGATE_REQUEST, { sceneKey: 'CampaignMapScene' })
    );

    this.add([bg, title, retryBtn, retryTxt, quitBtn, quitTxt]);
    scene.add.existing(this);
    this.setDepth(145).setVisible(false);

    EventBus.on(Events.PLAYER_DEFEATED, () => this.show());
  }

  show(): void { this.setVisible(true); }
}
