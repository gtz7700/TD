// הגדרות טיפוסים עבור מערכת השדרוגים - עצי שדרוג ועלויות

export type UpgradeTarget = 'tower' | 'hero_gallery';

export interface IUpgradeNode {
  nodeId: string;
  treeId: string; // עץ השדרוגים שאליו שייך הצומת
  label: string; // שם השדרוג
  description: string;
  cost: number;
  costCurrency: 'gold' | 'gems'; // מטבע תשלום
  prerequisiteNodeIds: string[]; // צמתים שחייבים להיות פתוחים לפני זה
  statDeltas: Partial<{ // שינויי סטטיסטיקות שמוחלים עם רכישה
    damage: number;
    range: number;
    fireRateMs: number;
    maxHP: number;
    speed: number;
    aoeRadius: number;
  }>;
}

export interface IUpgradeTree {
  treeId: string;
  target: UpgradeTarget;
  targetId: string; // מזהה המגדל/גיבור עליו חל העץ
  nodes: IUpgradeNode[];
}
