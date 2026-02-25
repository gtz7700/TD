// דירוג כוכבים - מציג 1-3 כוכבים עבור ביצועי שחקן ברמה

import Phaser from 'phaser';

export class StarRating {
  // יצירת תצוגת 3 כוכבים עם מספר מלאים לפי הניקוד
  constructor(
    scene: Phaser.Scene,
    x: number, y: number,
    filledCount: 0 | 1 | 2 | 3
  ) {
    const spacing = 28;
    const startX  = x - spacing;

    for (let i = 0; i < 3; i++) {
      const starX = startX + i * spacing;
      const filled = i < filledCount;

      // ציור כוכב כטקסט - יוחלף בספרייט בהמשך
      scene.add.text(starX, y, filled ? '★' : '☆', {
        fontSize: '24px',
        color: filled ? '#ffd700' : '#444444',
      }).setOrigin(0.5);
    }
  }
}
