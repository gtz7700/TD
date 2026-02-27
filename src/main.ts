// נקודת כניסה ראשית - רושמת את כל הסצנות ומפעילה את מנוע Phaser

import Phaser from 'phaser';
import { BootScene } from './scenes/BootScene';
import { PreloaderScene } from './scenes/PreloaderScene';
import { MainMenuScene } from './scenes/MainMenuScene';
import { CampaignMapScene } from './scenes/CampaignMapScene';
import { HeroGalleryScene } from './scenes/HeroGalleryScene';
import { GameScene } from './scenes/GameScene';
import { UIScene } from './scenes/UIScene';

// קונפיגורציה מרכזית של מנוע Phaser - מגדירה מצב תצוגה, סצנות וגדילה
const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 912,
  height: 909, // 773 (map image) + 46 (HUD) + 90 (unit tray) = full layout without overlap
  backgroundColor: '#000000',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  // UIScene רשומה אחרי GameScene כדי לרנדר מעל עולם המשחק
  scene: [
    BootScene,
    PreloaderScene,
    MainMenuScene,
    CampaignMapScene,
    HeroGalleryScene,
    GameScene,
    UIScene,
  ],
};

// יצירת אינסטנס המשחק הראשי - מתחיל אוטומטית ב-BootScene
new Phaser.Game(config);
