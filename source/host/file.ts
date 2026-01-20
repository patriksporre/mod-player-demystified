/**
 * Project: mod-player-demystified
 * File: file.ts
 * Author: Patrik Sporre
 * License: MIT
 *
 * Description:
 *   Browser helper for reading a File into an ArrayBuffer.
 *   This is host code (environment-specific), not engine code.
 */

export function readFileAsArrayBuffer(file: File): Promise<ArrayBuffer> {
  return new Promise(function (resolve, reject) {
    const reader: FileReader = new FileReader();

    reader.onload = function () {
      const result: string | ArrayBuffer | null = reader.result;
      
      if (result instanceof ArrayBuffer) {
        resolve(result);
      } else {
        reject(new Error("readFileAsArrayBuffer:: result was not an ArrayBuffer"));
      }
    };

    reader.onerror = function () {
      reject(new Error("readFileAsArrayBuffer:: FileReader error"));
    };

    reader.readAsArrayBuffer(file);
  });
}