/**
 * Project: mod-player-demystified
 * File: demo.ts
 * Author: Patrik Sporre
 * License: MIT
 *
 * Description:
 *   Demo 02-parse-header
 *   Loads a MOD file and parses the ProTracker header.
 *   Displays decoded fields and validates id at offset 1080.
 */

import { readFileAsArrayBuffer } from "../../host/file.js";
import { hexDump } from "../../host/hex.js";
import { Reader } from "../../engine/io/reader.js";
import { parseHeader, computePatternCount } from "../../engine/protracker/mod/header.js";

let output: HTMLPreElement | null = null;

export function init(application: HTMLElement): void {
  const title = document.createElement("h1");
  title.textContent = "Demo 02 - Parse MOD header (ProTracker, M.K.)";
  application.appendChild(title);

  const info = document.createElement("p");
  info.textContent = "Select a ProTracker MOD. This demo parses the fixed header and validates the id at offset 1080.";
  application.appendChild(info);

  const input = document.createElement("input");
  input.type = "file";
  input.accept = ".mod,*/*";
  application.appendChild(input);

  const spacer = document.createElement("div");
  spacer.style.height = "12px";
  application.appendChild(spacer);

  output = document.createElement("pre");
  output.style.fontFamily = "monospace";
  output.style.fontSize = "13px";
  output.style.lineHeight = "1.25";
  output.textContent = "No file loaded.";
  application.appendChild(output);

  input.addEventListener("change", function () {
    const file = input.files ? input.files[0] : null;
    if (!file) {
      write("No file selected.");
      return;
    }

    onFileSelected(file);
  });
}

export function render(elapsedTime: number, deltaTime: number): void {
  // No animation needed.
}

async function onFileSelected(file: File): Promise<void> {
  try {
    const buffer = await readFileAsArrayBuffer(file);
    inspect(file, buffer);
  } catch (e) {
    write("Failed to read file.");
  }
}

function inspect(file: File, buffer: ArrayBuffer): void {
  const r = new Reader(buffer);

  const lines: string[] = [];
  lines.push("file: " + file.name);
  lines.push("size: " + buffer.byteLength + " bytes");
  lines.push("");

  // Parse header from start.
  r.seek(0);

  let header;
  try {
    header = parseHeader(r);
  } catch (e) {
    lines.push("ERROR: " + (e instanceof Error ? e.message : "unknown error"));
    lines.push("");
    lines.push("Tip: Demo 02 currently supports only id \"M.K.\" (classic 4-channel ProTracker MOD).");
    write(lines.join("\n"));
    return;
  }

  const patternCount = computePatternCount(header);

  lines.push("header:");
  lines.push("  title: \"" + header.title + "\"");
  lines.push("  song length: " + header.songLength);
  lines.push("  restart: " + header.restartPosition);
  lines.push("  magic: \"" + header.id + "\"  (expected at offset 1080 / 0x438)");
  lines.push("  patterns: " + patternCount);
  lines.push("");

  // Order table (only meaningful entries)
  lines.push("order table (first " + header.songLength + " positions):");
  lines.push(formatOrderTable(header.orderTable, header.songLength));
  lines.push("");

  // Show a compact sample summary
  lines.push("samples (name | length bytes | volume | loop start bytes | loop length bytes):");
  for (let i = 0; i < header.samples.length; i++) {
    const s = header.samples[i];

    const lenBytes = s.lengthWords * 2;
    const loopStartBytes = s.loopStartWords * 2;
    const loopLenBytes = s.loopLengthWords * 2;

    // Keep it readable: index 01..31
    const idx = (i + 1).toString().padStart(2, "0");

    lines.push(
      "  " + idx + "  " +
      padRight(trimName(s.name), 22) + "  " +
      padLeft(lenBytes.toString(), 8) + "  " +
      padLeft(s.volume.toString(), 3) + "  " +
      padLeft(loopStartBytes.toString(), 8) + "  " +
      padLeft(loopLenBytes.toString(), 8)
    );
  }

  lines.push("");

  write(lines.join("\n"));
}

function write(text: string): void {
  if (!output) return;
  output.textContent = text;
}

function formatOrderTable(order: Uint8Array, length: number): string {
  // Print order indices in rows of 16, classic style.
  const cols = 16;
  let out = "";

  for (let i = 0; i < length; i++) {
    if (i % cols === 0) {
      if (i !== 0) out += "\n";
      out += "  ";
    }

    out += padLeft(order[i].toString(), 3);

    if ((i % cols) !== cols - 1) out += " ";
  }

  return out;
}

function trimName(s: string): string {
  // Remove trailing spaces for nicer display.
  let end = s.length;
  while (end > 0 && s[end - 1] === " ") end--;
  return s.substring(0, end);
}

function padLeft(s: string, width: number): string {
  while (s.length < width) s = " " + s;
  return s;
}

function padRight(s: string, width: number): string {
  while (s.length < width) s = s + " ";
  return s;
}