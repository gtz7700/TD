// תצוגת מידע בזמן משחק - זהב, אבנים, חיים ומספר גל

import Phaser from 'phaser';
import { EventBus } from '../core/EventBus';
import { Events } from '../types/EventTypes';
import { GoldDisplay } from './GoldDisplay';
import { LivesBar } from './LivesBar';
import { WaveIndicator } from './WaveIndicator';

export class HUD {
  private readonly goldDisplay: GoldDisplay;
  private readonly livesBar: LivesBar;
  private readonly waveIndicator: WaveIndicator;

  // אתחול כל רכיבי ה-HUD ורישום האזנה לשינויים
  constructor(scene: Phaser.Scene) {
    // שלושת פאנלי המידע מוצבים בשורה אחת בפינה שמאלית עליונה
    // GoldDisplay (130px) | gap 6px | LivesBar (130px) | gap 6px | WaveIndicator (140px)
    this.goldDisplay   = new GoldDisplay(scene, 10, 5);
    this.livesBar      = new LivesBar(scene, 148, 5, 40);
    this.waveIndicator = new WaveIndicator(scene, 286, 5);

    // ─── named handlers so they can be removed on shutdown ──────────────────
    const onCurrencyChanged = (p: { newWallet: { gold?: number } }) => {
      if (p.newWallet.gold !== undefined) {
        this.goldDisplay.setValue(p.newWallet.gold);
      }
    };
    const onLifeLost = (p: { remaining: number }) => {
      this.livesBar.setValue(p.remaining);
    };
    const onWaveStarted = (p: { waveNumber: number }) => {
      this.waveIndicator.setWave(p.waveNumber);
    };

    EventBus.on(Events.CURRENCY_CHANGED, onCurrencyChanged);
    EventBus.on(Events.LIFE_LOST, onLifeLost);
    EventBus.on(Events.WAVE_STARTED, onWaveStarted);

    // ניקוי בעצירת הסצנה — מונע listeners עצומים שמצביעים לאובייקטים שהושמדו
    scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      EventBus.off(Events.CURRENCY_CHANGED, onCurrencyChanged);
      EventBus.off(Events.LIFE_LOST, onLifeLost);
      EventBus.off(Events.WAVE_STARTED, onWaveStarted);
    });
  }
}
