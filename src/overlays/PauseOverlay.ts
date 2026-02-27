// שכבת השהייה - מוצגת מעל סצנת המשחק עם אפשרויות המשך/יציאה

import Phaser from 'phaser';
import { EventBus } from '../core/EventBus';
import { Events } from '../types/EventTypes';

export class PauseOverlay extends Phaser.GameObjects.Container {
  constructor(scene: Phaser.Scene) {
    const { width, height } = scene.scale;
    const cx = width / 2;
    const cy = height / 2;
    super(scene, 0, 0);

    // רקע כהה חוסם קלט
    const bg = scene.add.rectangle(cx, cy, width, height, 0x000000, 0.72)
      .setInteractive();

    // כותרת
    const title = scene.add.text(cx, cy - 70, 'PAUSED', {
      fontSize: '36px', fontStyle: 'bold', color: '#ffffff',
    }).setOrigin(0.5);

    // כפתור המשך
    const resumeBtn = this.createButton(scene, cx, cy, 'RESUME', 0x2d5a27, () => {
      this.setVisible(false);
      EventBus.emit(Events.GAME_RESUMED, {} as never);
    });

    // כפתור יציאה
    const quitBtn = this.createButton(scene, cx, cy + 70, 'QUIT GAME', 0x5a2727, () => {
      this.setVisible(false);
      EventBus.emit(Events.UI_NAVIGATE_REQUEST, { sceneKey: 'MainMenuScene' });
    });

    this.add([bg, title, resumeBtn, quitBtn]);
    scene.add.existing(this);
    this.setDepth(150).setVisible(false);
  }

  // עזר ליצירת כפתור מעוצב
  private createButton(
    scene: Phaser.Scene,
    x: number, y: number,
    label: string,
    color: number,
    onClick: () => void
  ): Phaser.GameObjects.Container {
    const btn = scene.add.rectangle(0, 0, 200, 52, color).setInteractive({ useHandCursor: true });
    const txt = scene.add.text(0, 0, label, { fontSize: '18px', color: '#fff' }).setOrigin(0.5);
    const c = scene.add.container(x, y, [btn, txt]);
    btn.on('pointerdown', onClick);
    btn.on('pointerover',  () => btn.setFillStyle(Phaser.Display.Color.IntegerToColor(color).brighten(30).color));
    btn.on('pointerout',   () => btn.setFillStyle(color));
    return c;
  }

  // הצגת שכבת ההשהייה ושליחת אירוע השהייה
  show(): void {
    this.setVisible(true);
    EventBus.emit(Events.GAME_PAUSED, {} as never);
  }
}
