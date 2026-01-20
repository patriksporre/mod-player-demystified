/**
 * Project: mod-player-demystified
 * File: demo.ts
 * Author: Patrik Sporre
 * License: MIT
 *
 * Description:
 *   Demo 03A - Layout & offsets
 *
 *   Loads a ProTracker MOD (M.K.), parses the header, and computes
 *   structural layout information:
 *     - pattern count
 *     - pattern data offsets and sizes
 *     - sample data offsets and sizes
 *
 *   No pattern decoding or audio playback is performed.
 */

import { readFileAsArrayBuffer } from "../../host/file.js";
import { toHex } from "../../host/hex.js";

import { Reader } from "../../engine/io/reader.js";
import { parseHeader } from "../../engine/protracker/mod/header.js";
import { computeLayout, validateLayout } from "../../engine/protracker/mod/layout.js";

let output: HTMLPreElement | null = null;

export function init(application: HTMLElement): void {
  const title: HTMLElement = document.createElement("h1");
  title.textContent = "Demo 03A - MOD layout & offsets (ProTracker, M.K.)";
  application.appendChild(title);

  const info: HTMLElement = document.createElement("p");
  info.textContent =
    "Loads a MOD, parses the header, computes pattern/sample offsets, " +
    "and validates file size invariants.";
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
  } catch (_e) {
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
    lines.push(
      "ERROR: " + (e instanceof Error ? e.message : "unknown error")
    );
    write(lines.join("\n"));
    return;
  }

  const layout = computeLayout(header);
  const issues: string[] = validateLayout(fileSize, layout);

  lines.push("header summary:");
  lines.push("  title: \"" + header.title + "\"");
  lines.push("  song length: " + header.songLength);
  lines.push("  id: \"" + header.id + "\"");
  lines.push("");

  lines.push("layout:");
  lines.push("  channels: " + layout.channels);
  lines.push("  rows per pattern: " + layout.rowsPerPattern);
  lines.push("  bytes per row: " + layout.bytesPerRow);
  lines.push("  bytes per pattern: " + layout.bytesPerPattern);
  lines.push("");

  lines.push("  pattern count: " + layout.patternCount);
  lines.push(
    "  pattern data offset: " +
      layout.patternDataOffset +
      " (0x" +
      toHex(layout.patternDataOffset, 4) +
      ")"
  );
  lines.push("  pattern data size:   " + layout.patternDataSize);

  lines.push(
    "  sample data offset:  " +
      layout.sampleDataOffset +
      " (0x" +
      toHex(layout.sampleDataOffset, 4) +
      ")"
  );
  lines.push("  sample data size:    " + layout.sampleDataSize);
  lines.push("");

  lines.push(
    "  expected min file size: " + layout.expectedMinFileSize
  );

  if (fileSize >= layout.expectedMinFileSize) {
    lines.push("  status: OK (file has enough data)");
  } else {
    lines.push("  status: INVALID (file is smaller than expected)");
  }

  lines.push("");

  if (issues.length > 0) {
    lines.push("issues:");
    for (let i = 0; i < issues.length; i++) {
      lines.push("  - " + issues[i]);
    }
  } else {
    lines.push("issues: none");
  }

  write(lines.join("\n"));
}

function write(text: string): void {
  if (!output) return;
  output.textContent = text;
}