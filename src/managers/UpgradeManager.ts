// מנהל שדרוגים - מנהל עצי שדרוג, מאמת תנאים ומחיל שינויי סטטיסטיקות

import { EventBus } from '../core/EventBus';
import { Events } from '../types/EventTypes';
import { TowerManager } from './TowerManager';
import { HeroManager } from './HeroManager';
import { EconomyManager } from './EconomyManager';
import type { IUpgradeTree, IUpgradeNode } from '../types/UpgradeTypes';

export class UpgradeManager {
  private readonly towerManager: TowerManager;
  private readonly _heroManager: HeroManager;
  private readonly trees: Map<string, IUpgradeTree> = new Map();
  private readonly purchased: Map<string, Set<string>> = new Map(); // instanceId -> nodeIds

  // טעינת עצי שדרוג ורישום האזנה לבקשות רכישה
  constructor(towerManager: TowerManager, heroManager: HeroManager) {
    this.towerManager = towerManager;
    this._heroManager  = heroManager;

    // לא ניתן להשתמש ב-scene.cache כאן - הטעינה תתבצע מ-GameScene
    EventBus.on(Events.UPGRADE_PURCHASED, (p) => {
      this.applyUpgrade(p.targetInstanceId, p.nodeId);
    });
  }

  // טעינת עצי השדרוג לאחר שהמטמון זמין
  loadTrees(towerUpgradesData: { trees: IUpgradeTree[] }, heroUpgradesData: { trees: IUpgradeTree[] }): void {
    [...towerUpgradesData.trees, ...heroUpgradesData.trees].forEach(tree => {
      this.trees.set(tree.treeId, tree);
    });
  }

  // בדיקה האם ניתן לרכוש שדרוג עבור אינסטנס מסוים
  canPurchase(instanceId: string, nodeId: string, economyManager: EconomyManager): boolean {
    const node = this.findNode(nodeId);
    if (!node) return false;

    const ownedByInstance = this.purchased.get(instanceId) ?? new Set<string>();
    if (ownedByInstance.has(nodeId)) return false;

    // בדיקת תנאים קדומים
    if (!node.prerequisiteNodeIds.every(p => ownedByInstance.has(p))) return false;

    // בדיקת עלות
    return economyManager.getWallet()[node.costCurrency] >= node.cost;
  }

  // החלת שדרוג על מגדל/גיבור
  private applyUpgrade(instanceId: string, nodeId: string): void {
    const node = this.findNode(nodeId);
    if (!node) return;

    const tower = this.towerManager.getTower(instanceId);
    if (tower) {
      tower.applyStatDelta(node.statDeltas);
    }

    if (!this.purchased.has(instanceId)) this.purchased.set(instanceId, new Set());
    this.purchased.get(instanceId)!.add(nodeId);
  }

  // חיפוש צומת שדרוג לפי מזהה בכל העצים
  private findNode(nodeId: string): IUpgradeNode | null {
    for (const tree of this.trees.values()) {
      const node = tree.nodes.find(n => n.nodeId === nodeId);
      if (node) return node;
    }
    return null;
  }
}
