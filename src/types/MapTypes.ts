// הגדרות טיפוסים עבור מבנה המפה - נקודות נתיב, ענפים ואזורי הנחה

export interface IPathNode {
  id: string;
  x: number; // מיקום X בעולם המשחק
  y: number; // מיקום Y בעולם המשחק
  nextIds: string[]; // מזהי הצמתים הבאים - מאפשר ענפים מרובים
  roadWidth?: number; // מחצית רוחב הדרך (יחידות נורמלציה 0-1000, ממופה לפיקסלים ע"י MapManager) — קובע את פיזור האויבים לרוחב
}

export interface IBranchDef {
  fromNodeId: string; // הצומת שממנו יוצאים הענפים
  toNodeIds: string[]; // רשימת הצמתים האפשריים
  weights: number[]; // משקל הסתברות לכל ענף (סכום צריך להיות 1)
}

export interface ISlotDef {
  id: string;
  rect: { x: number; y: number; width: number; height: number };
  allowOnPath: boolean;
  capacity?: number;   // max units in this slot (default 1)
  label?: string;
  rotation?: number;   // clockwise degrees for tilted slots (default 0)
  exactHitbox?: { x: number; y: number; width: number; height: number }; // tighter area for canPlace checks; falls back to rect
}

export interface IMapConfig {
  id: string;
  name: string;
  backgroundKey: string; // מפתח נכס הרקע ב-Phaser
  pathNodes: IPathNode[]; // כל צמתי הנתיב
  branches: IBranchDef[]; // הגדרות ענפים לנתיבים מתפצלים
  slots: ISlotDef[]; // כל אזורי ההנחה במפה
  spawnNodeId: string; // מזהה צומת הכניסה של האויבים
  exitNodeId: string; // מזהה צומת היציאה (הגעה = נזק לשחקן)
  waveFileId: string; // מפתח לקובץ גלים מתאים
}
