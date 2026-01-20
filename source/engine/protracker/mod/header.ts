/**
 * Project: mod-player-demystified
 * File: header.ts
 * Author: Patrik Sporre
 * License: MIT
 *
 * Description:
 *   ProTracker MOD header parsing (31-sample layout).
 *
 *   This parser reads the fixed header section up to and including the magic id.
 *   For now we support only classic 4-channel ProTracker MODs with magic "M.K.".
 *
 * Header layout (byte offsets):
 *   0      20    Song title (ASCII, null-padded)
 *   20     930   31 sample headers (30 bytes each)
 *   950    1     Song length (number of positions in order table)
 *   951    1     Restart position (often unused)
 *   952    128   Order table
 *   1080   4     ID (e.g. "M.K.")
 */

import { Reader } from "../../io/reader.js";

export interface SampleHeader {
  name: string;               // 22 bytes ASCII
  lengthWords: number;        // 2 bytes BE, length in 16-bit words
  finetune: number;           // 4-bit signed in ProTracker, stored in a byte (0..15)
  volume: number;             // 0..64
  loopStartWords: number;
  loopLengthWords: number;
}

export interface ModHeader {
  title: string;
  songLength: number;
  restartPosition: number;
  orderTable: Uint8Array;     // 128 bytes
  id: string;                 // 4 chars
  samples: SampleHeader[];    // 31 entries
}

/**
 * Parses the ProTracker MOD header from the current reader position.
 * On success, the reader will be positioned immediately after the ID field.
 */
export function parseHeader(reader: Reader): ModHeader {
  const title: string = reader.str(20);

  const samples: SampleHeader[] = [];

  for (let i = 0; i < 31; i++) {
    const sampleHeader: SampleHeader = {
      name: reader.str(22),
      lengthWords: reader.u16be(),
      finetune: reader.u8(),
      volume: reader.u8(),
      loopStartWords: reader.u16be(),
      loopLengthWords: reader.u16be()
    };

    samples.push(sampleHeader);
  }

  const songLength: number = reader.u8();
  const restartPosition: number = reader.u8();

  const orderTable: Uint8Array = reader.bytes(128);

  const id: string = reader.str(4);

  // For Demo 02 we keep it strict: classic ProTracker 4-channel.
  if (id !== "M.K.") {
    throw new Error("Unsupported MOD magic: \"" + id + "\" (expected \"M.K.\")");
  }

  return {
    title: title,
    songLength: songLength,
    restartPosition: restartPosition,
    orderTable: orderTable,
    id: id,
    samples: samples
  };
}

/**
 * Computes how many patterns are present, based on the order table and song length.
 * This is the max pattern index used + 1.
 */
export function computePatternCount(header: ModHeader): number {
  let max: number = 0;

  for (let i = 0; i < header.songLength; i++) {
    const p = header.orderTable[i];
    if (p > max) max = p;
  }

  return max + 1;
}