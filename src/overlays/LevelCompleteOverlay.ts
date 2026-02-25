// שכבת השלמת רמה - מוצגת בסיום מוצלח עם כוכבים ותגמולים

import Phaser from 'phaser';
import { SaveManager } from '../core/SaveManager';

export class LevelCompleteOverlay extends Phaser.GameObjects.Container {
  private readonly starsContainer: Phaser.GameObjects.Container;
  private readonly gemsText: Phaser.GameObjects.Text;

  // יצירת שכבת הצלחה עם פאנל תוצאות וכפתורי ניווט
  constructor(scene: Phaser.Scene) {
    const { width, height } = scene.scale;
    super(scene, 0, 0);

    scene.add.rectangle(width / 2, height / 2, 340, 300, 0x0d1a0d, 0.97)
      .setStrokeStyle(2, 0x44cc44);

    scene.add.text(width / 2, height / 2 - 110, 'LEVEL COMPLETE!', {
      fontSize: '26px', fontStyle: 'bold', color: '#44ff44',
    }).setOrigin(0.5);

    this.starsContainer = scene.add.container(width / 2, height / 2 - 50);
    this.gemsText = scene.add.text(width / 2, height / 2 + 10, '', {
      fontSize: '20px', color: '#aaaaff',
    }).setOrigin(0.5);

    // כפתור המשך
    const nextBtn = scene.add.rectangle(width / 2, height / 2 + 80, 200, 55, 0x1a4a1a)
      .setInteractive({ useHandCursor: true });
    scene.add.text(width / 2, height / 2 + 80, 'Continue', {
      fontSize: '20px', color: '#fff',
    }).setOrigin(0.5);
    nextBtn.on('pointerdown', () => scene.scene.start('CampaignMapScene'));

    this.add([this.starsContainer, this.gemsText]);
    scene.add.existing(this);
    this.setDepth(140).setVisible(false);
  }

  // הצגת תוצאות הרמה עם עדכון שמירה
  show(_stars: 1 | 2 | 3, gemsEarned: number): void {
    this.starsContainer.removeAll(true);
    // כוכבים ייוצגו בשכבת הסצנה (לא בcontainer) - TODO
    this.gemsText.setText(`+◆ ${gemsEarned} Gems Earned`);
    this.setVisible(true);

    // עדכון שמירה
    const progress = SaveManager.getProgress();
    SaveManager.updateProgress({ gems: progress.gems + gemsEarned });
  }
}
