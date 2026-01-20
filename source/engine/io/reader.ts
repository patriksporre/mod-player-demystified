/**
 * Project: mod-player-demystified
 * File: reader.ts
 * Author: Patrik Sporre
 * License: MIT
 *
 * Description:
 *   Minimal binary reader with an explicit cursor.
 *
 *   Design goals:
 *   - Simple and predictable (C-like)
 *   - Safe bounds checks (fail fast)
 *   - Easy to port to other languages
 *
 *   Notes:
 *   - ProTracker MOD is an Amiga-era format. Multi-byte values are big-endian.
 *   - This reader provides u16be() as a core primitive for parsing.
 */

export class Reader {
  private data: Uint8Array;
  private position: number;

  /**
   * Creates a reader over the provided ArrayBuffer.
   *
   * @param buffer - Raw binary data.
   */
  public constructor(buffer: ArrayBuffer) {
    this.data = new Uint8Array(buffer);
    this.position = 0;
  }

  /**
   * Returns the current cursor position in bytes.
   */
  public tell(): number {
    return this.position;
  }

  /**
   * Sets the cursor position.
   *
   * @param position - New cursor position in bytes.
   */
  public seek(position: number): void {
    if (position < 0) throw new Error("Reader.seek:: position < 0");
    if (position > this.data.length) throw new Error("Reader.seek:: position beyond end");
    
    this.position = position;
  }

  /**
   * Total size of the underlying data in bytes.
   */
  public size(): number {
    return this.data.length;
  }

  /**
   * Remaining unread bytes from the current cursor position.
   */
  public remaining(): number {
    return this.data.length - this.position;
  }

  /**
   * Reads an unsigned 8-bit value.
   * Advances the cursor by 1 byte.
   */
  public u8(): number {
    if (this.position + 1 > this.data.length) throw new Error("Reader.u8:: out of range");
    
    const v: number = this.data[this.position];
    this.position += 1;
    
    return v;
  }

  /**
   * Reads an unsigned 16-bit big-endian value.
   * Advances the cursor by 2 bytes.
   */
  public u16be(): number {
    if (this.position + 2 > this.data.length) throw new Error("Reader.u16be:: out of range");
    
    const hi: number = this.data[this.position + 0];
    const lo: number = this.data[this.position + 1];
    this.position += 2;
    
    return (hi << 8) | lo;
  }

  /**
   * Reads a raw byte range.
   * Advances the cursor by count bytes.
   *
   * @param count - Number of bytes to read.
   */
  public bytes(count: number): Uint8Array {
    if (count < 0) throw new Error("Reader.bytes: count < 0");
    if (this.position + count > this.data.length) throw new Error("Reader.bytes:: out of range");
    
    const slice: Uint8Array = this.data.subarray(this.position, this.position + count);
    this.position += count;
    
    return slice;
  }

  /**
   * Reads a fixed-length ASCII string.
   * Stops at the first null byte, otherwise reads count bytes.
   * Advances the cursor by count bytes.
   *
   * @param count - Number of bytes to consume.
   */
  public str(count: number): string {
    const b: Uint8Array = this.bytes(count);

    let str: string = "";
    for (let i = 0; i < b.length; i++) {
      const c = b[i];
      if (c === 0) break;
      str += String.fromCharCode(c);
    }

    return str;
  }
}