// גלריית גיבורים - ניהול שדרוגים קבועים של גיבורים באמצעות אבנים/גלינט

import Phaser from 'phaser';
import { BackButton } from '../ui/BackButton';
import { SaveManager } from '../core/SaveManager';
import { DATA_KEYS, UNIT_SPRITES } from '../core/AssetManifest';
import { EventBus } from '../core/EventBus';
import { Events } from '../types/EventTypes';
import type { IHeroDef } from '../types/UnitTypes';
import type { IUpgradeTree, IUpgradeNode } from '../types/UpgradeTypes';

export class HeroGalleryScene extends Phaser.Scene {
  private _selectedHeroId: string | null = null;
  private upgradeContainer!: Phaser.GameObjects.Container;

  constructor() {
    super({ key: 'HeroGalleryScene' });
  }

  // יצירת ממשק גלריית גיבורים עם רשת גיבורים ופאנל שדרוגים
  create(): void {
    const { width, height } = this.scale;
    const progress = SaveManager.getProgress();

    this.add.rectangle(0, 0, width, height, 0x0d0d1a).setOrigin(0);
    this.add.text(width / 2, 60, 'HERO GALLERY', {
      fontSize: '30px', fontStyle: 'bold', color: '#ffd700',
    }).setOrigin(0.5);

    // הצגת מאזן אבנים
    const gemsText = this.add.text(width - 20, 60,
      `◆ ${progress.gems}`, { fontSize: '18px', color: '#aaaaff' }
    ).setOrigin(1, 0.5);

    new BackButton(this, () => this.scene.start('MainMenuScene'));

    // טעינת נתוני גיבורים ושדרוגים מהכמחסן
    const heroesData = this.cache.json.get(DATA_KEYS.HEROES) as { heroes: IHeroDef[] };
    const upgradesData = this.cache.json.get(DATA_KEYS.HERO_UPGRADES) as { trees: IUpgradeTree[] };

    this.upgradeContainer = this.add.container(0, 0);

    // יצירת כפתור לכל גיבור
    heroesData.heroes.forEach((hero, i) => {
      this.createHeroCard(hero, i, progress.heroGalleryUnlocks[hero.id] ?? false,
        upgradesData.trees, progress.gems, gemsText);
    });
  }

  // יצירת כרטיס גיבור עם מצב נעילה ואפשרות בחירה
  private createHeroCard(
    hero: IHeroDef,
    index: number,
    unlocked: boolean,
    trees: IUpgradeTree[],
    gems: number,
    gemsText: Phaser.GameObjects.Text
  ): void {
    const { width } = this.scale;
    const x = width / 2;
    const y = 180 + index * 160;
    const color = unlocked ? 0x1a3a5a : 0x2a2a2a;

    const card = this.add.rectangle(x, y, 340, 130, color)
      .setStrokeStyle(2, unlocked ? 0x4488cc : 0x444444);

    const spriteKey = hero.id === 'warrior'    ? UNIT_SPRITES.WARRIOR
      : hero.id === 'archer_hero'              ? UNIT_SPRITES.ARCHER_HERO
      : undefined;

    if (spriteKey) {
      this.add.sprite(x - 130, y, spriteKey)
        .setFrame(0).setDisplaySize(80, 80).setOrigin(0.5).setAlpha(unlocked ? 1 : 0.4);
    }

    this.add.text(spriteKey ? x + 10 : x, y - 30, hero.name, {
      fontSize: '20px', color: unlocked ? '#ffffff' : '#666666',
    }).setOrigin(0.5);

    if (!unlocked) {
      this.add.text(x, y + 15, `Unlock: ◆ ${hero.unlockCostGems}`, {
        fontSize: '14px', color: '#aaaaff',
      }).setOrigin(0.5);
      return;
    }

    card.setInteractive({ useHandCursor: true });
    card.on('pointerdown', () => {
      this._selectedHeroId = hero.id;
      this.showUpgradePanel(hero, trees, gems, gemsText);
    });
  }

  // הצגת פאנל שדרוגים לגיבור שנבחר
  private showUpgradePanel(
    hero: IHeroDef,
    trees: IUpgradeTree[],
    gems: number,
    gemsText: Phaser.GameObjects.Text
  ): void {
    this.upgradeContainer.removeAll(true);
    const tree = trees.find(t => t.targetId === hero.id);
    if (!tree) return;

    const progress = SaveManager.getProgress();
    const purchased = progress.heroGalleryUpgrades[hero.id] ?? [];

    tree.nodes.forEach((node, i) => {
      const yPos = 600 + i * 80;
      const canBuy = !purchased.includes(node.nodeId) &&
        node.prerequisiteNodeIds.every(p => purchased.includes(p)) &&
        gems >= node.cost;

      const btn = this.add.rectangle(this.scale.width / 2, yPos, 300, 60,
        canBuy ? 0x1a4a1a : 0x2a2a2a).setInteractive({ useHandCursor: canBuy });

      this.upgradeContainer.add([
        btn,
        this.add.text(this.scale.width / 2, yPos - 10, node.label, {
          fontSize: '16px', color: '#ffffff' }).setOrigin(0.5),
        this.add.text(this.scale.width / 2, yPos + 15, `◆ ${node.cost}`, {
          fontSize: '13px', color: '#aaaaff' }).setOrigin(0.5),
      ]);

      if (purchased.includes(node.nodeId)) {
        this.add.text(this.scale.width / 2 + 120, yPos, '✓', {
          fontSize: '18px', color: '#00ff88' }).setOrigin(0.5);
      }

      if (canBuy) {
        btn.on('pointerdown', () => {
          this.purchaseUpgrade(node, hero.id, gemsText);
        });
      }
    });
  }

  // רכישת שדרוג גיבור וחיסור אבנים
  private purchaseUpgrade(
    node: IUpgradeNode,
    heroId: string,
    gemsText: Phaser.GameObjects.Text
  ): void {
    const progress = SaveManager.getProgress();
    const newGems = progress.gems - node.cost;
    const upgrades = [...(progress.heroGalleryUpgrades[heroId] ?? []), node.nodeId];

    SaveManager.updateProgress({
      gems: newGems,
      heroGalleryUpgrades: { ...progress.heroGalleryUpgrades, [heroId]: upgrades },
    });

    gemsText.setText(`◆ ${newGems}`);
    EventBus.emit(Events.UPGRADE_PURCHASED, { nodeId: node.nodeId, targetInstanceId: heroId });
  }
}
