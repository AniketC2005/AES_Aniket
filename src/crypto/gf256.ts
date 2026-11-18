// GF(2^8) arithmetic operations for AES (Rijndael)
// Field polynomial: m(x) = x^8 + x^4 + x^3 + x + 1 (binary: 100011011, hex: 0x11B)

export function gfAdd(a: number, b: number): number {
  return (a ^ b) & 0xff;
}

// xtime multiplies a polynomial by x (i.e. shifts left by 1 and reduces modulo 0x11B if bit 7 is set)
export function xtime(b: number): number {
  const highBit = (b & 0x80) !== 0;
  let res = (b << 1) & 0xff;
  if (highBit) {
    res ^= 0x1b;
  }
  return res;
}

// Multiplication of two elements in GF(2^8)
export function gfMultiply(a: number, b: number): number {
  let p = 0;
  let tempA = a & 0xff;
  let tempB = b & 0xff;

  for (let i = 0; i < 8; i++) {
    if ((tempB & 1) !== 0) {
      p ^= tempA;
    }
    tempA = xtime(tempA);
    tempB >>= 1;
  }
  return p & 0xff;
}

// Multiplicative inverse in GF(2^8) using exponentiation (a^254 = a^-1 since a^255 = 1)
export function gfInverse(a: number): number {
  if (a === 0) return 0;
  let res = 1;
  let base = a;
  let exp = 254; // 255 - 1

  while (exp > 0) {
    if ((exp & 1) === 1) {
      res = gfMultiply(res, base);
    }
    base = gfMultiply(base, base);
    exp >>= 1;
  }
  return res;
}
