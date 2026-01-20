/**
 * Project: mod-player-demystified
 * File: cell.ts
 * Author: Patrik Sporre
 * License: MIT
 *
 * Description:
 *   Decodes ProTracker MOD pattern cells.
 *
 *   Each pattern cell is exactly 4 bytes per channel per row.
 *   The data is packed in a classic Amiga-era bitfield layout.
 *
 *   Cell layout (4 bytes):
 *
 *     byte 0:  ssss pppp
 *     byte 1:  pppp pppp
 *     byte 2:  ssss eeee
 *     byte 3:  aaaa aaaa
 *
 *   Meaning:
 *   - ssss (byte0 high nibble)  = sample number (high nibble)
 *   - ssss (byte2 high nibble)  = sample number (low nibble)
 *   - pppp...                   = 12-bit period value (used to derive pitch)
 *   - eeee                      = effect number (0..15)
 *   - aaaa...                   = effect parameter (0..255)
 *
 *   Notes:
 *   - Sample numbers are 1..31 in classic MODs (0 can appear as "no sample").
 *   - Period is a raw number for now. Later demos map period to notes.
 */

export interface ModCell {
  sample: number;  // 0..255 (in practice 0..31 for classic MOD)
  period: number;  // 0..4095 (12-bit)
  effect: number;  // 0..15
  param: number;   // 0..255
}

/**
 * Decodes a ProTracker MOD pattern cell from 4 raw bytes.
 */
export function decodeCell(b0: number, b1: number, b2: number, b3: number): ModCell {
  // Sample number: high nibble from byte0, low nibble from byte2.
  const sample: number = (b0 & 0xf0) | ((b2 & 0xf0) >> 4);

  // Period: 12-bit value composed of byte0 low nibble and byte1.
  const period: number = ((b0 & 0x0f) << 8) | b1;

  // Effect number: low nibble of byte2.
  const effect: number = b2 & 0x0f;

  // Effect parameter: full byte3.
  const param: number = b3;

  return {
    sample: sample,
    period: period,
    effect: effect,
    param: param
  };
}