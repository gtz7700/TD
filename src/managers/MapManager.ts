// Map manager — loads map config from JSON and resolves path nodes / placement slots.
// If the JSON carries "normalized": true, all x/y/width/height values are treated as
// a 0-1000 coordinate space and converted to actual screen pixels on load.

import Phaser from 'phaser';
import { DATA_KEYS } from '../core/AssetManifest';
import type { IMapConfig, IPathNode, ISlotDef } from '../types/MapTypes';

export class MapManager {
  readonly config: IMapConfig;
  private readonly nodeMap: Map<string, IPathNode>;

  constructor(scene: Phaser.Scene, mapId: string) {
    const key = DATA_KEYS[mapId.toUpperCase().replace('-', '_') as keyof typeof DATA_KEYS]
      ?? `data_${mapId}`;

    const raw = scene.cache.json.get(key) as IMapConfig & { normalized?: boolean };
    const { width, height } = scene.scale;

    if (raw.normalized) {
      // Convert 0-1000 normalized units → actual screen pixels.
      // X: full canvas width. Y: offset by HUD_HEIGHT so the map image sits between HUD and unit tray.
      const HUD_H  = 46;
      const TRAY_H = 90;
      const nx = (v: number) => (v / 1000) * width;
      const ny = (v: number) => HUD_H + (v / 1000) * (height - HUD_H - TRAY_H);
      // nh: pure height scale — no HUD offset (used for dimensions, not positions)
      const nh = (v: number) => (v / 1000) * (height - HUD_H - TRAY_H);

      this.config = {
        ...raw,
        pathNodes: raw.pathNodes.map(n => ({
          ...n,
          x: nx(n.x),
          y: ny(n.y),
          // המרת רוחב הדרך מיחידות נורמלציה לפיקסלים (ציר X)
          ...(n.roadWidth !== undefined ? { roadWidth: nx(n.roadWidth) } : {}),
        })),
        slots: raw.slots.map(s => ({
          ...s,
          rect: { x: nx(s.rect.x), y: ny(s.rect.y), width: nx(s.rect.width), height: nh(s.rect.height) },
          exactHitbox: s.exactHitbox
            ? { x: nx(s.exactHitbox.x), y: ny(s.exactHitbox.y), width: nx(s.exactHitbox.width), height: nh(s.exactHitbox.height) }
            : undefined,
        })),
      };
    } else {
      this.config = raw;
    }

    this.nodeMap = new Map(this.config.pathNodes.map(n => [n.id, n]));
  }

  getNode(id: string): IPathNode {
    const node = this.nodeMap.get(id);
    if (!node) throw new Error(`[MapManager] Node not found: ${id}`);
    return node;
  }

  getSlot(id: string): ISlotDef | undefined {
    return this.config.slots.find(s => s.id === id);
  }

  getAllSlots(): ISlotDef[] {
    return this.config.slots;
  }

  getNextNodes(nodeId: string): IPathNode[] {
    const node = this.getNode(nodeId);
    return node.nextIds.map(id => this.getNode(id));
  }

  isExitNode(nodeId: string): boolean {
    return nodeId === this.config.exitNodeId;
  }

  getBackgroundKey(): string | undefined {
    return this.config.backgroundKey || undefined;
  }
}
