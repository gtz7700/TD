// Path manager — resolves enemy routes through the map and builds smooth Catmull-Rom spline curves.

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

  // Build a piecewise-linear Phaser.Curves.Path from a resolved route.
  // Uses lineTo segments (NOT splineTo) so enemies stay *strictly* within the line between
  // every pair of consecutive waypoints — no spline overshoot, no grass-walking.
  // Arc-length parameterisation in BaseEnemy.update() ensures uniform speed along each segment.
  buildCurve(route: string[]): Phaser.Curves.Path {
    const nodes = this.routeToNodes(route);
    const first = nodes[0];
    const path = new Phaser.Curves.Path(first.x, first.y);

    for (let i = 1; i < nodes.length; i++) {
      path.lineTo(nodes[i].x, nodes[i].y);
    }

    return path;
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
