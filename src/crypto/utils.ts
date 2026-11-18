// Helper conversion and formatting utilities

export function bytesToHex(bytes: Uint8Array | number[]): string {
  const arr = Array.isArray(bytes) ? bytes : Array.from(bytes);
  return arr.map(b => (b & 0xff).toString(16).padStart(2, '0')).join('');
}

export function hexToBytes(hex: string): number[] {
  const clean = hex.replace(/[^0-9a-fA-F]/g, '');
  if (clean.length % 2 !== 0) {
    throw new Error('Hex string must have an even number of characters.');
  }
  const bytes: number[] = [];
  for (let i = 0; i < clean.length; i += 2) {
    bytes.push(parseInt(clean.slice(i, i + 2), 16));
  }
  return bytes;
}

export function stringToBytes(str: string): number[] {
  const encoder = new TextEncoder();
  return Array.from(encoder.encode(str));
}

export function bytesToString(bytes: number[]): string {
  const decoder = new TextDecoder('utf-8', { fatal: false });
  return decoder.decode(new Uint8Array(bytes));
}

export function bytesToBase64(bytes: number[]): string {
  let binary = '';
  const len = bytes.length;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export function base64ToBytes(base64: string): number[] {
  const binary = atob(base64);
  const bytes = new Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

// Format hex string with spaces every 2 chars or 8 chars
export function formatHex(hex: string, groupSize: number = 2): string {
  const clean = hex.replace(/\s+/g, '');
  const chunks: string[] = [];
  for (let i = 0; i < clean.length; i += groupSize) {
    chunks.push(clean.slice(i, i + groupSize));
  }
  return chunks.join(' ');
}

// Map 16-byte array to 4x4 column-major State Matrix
// state[r][c] = bytes[r + 4*c]
export function bytesToState(bytes: number[]): number[][] {
  const state: number[][] = [
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ];
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      state[r][c] = bytes[r + 4 * c] ?? 0;
    }
  }
  return state;
}

// Convert 4x4 column-major State Matrix back to 16-byte array
export function stateToBytes(state: number[][]): number[] {
  const bytes: number[] = new Array(16);
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      bytes[r + 4 * c] = state[r][c];
    }
  }
  return bytes;
}

// Deep clone 4x4 matrix
export function cloneState(state: number[][]): number[][] {
  return state.map(row => [...row]);
}

// Compute changed cells between two 4x4 states
export function compareStates(before: number[][], after: number[][]): boolean[][] {
  const diff: boolean[][] = [];
  for (let r = 0; r < 4; r++) {
    const rowDiff: boolean[] = [];
    for (let c = 0; c < 4; c++) {
      rowDiff.push(before[r][c] !== after[r][c]);
    }
    diff.push(rowDiff);
  }
  return diff;
}

// PKCS#7 Padding: adds 1 to 16 bytes such that total length is multiple of 16
export function applyPkcs7Padding(bytes: number[]): { padded: number[]; paddingBytesCount: number } {
  const remainder = bytes.length % 16;
  const padLength = 16 - remainder; // 1 to 16 bytes
  const padded = [...bytes];
  for (let i = 0; i < padLength; i++) {
    padded.push(padLength);
  }
  return { padded, paddingBytesCount: padLength };
}

// Remove PKCS#7 padding with rigorous validation
export function removePkcs7Padding(paddedBytes: number[]): { unpadded: number[]; valid: boolean } {
  if (paddedBytes.length === 0 || paddedBytes.length % 16 !== 0) {
    return { unpadded: paddedBytes, valid: false };
  }
  const padLength = paddedBytes[paddedBytes.length - 1];
  if (padLength < 1 || padLength > 16) {
    return { unpadded: paddedBytes, valid: false };
  }
  for (let i = paddedBytes.length - padLength; i < paddedBytes.length; i++) {
    if (paddedBytes[i] !== padLength) {
      return { unpadded: paddedBytes, valid: false };
    }
  }
  return {
    unpadded: paddedBytes.slice(0, paddedBytes.length - padLength),
    valid: true,
  };
}

// Generate secure random bytes as hex string
export function generateRandomHex(byteCount: number): string {
  const arr = new Uint8Array(byteCount);
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(arr);
  } else {
    for (let i = 0; i < byteCount; i++) {
      arr[i] = Math.floor(Math.random() * 256);
    }
  }
  return bytesToHex(arr);
}
