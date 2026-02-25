// מנהל נתיבים - בחירת מסלול לאויב בלידה (ענפים אקראיים + תשתית לנתיב חכם)

import { MapManager } from './MapManager';
import type { IPathNode } from '../types/MapTypes';
import { weightedRandom } from '../utils/MathUtils';

export class PathManager {
  private readonly mapManager: MapManager;

  // אתחול מנהל הנתיבים עם הפניה למנהל המפה
  constructor(mapManager: MapManager) {
    this.mapManager = mapManager;
  }

  // בחירת מסלול מלא לאויב בלידה - כולל פתרון ענפים אקראיים
  resolveRoute(spawnNodeId: string): string[] {
    const route: string[] = [spawnNodeId];
    let currentId = spawnNodeId;

    while (!this.mapManager.isExitNode(currentId)) {
      const node = this.mapManager.getNode(currentId);
      if (node.nextIds.length === 0) break;

      // בחירת ענף - לפי משקלות אם קיים, אחרת ראשון
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

  // המרת מסלול מזהים לרשימת אובייקטי צומת
  routeToNodes(route: string[]): IPathNode[] {
    return route.map(id => this.mapManager.getNode(id));
  }

  // תשתית לאויב חכם: בחירת הנתיב הקצר ביותר (BFS)
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

    return this.resolveRoute(spawnNodeId); // fallback
  }
}
