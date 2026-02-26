// Level complete overlay - shown on successful level finish with stars and rewards

import Phaser from 'phaser';
import { EventBus } from '../core/EventBus';
import { Events } from '../types/EventTypes';
import { SaveManager } from '../core/SaveManager';

export class LevelCompleteOverlay extends Phaser.GameObjects.Container {
  private readonly starsContainer: Phaser.GameObjects.Container;
  private readonly gemsText: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene) {
    const { width, height } = scene.scale;
    const cx = width / 2;
    const cy = height / 2;
    super(scene, 0, 0);

    // All objects added to THIS container so setVisible(false) hides everything
    const bg = scene.add.rectangle(cx, cy, 340, 320, 0x0d1a0d, 0.97)
      .setStrokeStyle(2, 0x44cc44);

    const title = scene.add.text(cx, cy - 120, 'LEVEL COMPLETE!', {
      fontSize: '26px', fontStyle: 'bold', color: '#44ff44',
    }).setOrigin(0.5);

    this.starsContainer = scene.add.container(cx, cy - 50);

    this.gemsText = scene.add.text(cx, cy + 20, '', {
      fontSize: '20px', color: '#aaaaff',
    }).setOrigin(0.5);

    const nextBtn = scene.add.rectangle(cx, cy + 90, 200, 55, 0x1a4a1a)
      .setInteractive({ useHandCursor: true });
    const nextTxt = scene.add.text(cx, cy + 90, 'Continue', {
      fontSize: '20px', color: '#fff',
    }).setOrigin(0.5);
    nextBtn.on('pointerdown', () =>
      EventBus.emit(Events.UI_NAVIGATE_REQUEST, { sceneKey: 'CampaignMapScene' })
    );

    this.add([bg, title, this.starsContainer, this.gemsText, nextBtn, nextTxt]);
    scene.add.existing(this);
    this.setDepth(140).setVisible(false);

    EventBus.on(Events.LEVEL_COMPLETE, (p) => this.show(p.stars, p.gemsEarned));
  }

  show(stars: 1 | 2 | 3, gemsEarned: number): void {
    this.buildStars(stars);
    this.gemsText.setText(`+◆ ${gemsEarned} Gems Earned`);
    this.setVisible(true);

    const progress = SaveManager.getProgress();
    SaveManager.updateProgress({ gems: progress.gems + gemsEarned });
  }

  private buildStars(earnedStars: number): void {
    this.starsContainer.removeAll(true);

    const positions = [-52, 0, 52];
    positions.forEach((xOff, i) => {
      const filled  = i < earnedStars;
      const color   = filled ? 0xffd700 : 0x555555;
      const outline = filled ? 0xffaa00 : 0x333333;

      const star = this.scene.add.star(xOff, 0, 5, 14, 28, color)
        .setStrokeStyle(2, outline);

      this.starsContainer.add(star as unknown as Phaser.GameObjects.GameObject);
    });
  }
}
