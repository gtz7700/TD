// מנהל חיים - עוקב אחר נקודות החיים של השחקן ומכריז על הפסד

import { EventBus } from '../core/EventBus';
import { Events } from '../types/EventTypes';

const STARTING_LIVES = 40; // חיים התחלתיים לפי המפרט

export class LifeManager {
  private lives: number;

  // אתחול עם מספר החיים ההתחלתי והאזנה לאויבים שהגיעו ליציאה
  constructor(startingLives = STARTING_LIVES) {
    this.lives = startingLives;

    EventBus.on(Events.ENEMY_REACHED_EXIT, (p) => {
      this.takeDamage(p.lifeDamage);
    });
  }

  // קבלת נזק לחיים ועדכון HUD
  private takeDamage(amount: number): void {
    this.lives = Math.max(0, this.lives - amount);

    EventBus.emit(Events.LIFE_LOST, { amount, remaining: this.lives });

    if (this.lives === 0) {
      EventBus.emit(Events.PLAYER_DEFEATED, {} as never);
    }
  }

  // שליפת מספר החיים הנוכחי
  getLives(): number {
    return this.lives;
  }

  // מספר כוכבים בהתאם לחיים שנותרו (לסיום רמה)
  calculateStars(): 1 | 2 | 3 {
    const ratio = this.lives / STARTING_LIVES;
    if (ratio > 0.7) return 3;
    if (ratio > 0.3) return 2;
    return 1;
  }
}
