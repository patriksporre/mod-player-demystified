/**
 * Project: mod-player-demystified
 * File: hex.ts
 * Author: Patrik Sporre
 * License: MIT
 *
 * Description:
 *   Hex dump formatting for diagnostics.
 *
 *   This module formats raw binary data into a classic hex dump layout
 *   similar to tools like hexdump, xxd, or Norton Utilities.
 *
 *   This code is intended for inspection and debugging only.
 *   It is not part of the MOD player engine itself.
 *
 *   Output format (per row):
 *
 *     00000000  4D 2E 4B 2E 00 00 00 00  54 49 54 4C 45 00 00 00  M.K.....TITLE...
 *
 *   Layout rules:
 *   - Offset shown on the left (hexadecimal)
 *   - Fixed number of bytes per row (default: 16)
 *   - Extra space after 8 bytes for visual grouping
 *   - ASCII representation on the right
 *   - Non-printable characters rendered as '.'
 */

export function hexDump(
  bytes: Uint8Array,
  baseOffset: number = 0,
  bytesPerRow: number = 16
): string {

  // Each formatted row becomes one string in this array
  const lines: string[] = [];

  // Process the input data row by row
  for (let row = 0; row < bytes.length; row += bytesPerRow) {

    // Calculate the absolute offset of this row
    // baseOffset allows dumping slices of a larger file
    const offset: number = baseOffset + row;

    // Start the line with the offset (8 hex digits), followed by spacing
    let line: string = toHex(offset, 8) + "  ";

    // Hexadecimal byte representation (left side)
    let hexPart: string = "";

    // ASCII character representation (right side)
    let asciiPart: string = "";

    // Process each byte in the row
    for (let i = 0; i < bytesPerRow; i++) {

      // Index into the byte array
      const index: number = row + i;

      if (index < bytes.length) {
        // Valid byte within input
        const b: number = bytes[index];

        // Append hex representation (two digits + space)
        hexPart += toHex(b, 2) + " ";

        // Printable ASCII range: 32 (' ') to 126 ('~')
        if (b >= 32 && b <= 126) {
          asciiPart += String.fromCharCode(b);
        } else {
          // Non-printable byte
          asciiPart += ".";
        }
      } else {
        // Past end of data: pad with spaces to keep alignment
        hexPart += "   ";
        asciiPart += " ";
      }

      // Insert an extra space after 8 bytes
      // This improves readability and mirrors classic tools
      if (i === 7) {
        hexPart += " ";
      }
    }

    // Combine offset, hex bytes, and ASCII view into one line
    line += hexPart + " " + asciiPart;

    // Store the completed line
    lines.push(line);
  }

  // Join all rows with newlines
  return lines.join("\n");
}

/**
 * Converts a number to an uppercase hexadecimal string
 * with zero-padding to a fixed width.
 *
 * Examples:
 *   toHex(10, 2)   -> "0A"
 *   toHex(255, 4)  -> "00FF"
 */
export function toHex(value: number, width: number): string {
  let str: string = value.toString(16).toUpperCase();

  // Pad with leading zeros until the desired width is reached
  while (str.length < width) {
    str = "0" + str;
  }

  return str;
}