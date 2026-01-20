/**
 * Project: mod-player-demystified
 * File: demo.ts
 * Author: Patrik Sporre
 * License: MIT
 *
 * Description:
 *   Demo 03B - Decode pattern cells
 *
 *   Loads a ProTracker MOD (id "M.K."), locates pattern data, and decodes
 *   the 4-byte pattern cell format into:
 *     - sample number
 *     - period (raw)
 *     - effect + parameter
 *
 *   No note mapping and no audio playback.
 */

import { readFileAsArrayBuffer } from "../../host/file.js";
import { toHex } from "../../host/hex.js";

import { Reader } from "../../engine/io/reader.js";
import { parseHeader } from "../../engine/protracker/mod/header.js";
import { computeLayout, validateLayout } from "../../engine/protracker/mod/layout.js";
import { decodeCell } from "../../engine/protracker/mod/cell.js";

let output: HTMLPreElement | null = null;

export function init(application: HTMLElement): void {
  const title: HTMLElement = document.createElement("h1");
  title.textContent = "Demo 03B - Decode pattern cells (ProTracker, M.K.)";
  application.appendChild(title);

  const info: HTMLElement = document.createElement("p");
  info.textContent =
    "Decodes the 4-byte ProTracker pattern cell format. " +
    "Shows sample, period, effect, and parameter for each channel.";
  application.appendChild(info);

  const input: HTMLInputElement = document.createElement("input");
  input.type = "file";
  input.accept = ".mod,*/*";
  application.appendChild(input);

  const spacer: HTMLElement = document.createElement("div");
  spacer.style.height = "12px";
  application.appendChild(spacer);

  output = document.createElement("pre");
  output.style.fontFamily = "monospace";
  output.style.fontSize = "13px";
  output.style.lineHeight = "1.25";
  output.textContent = "No file loaded.";
  application.appendChild(output);

  input.addEventListener("change", function () {
    const file: File | null = input.files ? input.files[0] : null;
    if (!file) {
      write("No file selected.");
      return;
    }

    onFileSelected(file);
  });
}

export function render(_elapsedTime: number, _deltaTime: number): void {
  // No animation needed.
}

async function onFileSelected(file: File): Promise<void> {
  try {
    const buffer: ArrayBuffer = await readFileAsArrayBuffer(file);
    inspect(file, buffer);
  } catch (e) {
    write("Failed to read file.");
  }
}

function inspect(file: File, buffer: ArrayBuffer): void {
  const fileSize: number = buffer.byteLength;

  const r: Reader = new Reader(buffer);
  r.seek(0);

  const lines: string[] = [];
  lines.push("file: " + file.name);
  lines.push("size: " + fileSize + " bytes");
  lines.push("");

  let header;
  try {
    header = parseHeader(r);
  } catch (e) {
    lines.push("ERROR: " + (e instanceof Error ? e.message : "unknown error"));
    write(lines.join("\n"));
    return;
  }

  const layout = computeLayout(header);
  const issues: string[] = validateLayout(fileSize, layout);

  if (issues.length > 0) {
    lines.push("issues:");
    for (let i = 0; i < issues.length; i++) {
      lines.push("  - " + issues[i]);
    }
    lines.push("");
  }

  lines.push("header:");
  lines.push("  title: \"" + header.title + "\"");
  lines.push("  song length: " + header.songLength);
  lines.push("  id: \"" + header.id + "\"");
  lines.push("");

  // Choose pattern to inspect: first pattern referenced by the song.
  const patternIndex: number = header.orderTable[0];

  lines.push("pattern:");
  lines.push("  using orderTable[0] = " + patternIndex);
  lines.push("  pattern data offset = " + layout.patternDataOffset + " (0x" + toHex(layout.patternDataOffset, 4) + ")");
  lines.push("  bytes per pattern   = " + layout.bytesPerPattern);
  lines.push("");

  // Read raw bytes for the selected pattern.
  const patternOffset: number = layout.patternDataOffset + patternIndex * layout.bytesPerPattern;

  if (patternOffset + layout.bytesPerPattern > fileSize) {
    lines.push("ERROR: pattern data is out of range.");
    write(lines.join("\n"));
    return;
  }

  const data: Uint8Array = new Uint8Array(buffer);
  const patternBytes: Uint8Array = data.subarray(patternOffset, patternOffset + layout.bytesPerPattern);

  // Print a small table: first N rows for readability.
  const rowsToShow: number = 16;

  lines.push("decoded cells (first " + rowsToShow + " rows):");
  lines.push("row  | ch0               | ch1               | ch2               | ch3");
  lines.push("-----+-------------------+-------------------+-------------------+-------------------");

  for (let row = 0; row < rowsToShow; row++) {
    const rowBase: number = row * layout.bytesPerRow;

    // Each channel cell is 4 bytes.
    const ch0 = decodeCell(
      patternBytes[rowBase + 0],
      patternBytes[rowBase + 1],
      patternBytes[rowBase + 2],
      patternBytes[rowBase + 3]
    );

    const ch1 = decodeCell(
      patternBytes[rowBase + 4],
      patternBytes[rowBase + 5],
      patternBytes[rowBase + 6],
      patternBytes[rowBase + 7]
    );

    const ch2 = decodeCell(
      patternBytes[rowBase + 8],
      patternBytes[rowBase + 9],
      patternBytes[rowBase + 10],
      patternBytes[rowBase + 11]
    );

    const ch3 = decodeCell(
      patternBytes[rowBase + 12],
      patternBytes[rowBase + 13],
      patternBytes[rowBase + 14],
      patternBytes[rowBase + 15]
    );

    const rowStr: string =
      padLeft(row.toString(), 3) + "  | " +
      formatCell(ch0) + " | " +
      formatCell(ch1) + " | " +
      formatCell(ch2) + " | " +
      formatCell(ch3);

    lines.push(rowStr);
  }

  lines.push("");
  lines.push("cell format: s=sample, p=period (raw decimal), e=effect (hex nibble), a=param (hex byte)");
  lines.push("example: s05 p0214 eE a01");  

  write(lines.join("\n"));
}

function formatCell(c: { sample: number; period: number; effect: number; param: number }): string {
  const s = padZero(c.sample, 2);   // 0..31 -> "05"
  const p = padZero(c.period, 4);   // 0..4095 -> "0214"
  const e = toHex(c.effect, 1);
  const a = toHex(c.param, 2);

  return "s" + s + " p" + p + " e" + e + " a" + a + " ";
}

function padZero(value: number, width: number): string {
  let s = value.toString();
  while (s.length < width) s = "0" + s;
  return s;
}

function padLeft(s: string, width: number): string {
  while (s.length < width) s = " " + s;
  return s;
}

function write(text: string): void {
  if (!output) return;
  output.textContent = text;
}