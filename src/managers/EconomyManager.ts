// מנהל משק - מנהל מאזן זהב/אבנים/XP ומחלק תגמולים

import { EventBus } from '../core/EventBus';
import { Events } from '../types/EventTypes';
import { SaveManager } from '../core/SaveManager';
import type { TowerManager } from './TowerManager';
import type { IPlayerWallet, ICurrencyDelta } from '../types/EconomyTypes';

// סף XP לכל רמת שחקן (מדרגה)
const XP_PER_LEVEL: number[] = [0, 100, 250, 500, 900, 1500];

export class EconomyManager {
  private wallet: IPlayerWallet;
  private towerManager?: TowerManager; // הפניה למנהל מגדלים לשליפת עלויות

  // אתחול מאזן מנתוני שמירה קיימים + האזנה לאירועי תגמול
  constructor() {
    const progress = SaveManager.getProgress();
    this.wallet = {
      gold: 100, // זהב התחלתי
      gems: progress.gems,
      xp: progress.xp,
      playerLevel: progress.playerLevel,
    };

    // האזנה לכל אירועי תגמול
    EventBus.on(Events.REWARD_GRANTED, (p) => this.applyDelta(p.delta));

    // ניכוי עלות בהנחת יחידה - שולף מחיר מהגדרת המגדל
    EventBus.on(Events.UNIT_PLACED, (p) => {
      if (p.unitType === 'tower' && this.towerManager) {
        const def = this.towerManager.getDef(p.unitId);
        if (def) this.deduct(def.cost, 'gold');
      }
    });
  }

  // קישור מנהל המגדלים לאחר האתחול (נמנע מתלות מעגלית בבנאי)
  setTowerManager(tm: TowerManager): void {
    this.towerManager = tm;
  }

  // החלת שינוי מטבע ובדיקת העלאת רמה
  private applyDelta(delta: ICurrencyDelta): void {
    if (delta.gold)  this.wallet.gold  = Math.max(0, this.wallet.gold  + delta.gold);
    if (delta.gems)  this.wallet.gems  = Math.max(0, this.wallet.gems  + delta.gems);
    if (delta.xp)    this.wallet.xp   += delta.xp;

    EventBus.emit(Events.CURRENCY_CHANGED, { ...delta, newWallet: { ...this.wallet } });
    this.checkLevelUp();
  }

  // בדיקת סף XP להעלאת רמה ומתן תגמול
  private checkLevelUp(): void {
    const nextLevel = this.wallet.playerLevel + 1;
    const threshold = XP_PER_LEVEL[nextLevel];
    if (!threshold || this.wallet.xp < threshold) return;

    this.wallet.playerLevel = nextLevel;
    const rewards = { source: 'xpLevelUp' as const, delta: { gems: 10 } };
    EventBus.emit(Events.XP_LEVEL_UP, { newLevel: nextLevel, rewards });
    this.applyDelta(rewards.delta);
  }

  // שליפת ארנק נוכחי (לשימוש UI ואחרים)
  getWallet(): Readonly<IPlayerWallet> {
    return this.wallet;
  }

  // ניסיון ניכוי עלות - מחזיר false אם אין מספיק
  deduct(amount: number, currency: 'gold' | 'gems'): boolean {
    if (this.wallet[currency] < amount) return false;
    this.applyDelta({ [currency]: -amount });
    return true;
  }
}
