// מגש בחירת יחידות - מוצג בתחתית המסך, מאפשר בחירת מגדלים וגיבורים להנחה

import Phaser from 'phaser';
import { EventBus } from '../core/EventBus';
import { Events } from '../types/EventTypes';
import { SaveManager } from '../core/SaveManager';
import { DATA_KEYS, UNIT_SPRITES } from '../core/AssetManifest';
import type { IHeroDef } from '../types/UnitTypes';

export const TRAY_HEIGHT = 90;

// צבע לכל סוג אלמנט
const ELEMENT_COLORS: Record<string, number> = {
  Physical:  0x8B6914,
  Fire:      0xff5500,
  Ice:       0x44aaff,
  Poison:    0x44cc44,
  Lightning: 0xdddd00,
  None:      0x777777,
};

type TrayUnit = { id: string; name: string; unitType: 'tower' | 'hero'; cost: number; costType: 'gold' | 'gems'; elementColor: number; spriteKey?: string };

export class UnitTray {
  private readonly scene: Phaser.Scene;
  private readonly cards: Phaser.GameObjects.Container[] = [];
  private readonly cardBgs: Phaser.GameObjects.Graphics[] = [];
  private readonly costTexts: Phaser.GameObjects.Text[] = [];
  private readonly units: TrayUnit[] = [];
  private selectedIndex = -1;
  private currentGold = 100;
  private currentGems = 0;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    const { width, height } = scene.scale;

    // ─── פאנל רקע ──────────────────────────────────────────────────────────────
    const panelBg = scene.add.graphics().setDepth(109);
    panelBg.fillStyle(0x111111, 0.93);
    panelBg.fillRect(0, height - TRAY_HEIGHT, width, TRAY_HEIGHT);
    panelBg.lineStyle(1, 0x444444, 1);
    panelBg.beginPath();
    panelBg.moveTo(0, height - TRAY_HEIGHT);
    panelBg.lineTo(width, height - TRAY_HEIGHT);
    panelBg.strokePath();

    // ─── איסוף יחידות (גיבורים בלבד — מגדלים הוסרו מהמגש) ────────────────────
    const progress = SaveManager.getProgress();
    const heroData = scene.cache.json.get(DATA_KEYS.HEROES) as { heroes: IHeroDef[] };
    heroData.heroes.forEach(def => {
      if (progress.heroGalleryUnlocks[def.id]) {
        const spriteKey = def.id === 'warrior'    ? UNIT_SPRITES.WARRIOR
          : def.id === 'archer_hero'               ? UNIT_SPRITES.ARCHER_HERO
          : def.id === 'ice_wizard'                ? UNIT_SPRITES.ICE_WIZARD
          : undefined;
        this.units.push({
          id: def.id, name: def.name, unitType: 'hero',
          cost: 0, costType: 'gems',
          elementColor: 0x888888,
          spriteKey,
        });
      }
    });

    // ─── יצירת כרטיסי יחידות ──────────────────────────────────────────────────
    const cardW  = 90;
    const cardH  = 72;
    const gap    = 10;
    const totalW = this.units.length * (cardW + gap) - gap;
    const startX = (width - totalW) / 2;
    const cardY  = height - TRAY_HEIGHT + (TRAY_HEIGHT - cardH) / 2;

    this.units.forEach((unit, i) => {
      const cx = startX + i * (cardW + gap);
      const cardBg = scene.add.graphics();
      cardBg.fillStyle(0x222222, 1);
      cardBg.fillRect(0, 0, cardW, cardH);
      cardBg.lineStyle(1, 0x555555, 1);
      cardBg.strokeRect(0, 0, cardW, cardH);

      // צבע אלמנט — frame 0 (idle-FRONT) לגיבורים, מלבן צבעוני למגדלים
      const colorBlock = unit.spriteKey
        ? scene.add.sprite(cardW / 2, 22, unit.spriteKey).setFrame(2).setDisplaySize(54, 44).setOrigin(0.5)
        : scene.add.rectangle(cardW / 2, 22, 50, 30, unit.elementColor);

      // שם יחידה
      const nameText = scene.add.text(cardW / 2, 44, unit.name.split(' ')[0], {
        fontSize: '9px', color: '#cccccc',
      }).setOrigin(0.5, 0);

      // עלות
      const costStr = unit.costType === 'gold' ? `${unit.cost}◉` : (unit.cost === 0 ? 'FREE' : `${unit.cost}◆`);
      const costTxt = scene.add.text(cardW / 2, 59, costStr, {
        fontSize: '10px', fontStyle: 'bold',
        color: unit.cost === 0 ? '#88ff88' : '#ffd700',
      }).setOrigin(0.5, 0);
      this.costTexts.push(costTxt);

      // אזור interactive שקוף
      const hitArea = scene.add.rectangle(cardW / 2, cardH / 2, cardW, cardH, 0xffffff, 0)
        .setInteractive({ useHandCursor: true });

      const card = scene.add.container(cx, cardY, [cardBg, colorBlock, nameText, costTxt, hitArea]);
      card.setDepth(110);

      hitArea.on('pointerdown', () => this.onCardTap(i));
      hitArea.on('pointerover',  () => { if (this.selectedIndex !== i) { cardBg.clear(); cardBg.fillStyle(0x333333, 1); cardBg.fillRect(0, 0, cardW, cardH); cardBg.lineStyle(1, 0x666666, 1); cardBg.strokeRect(0, 0, cardW, cardH); } });
      hitArea.on('pointerout',   () => { if (this.selectedIndex !== i) { cardBg.clear(); cardBg.fillStyle(0x222222, 1); cardBg.fillRect(0, 0, cardW, cardH); cardBg.lineStyle(1, 0x555555, 1); cardBg.strokeRect(0, 0, cardW, cardH); } });

      this.cards.push(card);
      this.cardBgs.push(cardBg);
    });

    // עדכון צבע כפי שהזהב משתנה
    const onCurrencyChanged = (p: { newWallet: { gold?: number; gems?: number } }) => {
      if (p.newWallet.gold !== undefined) this.currentGold = p.newWallet.gold;
      if (p.newWallet.gems !== undefined) this.currentGems = p.newWallet.gems;
      this.updateAffordability();
    };
    EventBus.on(Events.CURRENCY_CHANGED, onCurrencyChanged);

    // ניקוי ב-SHUTDOWN — מונע listener עצום שמצביע לאובייקטים שהושמדו
    scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      EventBus.off(Events.CURRENCY_CHANGED, onCurrencyChanged);
    });
  }

  // לחיצה על כרטיס - בחירה/ביטול בחירה
  private onCardTap(index: number): void {
    const unit = this.units[index];

    // ─── בדיקת יכולת כלכלית ─────────────────────────────────────────────────
    const canAfford = unit.costType === 'gold'
      ? unit.cost === 0 || this.currentGold >= unit.cost
      : unit.cost === 0 || this.currentGems >= unit.cost;

    if (!canAfford && this.selectedIndex !== index) {
      // הבהוב אדום קצר — אין מספיק כסף
      const bg = this.cardBgs[index];
      const cardW = 90, cardH = 72;
      bg.clear();
      bg.fillStyle(0x441111, 1);
      bg.fillRect(0, 0, cardW, cardH);
      bg.lineStyle(2, 0xff2222, 1);
      bg.strokeRect(0, 0, cardW, cardH);
      this.scene.time.delayedCall(350, () => {
        if (this.selectedIndex !== index) {
          bg.clear(); bg.fillStyle(0x222222, 1); bg.fillRect(0, 0, cardW, cardH);
          bg.lineStyle(1, 0x555555, 1); bg.strokeRect(0, 0, cardW, cardH);
        }
      });
      return;
    }

    if (this.selectedIndex === index) {
      // לחיצה שנייה על אותו כרטיס = ביטול
      this.clearSelection();
      EventBus.emit(Events.UNIT_DESELECTED, {} as never);
      return;
    }
    this.clearSelection();
    this.selectedIndex = index;
    this.highlightCard(index, true);
    EventBus.emit(Events.UNIT_SELECTED, { unitId: unit.id, unitType: unit.unitType });
  }

  // הסרת הדגשה מכל הכרטיסים
  clearSelection(): void {
    if (this.selectedIndex >= 0) {
      this.highlightCard(this.selectedIndex, false);
    }
    this.selectedIndex = -1;
  }

  // הדגשת/הסרת הדגשה של כרטיס
  private highlightCard(index: number, selected: boolean): void {
    const bg = this.cardBgs[index];
    const cardW = 90; const cardH = 72;
    bg.clear();
    bg.fillStyle(selected ? 0x1a2a1a : 0x222222, 1);
    bg.fillRect(0, 0, cardW, cardH);
    bg.lineStyle(selected ? 2 : 1, selected ? 0xffff00 : 0x555555, 1);
    bg.strokeRect(0, 0, cardW, cardH);
  }

  // עדכון הצגת עלות - אפור אם לא יכול להרשות
  private updateAffordability(): void {
    this.units.forEach((unit, i) => {
      const canAfford = unit.costType === 'gold'
        ? unit.cost === 0 || this.currentGold >= unit.cost
        : unit.cost === 0 || this.currentGems >= unit.cost;
      this.costTexts[i].setColor(canAfford
        ? (unit.cost === 0 ? '#88ff88' : '#ffd700')
        : '#ff4444');
      this.cardBgs[i];
      const alpha = canAfford ? 1 : 0.45;
      this.cards[i].setAlpha(alpha);
    });
  }
}
