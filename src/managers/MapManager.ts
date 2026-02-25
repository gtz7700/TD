// מנהל מפה - טוען קונפיגורציית מפה מ-JSON ובונה את מבנה הנתיב והאזורים

import Phaser from 'phaser';
import { DATA_KEYS } from '../core/AssetManifest';
import type { IMapConfig, IPathNode, ISlotDef } from '../types/MapTypes';

export class MapManager {
  readonly config: IMapConfig;
  private readonly nodeMap: Map<string, IPathNode>;

  // טעינה ופענוח של קונפיגורציית המפה מהמטמון
  constructor(scene: Phaser.Scene, mapId: string) {
    const key = DATA_KEYS[mapId.toUpperCase().replace('-', '_') as keyof typeof DATA_KEYS]
      ?? `data_${mapId}`;

    this.config  = scene.cache.json.get(key) as IMapConfig;
    this.nodeMap = new Map(this.config.pathNodes.map(n => [n.id, n]));
  }

  // שליפת צומת לפי מזהה - זריקת שגיאה אם לא קיים
  getNode(id: string): IPathNode {
    const node = this.nodeMap.get(id);
    if (!node) throw new Error(`[MapManager] Node not found: ${id}`);
    return node;
  }

  // שליפת אזור הנחה לפי מזהה
  getSlot(id: string): ISlotDef | undefined {
    return this.config.slots.find(s => s.id === id);
  }

  // שליפת כל אזורי ההנחה
  getAllSlots(): ISlotDef[] {
    return this.config.slots;
  }

  // שליפת צמתים הבאים מצומת נתון (למימוש ענפים)
  getNextNodes(nodeId: string): IPathNode[] {
    const node = this.getNode(nodeId);
    return node.nextIds.map(id => this.getNode(id));
  }

  // האם צומת הוא נקודת הסיום (יציאת אויבים)
  isExitNode(nodeId: string): boolean {
    return nodeId === this.config.exitNodeId;
  }
}
