import { gfInverse, xtime } from './gf256';

// Compute the forward AES S-box dynamically from GF(2^8) inversion and affine mapping
function computeSBox(): Uint8Array {
  const box = new Uint8Array(256);
  const c = 0x63;

  for (let i = 0; i < 256; i++) {
    const inv = gfInverse(i);
    let s = 0;
    for (let bit = 0; bit < 8; bit++) {
      const b0 = (inv >> bit) & 1;
      const b4 = (inv >> ((bit + 4) % 8)) & 1;
      const b5 = (inv >> ((bit + 5) % 8)) & 1;
      const b6 = (inv >> ((bit + 6) % 8)) & 1;
      const b7 = (inv >> ((bit + 7) % 8)) & 1;
      const cBit = (c >> bit) & 1;
      const resBit = b0 ^ b4 ^ b5 ^ b6 ^ b7 ^ cBit;
      s |= (resBit << bit);
    }
    box[i] = s;
  }
  return box;
}

// Compute the inverse S-box
function computeInvSBox(sbox: Uint8Array): Uint8Array {
  const invBox = new Uint8Array(256);
  for (let i = 0; i < 256; i++) {
    invBox[sbox[i]] = i;
  }
  return invBox;
}

// Compute Rcon (Round Constants) for Key Expansion
function computeRcon(): Uint8Array {
  const rcon = new Uint8Array(32);
  let val = 0x01;
  rcon[1] = val;
  for (let i = 2; i < 32; i++) {
    val = xtime(val);
    rcon[i] = val;
  }
  return rcon;
}

export const S_BOX = computeSBox();
export const INV_S_BOX = computeInvSBox(S_BOX);
export const RCON = computeRcon();

// Key size specifications: Nk (key words), Nr (rounds)
export const AES_SPECS = {
  128: { nk: 4, nr: 10, keyBytes: 16 },
  192: { nk: 6, nr: 12, keyBytes: 24 },
  256: { nk: 8, nr: 14, keyBytes: 32 },
} as const;
