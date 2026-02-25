// כפתור חזרה - רכיב ניווט המופיע בכל המסכים

import Phaser from 'phaser';

export class BackButton {
  private readonly btn: Phaser.GameObjects.Container;

  // יצירת כפתור חזרה בפינה שמאלית עליונה עם callback ניווט
  constructor(scene: Phaser.Scene, onBack: () => void) {
    const bg = scene.add.rectangle(0, 0, 70, 44, 0x333333, 0.85)
      .setInteractive({ useHandCursor: true });

    const label = scene.add.text(0, 0, '< Back', {
      fontSize: '15px', color: '#ffffff',
    }).setOrigin(0.5);

    this.btn = scene.add.container(50, 40, [bg, label]);
    this.btn.setDepth(100); // מעל כל שאר האלמנטים

    bg.on('pointerdown', onBack);
    bg.on('pointerover',  () => bg.setFillStyle(0x555555, 0.9));
    bg.on('pointerout',   () => bg.setFillStyle(0x333333, 0.85));
  }

  // הצגה/הסתרה של כפתור החזרה
  setVisible(visible: boolean): this {
    this.btn.setVisible(visible);
    return this;
  }
}
