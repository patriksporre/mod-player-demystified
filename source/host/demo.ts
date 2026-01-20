/**
 * Project: mod-player-demystified
 * File: demo.ts
 * Author: Patrik Sporre
 * License: MIT
 *
 * Description:
 *   Demo interface used by the host runner.
 *
 *   Notes:
 *   - Demos are verification slices.
 *   - The engine (library) must never depend on host or demos.
 */

export interface Demo {
  /**
   * Called once when the demo starts.
   *
   * @param application - Root container provided by the host runner.
   */
  init(application: HTMLElement): void;

  /**
   * Called every frame.
   *
   * @param elapsedTime - Seconds since demo start.
   * @param deltaTime - Seconds since last frame.
   */
  render(elapsedTime: number, deltaTime: number): void;
}