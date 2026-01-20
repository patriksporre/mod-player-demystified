/**
 * Project: mod-player-demystified
 * File: demo.ts
 * Author: Patrik Sporre
 * License: MIT
 *
 * Description:
 *   Demo 01-load-file
 *   Loads a file into an ArrayBuffer and shows a hex dump.
 *   Introduces the shared binary Reader used for all parsing.
 */

import { readFileAsArrayBuffer } from "../../host/file.js";
import { hexDump } from "../../host/hex.js";
import { Reader } from "../../engine/io/reader.js";

let output: HTMLPreElement | null = null;

export function init(application: HTMLElement): void {
  const title = document.createElement("h1");
  title.textContent = "Demo 01 - Load file + hex dump";
  application.appendChild(title);

  const info = document.createElement("p");
  info.textContent = "Select a .mod file (or any file) and inspect the raw bytes.";
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

export function render(_elapsedTime: number, _deltaTime: number): void {
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

  r.seek(0);
  const title = r.str(20);

  lines.push("reader:");
  lines.push("  tell() after reading 20 bytes: " + r.tell());
  lines.push("  first 20 bytes as string: \"" + title + "\"");
  lines.push("");

  r.seek(0);

  const dumpLen = Math.min(1088, r.size());
  const first = r.bytes(dumpLen);

  lines.push("hex dump (first " + dumpLen + " bytes):");
  lines.push(hexDump(first, 0, 16));

  write(lines.join("\n"));
}

function write(text: string): void {
  if (!output) return;
  output.textContent = text;
}