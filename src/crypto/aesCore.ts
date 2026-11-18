import { S_BOX, INV_S_BOX } from './aesConstants';
import { gfMultiply, xtime } from './gf256';
import { cloneState } from './utils';

// SubBytes: Replace each byte with its corresponding S-box byte
export function subBytes(state: number[][]): number[][] {
  const next = cloneState(state);
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      next[r][c] = S_BOX[state[r][c]];
    }
  }
  return next;
}

// InvSubBytes: Replace each byte with its corresponding Inverse S-box byte
export function invSubBytes(state: number[][]): number[][] {
  const next = cloneState(state);
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      next[r][c] = INV_S_BOX[state[r][c]];
    }
  }
  return next;
}

// ShiftRows: Cyclically shift row r left by r bytes
// Row 0: no shift
// Row 1: shift left by 1
// Row 2: shift left by 2
// Row 3: shift left by 3
export function shiftRows(state: number[][]): number[][] {
  const next = cloneState(state);
  // Row 1 left by 1
  next[1] = [state[1][1], state[1][2], state[1][3], state[1][0]];
  // Row 2 left by 2
  next[2] = [state[2][2], state[2][3], state[2][0], state[2][1]];
  // Row 3 left by 3
  next[3] = [state[3][3], state[3][0], state[3][1], state[3][2]];
  return next;
}

// InvShiftRows: Cyclically shift row r right by r bytes
// Row 0: no shift
// Row 1: shift right by 1
// Row 2: shift right by 2
// Row 3: shift right by 3
export function invShiftRows(state: number[][]): number[][] {
  const next = cloneState(state);
  // Row 1 right by 1
  next[1] = [state[1][3], state[1][0], state[1][1], state[1][2]];
  // Row 2 right by 2
  next[2] = [state[2][2], state[2][3], state[2][0], state[2][1]];
  // Row 3 right by 3
  next[3] = [state[3][1], state[3][2], state[3][3], state[3][0]];
  return next;
}

// MixColumns: Multiply each column by polynomial c(x) = {03}x^3 + {01}x^2 + {01}x + {02}
export function mixColumns(state: number[][]): number[][] {
  const next = cloneState(state);
  for (let c = 0; c < 4; c++) {
    const a0 = state[0][c];
    const a1 = state[1][c];
    const a2 = state[2][c];
    const a3 = state[3][c];

    // xtime(a0) is {02} * a0
    // xtime(a0) ^ a0 is {03} * a0
    const t0 = xtime(a0);
    const t1 = xtime(a1);
    const t2 = xtime(a2);
    const t3 = xtime(a3);

    next[0][c] = (t0 ^ (t1 ^ a1) ^ a2 ^ a3) & 0xff;
    next[1][c] = (a0 ^ t1 ^ (t2 ^ a2) ^ a3) & 0xff;
    next[2][c] = (a0 ^ a1 ^ t2 ^ (t3 ^ a3)) & 0xff;
    next[3][c] = ((t0 ^ a0) ^ a1 ^ a2 ^ t3) & 0xff;
  }
  return next;
}

// InvMixColumns: Multiply each column by inverse polynomial d(x) = {0b}x^3 + {0d}x^2 + {09}x + {0e}
export function invMixColumns(state: number[][]): number[][] {
  const next = cloneState(state);
  for (let c = 0; c < 4; c++) {
    const a0 = state[0][c];
    const a1 = state[1][c];
    const a2 = state[2][c];
    const a3 = state[3][c];

    next[0][c] = gfMultiply(0x0e, a0) ^ gfMultiply(0x0b, a1) ^ gfMultiply(0x0d, a2) ^ gfMultiply(0x09, a3);
    next[1][c] = gfMultiply(0x09, a0) ^ gfMultiply(0x0e, a1) ^ gfMultiply(0x0b, a2) ^ gfMultiply(0x0d, a3);
    next[2][c] = gfMultiply(0x0d, a0) ^ gfMultiply(0x09, a1) ^ gfMultiply(0x0e, a2) ^ gfMultiply(0x0b, a3);
    next[3][c] = gfMultiply(0x0b, a0) ^ gfMultiply(0x0d, a1) ^ gfMultiply(0x09, a2) ^ gfMultiply(0x0e, a3);
  }
  return next;
}

// AddRoundKey: XOR state with round key
export function addRoundKey(state: number[][], roundKey: number[][]): number[][] {
  const next = cloneState(state);
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      next[r][c] = (state[r][c] ^ roundKey[r][c]) & 0xff;
    }
  }
  return next;
}
