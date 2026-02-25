// כלי עזר לחישובי נתיב - אורך, אינטרפולציה ומיקום בעולם

import type { IPathNode } from '../types/MapTypes';

// חישוב אורך נתיב כולל בין רצף צמתים
export function computePathLength(nodes: IPathNode[]): number {
  let total = 0;
  for (let i = 0; i < nodes.length - 1; i++) {
    const a = nodes[i];
    const b = nodes[i + 1];
    total += Math.hypot(b.x - a.x, b.y - a.y);
  }
  return total;
}

// אינטרפולציה לאורך הנתיב: מחזיר מיקום עבור מרחק נסיעה נתון
export function interpolateAlongPath(
  nodes: IPathNode[],
  distanceTravelled: number
): { x: number; y: number; angle: number } {
  let remaining = distanceTravelled;

  for (let i = 0; i < nodes.length - 1; i++) {
    const a = nodes[i];
    const b = nodes[i + 1];
    const segLen = Math.hypot(b.x - a.x, b.y - a.y);

    if (remaining <= segLen) {
      const t = remaining / segLen;
      return {
        x: a.x + (b.x - a.x) * t,
        y: a.y + (b.y - a.y) * t,
        angle: Math.atan2(b.y - a.y, b.x - a.x),
      };
    }
    remaining -= segLen;
  }

  // מעבר לסוף הנתיב - מחזיר את הצומת האחרון
  const last = nodes[nodes.length - 1];
  const prev = nodes[nodes.length - 2];
  return {
    x: last.x,
    y: last.y,
    angle: prev ? Math.atan2(last.y - prev.y, last.x - prev.x) : 0,
  };
}

// המרת מזהה צומת למיקום עולם (מחפש ברשימת צמתים)
export function nodeToWorld(
  nodeId: string,
  nodes: IPathNode[]
): { x: number; y: number } | null {
  const node = nodes.find(n => n.id === nodeId);
  return node ? { x: node.x, y: node.y } : null;
}
