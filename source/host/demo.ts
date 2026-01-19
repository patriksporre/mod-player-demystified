/**
 * Project: mod-player-demystified
 * File: demo.ts
 * Author: Patrik Sporre
 * License: MIT
 *
 * Description:
 *   Common interface for all demos.
 *   A demo is a small, isolated program that runs inside the demo host.
 */

export interface Demo {
  init(application: HTMLElement): void;
  render(elapsedTime: number, deltaTime: number): void;
}