/**
 * Project: mod-player-demystified
 * File: demo.ts
 * Author: Patrik Sporre
 * License: MIT
 *
 * Description:
 *   Demo 00-template
 *   Verifies that the demo runner works.
 *   Displays a title and an updating timer.
 */

let time: HTMLElement | null = null;

export function init(application: HTMLElement): void {
  const title: HTMLElement = document.createElement("h1");
  title.textContent = "MOD Player Demystified";
  application.appendChild(title);

  const info: HTMLElement = document.createElement("p");
  info.textContent = "Demo 00-template. Press Space to pause/resume.";
  application.appendChild(info);

  time = document.createElement("div");
  time.style.fontFamily = "monospace";
  time.textContent = "elapsed: 0.000 s";
  application.appendChild(time);
}

export function render(elapsedTime: number, _deltaTime: number): void {
  if (time) time.textContent = "elapsed: " + elapsedTime.toFixed(3) + " s";
}