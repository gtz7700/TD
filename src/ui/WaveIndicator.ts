// מחוון גל - מציג מספר גל נוכחי

import Phaser from 'phaser';

export class WaveIndicator {
  private readonly text: Phaser.GameObjects.Text;

  // יצירת תצוגת מספר גל
  constructor(scene: Phaser.Scene, x: number, y: number) {
    this.text = scene.add.text(x, y, 'Wave 0', {
      fontSize: '18px', color: '#aaffaa',
    }).setOrigin(1, 0).setDepth(50);
  }

  // עדכון מספר הגל המוצג
  setWave(waveNumber: number): void {
    this.text.setText(`Wave ${waveNumber}`);
  }
}
