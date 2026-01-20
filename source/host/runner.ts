/**
 * Project: mod-player-demystified
 * File: runner.ts
 * Author: Patrik Sporre
 * License: MIT
 *
 * Description:
 *   Minimal demo runner.
 *   - Clears the document body
 *   - Calls demo.init() once
 *   - Calls demo.render() every animation frame
 *   - Space toggles pause/resume
 */

import type { Demo } from "./demo.js";

export async function runner(path: string): Promise<void> {
  if (!path) throw new Error("Runner:: no path");

  const body: HTMLElement = document.body;
  if (!body) throw new Error("Runner:: missing <body> element");

  // Clear anything in the <body>
  body.innerHTML = "";

  const demo: Demo = await import(path);

  demo.init(body);

  let running: boolean = true;
  let elapsed: number = 0;
  let past: number = performance.now();

  requestAnimationFrame(frame);

  function frame(timestamp: number): void {
    if (!running) return;

    const delta: number = (timestamp - past) / 1000;
    past = timestamp;

    elapsed += delta;

    demo.render(elapsed, delta);

    requestAnimationFrame(frame);
  }

  document.addEventListener("keydown", function (event: KeyboardEvent) {
    if (event.code === "Space") {
      running = !running;

      // Prevent a huge delta after pause
      past = performance.now();

      if (running) requestAnimationFrame(frame);
    }
  });
}