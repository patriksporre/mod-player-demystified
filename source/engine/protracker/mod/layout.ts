/**
 * Project: mod-player-demystified
 * File: layout.ts
 * Author: Patrik Sporre
 * License: MIT
 *
 * Description:
 *   Computes structural layout information for a ProTracker MOD.
 *
 *   This module does not decode pattern cells or audio.
 *   It calculates offsets and sizes:
 *   - where pattern data begins
 *   - how large it is
 *   - where sample data begins
 *   - how much sample data exists
 *
 *   Assumptions (for now):
 *   - 31 sample headers (classic ProTracker layout)
 *   - 4 channels (id == "M.K.")
 */

import type { ModHeader } from "./header.js";
import { computePatternCount } from "./header.js";

export interface ModLayout {
  channels: number;

  headerOffset: number;       // start of header (usually 0)
  idOffset: number;           // where id is stored (1080)
  patternDataOffset: number;  // first byte after id (1084)

  bytesPerRow: number;        // channels * 4
  rowsPerPattern: number;     // 64
  bytesPerPattern: number;    // rowsPerPattern * bytesPerRow

  patternCount: number;
  patternDataSize: number;

  sampleDataOffset: number;
  sampleDataSize: number;

  expectedMinFileSize: number;
}

/**
 * Computes the MOD layout from an already parsed header.
 */
export function computeLayout(header: ModHeader): ModLayout {
  // Classic ProTracker MOD: 4 channels for "M.K."
  const channels: number = 4;

  const headerOffset: number = 0;
  const idOffset: number = 1080;
  const patternDataOffset: number = idOffset + 4; // immediately after id

  const bytesPerRow: number = channels * 4; // 4 bytes per channel
  const rowsPerPattern: number = 64;
  const bytesPerPattern: number = rowsPerPattern * bytesPerRow;

  const patternCount: number = computePatternCount(header);
  const patternDataSize: number = patternCount * bytesPerPattern;

  const sampleDataOffset: number = patternDataOffset + patternDataSize;

  // Sample sizes in header are stored in 16-bit words. Convert to bytes.
  let sampleDataSize: number = 0;
  for (let i = 0; i < header.samples.length; i++) {
    sampleDataSize += header.samples[i].lengthWords * 2;
  }

  const expectedMinFileSize: number = sampleDataOffset + sampleDataSize;

  return {
    channels: channels,

    headerOffset: headerOffset,
    idOffset: idOffset,
    patternDataOffset: patternDataOffset,

    bytesPerRow: bytesPerRow,
    rowsPerPattern: rowsPerPattern,
    bytesPerPattern: bytesPerPattern,

    patternCount: patternCount,
    patternDataSize: patternDataSize,

    sampleDataOffset: sampleDataOffset,
    sampleDataSize: sampleDataSize,

    expectedMinFileSize: expectedMinFileSize
  };
}

/**
 * Returns a human-friendly description of structural validity.
 * This is a helper for demos (still engine-safe).
 */
export function validateLayout(fileSize: number, layout: ModLayout): string[] {
  const issues: string[] = [];

  if (fileSize < layout.patternDataOffset) {
    issues.push("File is smaller than pattern data offset.");
    return issues;
  }

  if (fileSize < layout.sampleDataOffset) {
    issues.push("File ends before pattern data ends.");
  }

  if (fileSize < layout.expectedMinFileSize) {
    issues.push(
      "File ends before expected sample data ends. " +
      "expectedMinFileSize=" + layout.expectedMinFileSize + ", fileSize=" + fileSize
    );
  }

  // Note: Many MODs can contain extra bytes/trailing data. That is not an error.
  return issues;
}