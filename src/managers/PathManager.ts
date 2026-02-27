// Path manager — resolves enemy routes through the map and builds piecewise-linear paths.

import Phaser from 'phaser';
import { MapManager } from './MapManager';
import type { IPathNode } from '../types/MapTypes';
import { weightedRandom } from '../utils/MathUtils';

export class PathManager {
  private readonly mapManager: MapManager;

  constructor(mapManager: MapManager) {
    this.mapManager = mapManager;
  }

  // Resolve a full route from spawn to exit, choosing branches by weight.
  resolveRoute(spawnNodeId: string): string[] {
    const route: string[] = [spawnNodeId];
    let currentId = spawnNodeId;

    while (!this.mapManager.isExitNode(currentId)) {
      const node = this.mapManager.getNode(currentId);
      if (node.nextIds.length === 0) break;

      const branchDef = this.mapManager.config.branches
        .find(b => b.fromNodeId === currentId);

      let nextId: string;
      if (branchDef && branchDef.weights.length === branchDef.toNodeIds.length) {
        const chosen = weightedRandom(branchDef.weights);
        nextId = branchDef.toNodeIds[chosen];
      } else {
        nextId = node.nextIds[0];
      }

      route.push(nextId);
      currentId = nextId;
    }

    return route;
  }

  // Convert a route (array of node IDs) to IPathNode objects.
  routeToNodes(route: string[]): IPathNode[] {
    return route.map(id => this.mapManager.getNode(id));
  }

  // בניית נתיב קווי מחתיכות ישרות בין נקודות הציון — lineTo שומר אויבים בתוך קווי הדרך בלבד.
  // splineTo (Catmull-Rom) נדחה: גורם לחריגה מהכביש בפינות חדות (overshoot).
  // הפיזור הצדדי הטבעי מיושם ב-BaseEnemy.update() עם אופסט ניצב לציר התנועה.
  buildCurve(route: string[]): Phaser.Curves.Path {
    const nodes = this.routeToNodes(route);
    const path = new Phaser.Curves.Path(nodes[0].x, nodes[0].y);

    for (let i = 1; i < nodes.length; i++) {
      path.lineTo(nodes[i].x, nodes[i].y);
    }

    return path;
  }

  // מחזיר את מחצית רוחב הדרך (בפיקסלים) בנקודת ההתחלה של הנתיב.
  // ערך זה מועבר לאויב כדי לקבוע את טווח הפיזור הצדדי שלו.
  getRoadHalfWidthAtSpawn(route: string[]): number {
    if (route.length === 0) return 0;
    const node = this.mapManager.getNode(route[0]);
    return node.roadWidth ?? 0;
  }

  // BFS shortest-route (used as fallback / future smart-enemy feature).
  shortestRoute(spawnNodeId: string): string[] {
    const { exitNodeId } = this.mapManager.config;
    const visited = new Set<string>();
    const queue: string[][] = [[spawnNodeId]];

    while (queue.length > 0) {
      const path = queue.shift()!;
      const current = path[path.length - 1];

      if (current === exitNodeId) return path;
      if (visited.has(current)) continue;
      visited.add(current);

      const node = this.mapManager.getNode(current);
      for (const nextId of node.nextIds) {
        queue.push([...path, nextId]);
      }
    }

    return this.resolveRoute(spawnNodeId);
  }
}
