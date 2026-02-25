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
    EventBus.on(Events.ENEMY_DIED,         () => this.onEnemyRemoved());
    EventBus.on(Events.ENEMY_REACHED_EXIT, () => this.onEnemyRemoved());
  }

  // הפעלת הגל הבא - מעניק זהב בונוס ומתחיל תזמון הולדות
  startNextWave(): void {
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

  // תזמון הולדת כל הקבוצות בגל
  private scheduleWaveSpawns(wave: IWaveDef): void {
    let totalExpected = 0;

    wave.groups.forEach(group => {
      let groupDelay = group.delayMs;

      group.entries.forEach(entry => {
        for (let i = 0; i < entry.count; i++) {
          this.scene.time.delayedCall(groupDelay + i * entry.intervalMs, () => {
            this.enemyManager.spawn(entry.enemyId, group.spawnNodeId);
            this.livingEnemyCount++;
          });
        }
        totalExpected += entry.count;
        groupDelay += entry.count * entry.intervalMs;
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
