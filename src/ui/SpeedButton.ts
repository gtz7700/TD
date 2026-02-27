// כפתור מהירות משחק - מחזורי X1 / X2 / X3
// מוצב שמאלית לכפתור ההשהייה (PauseButton) בפינה ימנית עליונה

import Phaser from 'phaser';
import { EventBus } from '../core/EventBus';
import { Events } from '../types/EventTypes';

const SPEEDS: Array<1 | 2 | 3> = [1, 2, 3];
const SPEED_COLORS = ['#ffdd44', '#ff9900', '#ff4444'];

export class SpeedButton {
  constructor(scene: Phaser.Scene) {
    const { width } = scene.scale;
    const W = 48;
    const H = 34;
    // 4px gap to the left of PauseButton (which sits at width-52)
    const x = width - 52 - 4 - W;
    const y = 6;

    let speedIndex = 0;

    const bg = scene.add.graphics();

    const label = scene.add.text(x + W / 2, y + H / 2, 'X1', {
      fontSize: '14px', color: SPEED_COLORS[0], fontStyle: 'bold',
    }).setOrigin(0.5);

    const drawBg = (hover: boolean) => {
      bg.clear();
      bg.fillStyle(hover ? 0x333333 : 0x1a1a1a, 0.85);
      bg.fillRoundedRect(x, y, W, H, 5);
      bg.lineStyle(1, hover ? 0x999999 : 0x777777, 0.8);
      bg.strokeRoundedRect(x, y, W, H, 5);
    };

    drawBg(false);

    const hitArea = scene.add.rectangle(x + W / 2, y + H / 2, W, H, 0xffffff, 0)
      .setInteractive({ useHandCursor: true });

    bg.setDepth(101);
    label.setDepth(102);
    hitArea.setDepth(102);

    hitArea.on('pointerdown', () => {
      speedIndex = (speedIndex + 1) % SPEEDS.length;
      const scale = SPEEDS[speedIndex];
      label.setText(`X${scale}`).setColor(SPEED_COLORS[speedIndex]);
      EventBus.emit(Events.GAME_SPEED_CHANGED, { scale });
    });

    hitArea.on('pointerover',  () => drawBg(true));
    hitArea.on('pointerout',   () => drawBg(false));
  }
}
