// שכבת מידע מגדל - מוצגת בלחיצה על מגדל עם אפשרויות שדרוג ומכירה

import Phaser from 'phaser';
import { EventBus } from '../core/EventBus';
import { Events } from '../types/EventTypes';

export class TowerInfoOverlay extends Phaser.GameObjects.Container {
  private readonly nameText: Phaser.GameObjects.Text;
  private readonly statsText: Phaser.GameObjects.Text;
  private currentInstanceId: string | null = null;

  // יצירת פאנל מידע מגדל בתחתית המסך
  constructor(scene: Phaser.Scene) {
    const { width, height } = scene.scale;
    super(scene, 0, 0);

    const panel = scene.add.rectangle(width / 2, height - 120, width, 200, 0x0d1117, 0.95)
      .setStrokeStyle(1, 0x333333);

    this.nameText  = scene.add.text(20, height - 200, '', { fontSize: '18px', fontStyle: 'bold', color: '#ffffff' });
    this.statsText = scene.add.text(20, height - 175, '', { fontSize: '14px', color: '#aaaaaa' });

    // כפתור מכירה
    const sellBtn = scene.add.rectangle(width - 60, height - 130, 100, 44, 0x8b2020)
      .setInteractive({ useHandCursor: true });
    const sellText = scene.add.text(width - 60, height - 130, 'Sell', {
      fontSize: '16px', color: '#fff',
    }).setOrigin(0.5);

    sellBtn.on('pointerdown', () => {
      if (this.currentInstanceId) {
        EventBus.emit(Events.TOWER_SOLD, {
          instanceId: this.currentInstanceId,
          refundGold: 0, // מחושב ע"י UpgradeManager
        });
        this.hide();
      }
    });

    this.add([panel, this.nameText, this.statsText, sellBtn, sellText]);
    scene.add.existing(this);
    this.setDepth(120).setVisible(false);

    // האזנה לבחירת מגדל
    EventBus.on(Events.TOWER_SELECTED,   (p) => this.showForTower(p.instanceId));
    EventBus.on(Events.TOWER_DESELECTED, () => this.hide());
  }

  // הצגת מידע עבור מגדל ספציפי
  showForTower(instanceId: string): void {
    this.currentInstanceId = instanceId;
    this.nameText.setText(`Tower: ${instanceId}`);
    this.statsText.setText('Tap Upgrade to improve stats');
    this.setVisible(true);
  }

  // הסתרת הפאנל
  hide(): void {
    this.currentInstanceId = null;
    this.setVisible(false);
  }
}
