// מחוון גל עם פאנל רקע - מציג מספר גל נוכחי וספירה לאחור לפני גל ראשון

import Phaser from 'phaser';
import { EventBus } from '../core/EventBus';
import { Events } from '../types/EventTypes';

const PANEL_W = 140;
const PANEL_H = 36;

export class WaveIndicator {
  private readonly valueText: Phaser.GameObjects.Text;
  private readonly scene: Phaser.Scene;
  private countdownTimer: Phaser.Time.TimerEvent | null = null;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    this.scene = scene;

    const container = scene.add.container(x, y).setDepth(100);

    const bg = scene.add.graphics();
    bg.fillStyle(0x000000, 0.65);
    bg.fillRoundedRect(0, 0, PANEL_W, PANEL_H, 6);
    bg.lineStyle(1, 0x888888, 0.8);
    bg.strokeRoundedRect(0, 0, PANEL_W, PANEL_H, 6);

    const icon = scene.add.graphics();
    icon.fillStyle(0xaaffaa, 1);
    icon.fillTriangle(16, PANEL_H / 2 - 7, 24, PANEL_H / 2 + 7, 8, PANEL_H / 2 + 7);

    this.valueText = scene.add.text(32, PANEL_H / 2, 'Get Ready!', {
      fontSize: '13px', color: '#ffff88',
    }).setOrigin(0, 0.5);

    container.add([bg, icon, this.valueText]);

    // ספירה לאחור לפני גל ראשון
    EventBus.on(Events.WAVE_PREP_STARTED, (p) => {
      let remaining = Math.ceil(p.totalMs / 1000);
      this.valueText.setText(`Wave 1 in ${remaining}s`).setColor('#ffff88');
      this.countdownTimer = scene.time.addEvent({
        delay: 1000,
        repeat: remaining - 1,
        callback: () => {
          remaining--;
          if (remaining > 0) {
            this.valueText.setText(`Wave 1 in ${remaining}s`);
          }
        },
      });
    });

    // עדכון לגל פעיל
    EventBus.on(Events.WAVE_STARTED, (p) => {
      this.countdownTimer?.remove();
      this.countdownTimer = null;
      this.valueText.setText(`Wave ${p.waveNumber}`).setColor('#aaffaa');
    });
  }

  setWave(waveNumber: number): void {
    this.valueText.setText(`Wave ${waveNumber}`).setColor('#aaffaa');
  }
}
