// שכבת השהייה - מוצגת מעל סצנת המשחק עם אפשרויות המשך/הפעלה מחדש

import Phaser from 'phaser';
import { EventBus } from '../core/EventBus';
import { Events } from '../types/EventTypes';

export class PauseOverlay extends Phaser.GameObjects.Container {
  // יצירת שכבת השהייה כ-Container מוסתר מעל המשחק
  constructor(scene: Phaser.Scene) {
    const { width, height } = scene.scale;
    super(scene, 0, 0);

    const bg = scene.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.7)
      .setInteractive();

    scene.add.text(width / 2, height / 2 - 100, 'PAUSED', {
      fontSize: '40px', fontStyle: 'bold', color: '#ffffff',
    }).setOrigin(0.5);

    // כפתור המשך
    const resumeBtn = this.createButton(scene, width / 2, height / 2, 'RESUME', () => {
      this.setVisible(false);
      EventBus.emit(Events.GAME_RESUMED, {} as never);
    });

    this.add([bg, resumeBtn]);
    scene.add.existing(this);
    this.setDepth(150).setVisible(false);
  }

  // עזר ליצירת כפתור מעוצב
  private createButton(
    scene: Phaser.Scene,
    x: number, y: number,
    label: string,
    onClick: () => void
  ): Phaser.GameObjects.Container {
    const btn = scene.add.rectangle(0, 0, 200, 55, 0x2d5a27).setInteractive({ useHandCursor: true });
    const txt = scene.add.text(0, 0, label, { fontSize: '20px', color: '#fff' }).setOrigin(0.5);
    const c = scene.add.container(x, y, [btn, txt]);
    btn.on('pointerdown', onClick);
    return c;
  }

  // הצגת שכבת ההשהייה
  show(): void {
    this.setVisible(true);
    EventBus.emit(Events.GAME_PAUSED, {} as never);
  }
}
