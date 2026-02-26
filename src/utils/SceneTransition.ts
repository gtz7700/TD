// כלי מעברי סצנה - מאפשר fade-in/out חלק בין סצנות

import Phaser from 'phaser';

// fade-in על הסצנה הנוכחית (נקרא בתחילת create())
export function fadeIn(scene: Phaser.Scene, duration = 300): void {
  scene.cameras.main.fadeIn(duration, 0, 0, 0);
}

// fade-out ואז מעבר לסצנה אחרת - עוטף scene.scene.start בגרדיאנט חלק
export function fadeToScene(
  scene: Phaser.Scene,
  key: string,
  data?: Record<string, unknown>,
  duration = 300,
): void {
  scene.cameras.main.fadeOut(duration, 0, 0, 0);
  scene.cameras.main.once(
    Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE,
    () => scene.scene.start(key, data),
  );
}
