// מנהל גלים - מתזמן הולדת אויבים ועוקב אחר השלמת כל גל

import Phaser from 'phaser';
import { EventBus } from '../core/EventBus';
import { Events } from '../types/EventTypes';
import { EnemyManager } from './EnemyManager';
import type { IWaveConfig, IWaveDef } from '../types/WaveTypes';

export class WaveManager {
  private readonly scene: Phaser.Scene;
  private readonly enemyManager: EnemyManager;
  private readonly waveConfig: IWaveConfig;
  private currentWaveIndex = 0;
  private livingEnemyCount = 0;
  private allSpawned = false;

  // טעינת קונפיגורציית הגלים ורישום האזנה לאירועי אויבים
  constructor(scene: Phaser.Scene, enemyManager: EnemyManager, mapId: string) {
    this.scene = scene;
    this.enemyManager = enemyManager;

    const waveKey = mapId.replace('map_', 'data_waves_');
    this.waveConfig = scene.cache.json.get(waveKey) as IWaveConfig;

    // מעקב אחר מספר האויבים החיים לצורך זיהוי סיום גל
    EventBus.on(Events.ENEMY_DIED,          () => this.onEnemyRemoved());
    EventBus.on(Events.ENEMY_REACHED_EXIT,  () => this.onEnemyRemoved());
    EventBus.on(Events.NEXT_WAVE_REQUESTED, () => this.startNextWave());
  }

  // הפעלת הגל הבא - אם זה הגל הראשון, מחכה לזמן ההכנה תחילה
  startNextWave(): void {
    if (this.currentWaveIndex === 0 && (this.waveConfig.prepTimeMs ?? 0) > 0) {
      const prepMs = this.waveConfig.prepTimeMs!;
      EventBus.emit(Events.WAVE_PREP_STARTED, { totalMs: prepMs });
      this.scene.time.delayedCall(prepMs, () => this.launchWave());
      return;
    }
    this.launchWave();
  }

  // השקת גל בפועל - מעניק זהב בונוס ומתחיל תזמון הולדות
  private launchWave(): void {
    if (this.currentWaveIndex >= this.waveConfig.waves.length) {
      EventBus.emit(Events.ALL_WAVES_COMPLETE, { levelId: this.waveConfig.levelId });
      return;
    }

    const wave = this.waveConfig.waves[this.currentWaveIndex];
    this.livingEnemyCount = 0;
    this.allSpawned = false;

    EventBus.emit(Events.WAVE_STARTED, { waveNumber: wave.waveNumber });

    // מתן זהב בונוס לפני תחילת הגל
    if (wave.preBonusGold > 0) {
      EventBus.emit(Events.REWARD_GRANTED, {
        source: 'waveBonus',
        delta: { gold: wave.preBonusGold },
      });
    }

    this.scheduleWaveSpawns(wave);
  }

  // תזמון הולדת כל הקבוצות בגל — נקרא מ-launchWave
  private scheduleWaveSpawns(wave: IWaveDef): void {
    let totalExpected = 0;

    wave.groups.forEach(group => {
      let groupDelay = group.delayMs;

      group.entries.forEach(entry => {
        // accumulate spawn time per enemy with 500–1000 ms random gap
        let spawnCursor = groupDelay;
        for (let i = 0; i < entry.count; i++) {
          const t = spawnCursor;
          this.scene.time.delayedCall(t, () => {
            this.enemyManager.spawn(entry.enemyId, group.spawnNodeId);
            this.livingEnemyCount++;
          });
          spawnCursor += 1200 + Math.random() * 800; // 1200–2000 ms between each enemy
        }
        totalExpected += entry.count;
        groupDelay += entry.count * entry.intervalMs; // advance cursor for next entry
      });
    });

    // סימון שכל ההולדות תוזמנו
    const totalSpawnTime = wave.groups.reduce((max, g) => {
      const groupTime = g.delayMs + g.entries.reduce((t, e) => t + e.count * e.intervalMs, 0);
      return Math.max(max, groupTime);
    }, 0);

    this.scene.time.delayedCall(totalSpawnTime, () => { this.allSpawned = true; });
  }

  // טיפול בהסרת אויב - בודק האם הגל הסתיים
  private onEnemyRemoved(): void {
    this.livingEnemyCount = Math.max(0, this.livingEnemyCount - 1);

    if (this.allSpawned && this.livingEnemyCount === 0) {
      const wave = this.waveConfig.waves[this.currentWaveIndex];
      EventBus.emit(Events.WAVE_COMPLETE, {
        waveNumber: wave.waveNumber,
        goldBonus: wave.preBonusGold,
      });
      this.currentWaveIndex++;
    }
  }
}

