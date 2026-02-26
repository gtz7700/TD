// שכבת סיום גל - מוצגת בין גלים עם סיכום תגמולים

import Phaser from 'phaser';
import { EventBus } from '../core/EventBus';
import { Events } from '../types/EventTypes';

export class WaveCompleteOverlay extends Phaser.GameObjects.Container {
  private readonly titleText: Phaser.GameObjects.Text;
  private readonly goldText: Phaser.GameObjects.Text;

  // יצירת שכבת סיום גל עם כפתור המשך + האזנה אוטומטית לאירועי גל
  constructor(scene: Phaser.Scene) {
    const { width, height } = scene.scale;
    super(scene, 0, 0);

    const bg = scene.add.rectangle(width / 2, height / 2, 320, 200, 0x1a1a2e, 0.95)
      .setStrokeStyle(2, 0x4a90d9);

    this.titleText = scene.add.text(width / 2, height / 2 - 60, '', {
      fontSize: '24px', fontStyle: 'bold', color: '#ffd700',
    }).setOrigin(0.5);

    this.goldText = scene.add.text(width / 2, height / 2 - 10, '', {
      fontSize: '18px', color: '#ffd700',
    }).setOrigin(0.5);

    const continueBtn = scene.add.rectangle(width / 2, height / 2 + 60, 180, 50, 0x2d5a27)
      .setInteractive({ useHandCursor: true });
    const continueText = scene.add.text(width / 2, height / 2 + 60, 'Next Wave', {
      fontSize: '18px', color: '#fff',
    }).setOrigin(0.5);

    continueBtn.on('pointerdown', () => this.setVisible(false));

    this.add([bg, this.titleText, this.goldText, continueBtn, continueText]);
    scene.add.existing(this);
    this.setDepth(130).setVisible(false);

    // האזנה עצמאית לסיום גל - לא תלוי בסצנת האב
    EventBus.on(Events.WAVE_COMPLETE, (p) => this.show(p.waveNumber, p.goldBonus));
  }

  // הצגת תוצאות הגל שהסתיים
  show(waveNumber: number, goldBonus: number): void {
    this.titleText.setText(`Wave ${waveNumber} Complete!`);
    this.goldText.setText(`+⬡ ${goldBonus} Bonus Gold`);
    this.setVisible(true);
  }
}
