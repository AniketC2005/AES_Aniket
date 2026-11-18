import { describe, it, expect } from 'vitest';
import { runAllTestVectors, NIST_VECTORS } from './testVectors';
import { encryptBlockWithTrace, decryptBlockWithTrace, encryptAES, decryptAES } from './aesEngine';
import { expandKey } from './keyExpansion';
import { hexToBytes, bytesToHex, applyPkcs7Padding, removePkcs7Padding } from './utils';

describe('AES NIST FIPS 197 Standard Compliance & Edge Cases', () => {
  it('passes all NIST FIPS 197 known-answer test vectors and integrity checks', () => {
    const results = runAllTestVectors();
    expect(results.length).toBeGreaterThan(0);
    for (const res of results) {
      expect(res.passed).toBe(true);
    }
  });

  it('matches AES-128 NIST vector exactly (Key: 00..0f, PT: 00..ff)', () => {
    const vec = NIST_VECTORS[0];
    const pt = hexToBytes(vec.plaintextHex);
    const key = hexToBytes(vec.keyHex);
    const trace = encryptBlockWithTrace(pt, key, 128);
    expect(bytesToHex(trace.outputBytes).toLowerCase()).toBe(vec.expectedCiphertextHex.toLowerCase());

    const decTrace = decryptBlockWithTrace(trace.outputBytes, key, 128);
    expect(bytesToHex(decTrace.outputBytes).toLowerCase()).toBe(vec.plaintextHex.toLowerCase());
  });

  it('matches AES-192 NIST vector exactly', () => {
    const vec = NIST_VECTORS[1];
    const pt = hexToBytes(vec.plaintextHex);
    const key = hexToBytes(vec.keyHex);
    const trace = encryptBlockWithTrace(pt, key, 192);
    expect(bytesToHex(trace.outputBytes).toLowerCase()).toBe(vec.expectedCiphertextHex.toLowerCase());

    const decTrace = decryptBlockWithTrace(trace.outputBytes, key, 192);
    expect(bytesToHex(decTrace.outputBytes).toLowerCase()).toBe(vec.plaintextHex.toLowerCase());
  });

  it('matches AES-256 NIST vector exactly', () => {
    const vec = NIST_VECTORS[2];
    const pt = hexToBytes(vec.plaintextHex);
    const key = hexToBytes(vec.keyHex);
    const trace = encryptBlockWithTrace(pt, key, 256);
    expect(bytesToHex(trace.outputBytes).toLowerCase()).toBe(vec.expectedCiphertextHex.toLowerCase());

    const decTrace = decryptBlockWithTrace(trace.outputBytes, key, 256);
    expect(bytesToHex(decTrace.outputBytes).toLowerCase()).toBe(vec.plaintextHex.toLowerCase());
  });

  it('generates the exact expected number of key expansion words for all key sizes', () => {
    const key128 = hexToBytes('000102030405060708090a0b0c0d0e0f');
    const exp128 = expandKey(key128, 128);
    expect(exp128.words.length).toBe(44); // 4 * (10 + 1)
    expect(exp128.roundKeys.length).toBe(11);

    const key192 = hexToBytes('000102030405060708090a0b0c0d0e0f1011121314151617');
    const exp192 = expandKey(key192, 192);
    expect(exp192.words.length).toBe(52); // 4 * (12 + 1)
    expect(exp192.roundKeys.length).toBe(13);

    const key256 = hexToBytes('000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f');
    const exp256 = expandKey(key256, 256);
    expect(exp256.words.length).toBe(60); // 4 * (14 + 1)
    expect(exp256.roundKeys.length).toBe(15);
  });

  it('validates PKCS#7 padding and unpadding correctness', () => {
    // 0 bytes -> pads to 16 bytes with 0x10
    const pad0 = applyPkcs7Padding([]);
    expect(pad0.paddingBytesCount).toBe(16);
    expect(pad0.padded.length).toBe(16);
    expect(pad0.padded.every(b => b === 16)).toBe(true);
    expect(removePkcs7Padding(pad0.padded).valid).toBe(true);

    // 15 bytes -> pads 1 byte of 0x01
    const pad15 = applyPkcs7Padding(new Array(15).fill(0xaa));
    expect(pad15.paddingBytesCount).toBe(1);
    expect(pad15.padded[15]).toBe(1);
    expect(removePkcs7Padding(pad15.padded).valid).toBe(true);

    // 16 bytes -> pads full new block of 16 bytes of 0x10
    const pad16 = applyPkcs7Padding(new Array(16).fill(0xbb));
    expect(pad16.paddingBytesCount).toBe(16);
    expect(pad16.padded.length).toBe(32);
    const unpad16 = removePkcs7Padding(pad16.padded);
    expect(unpad16.valid).toBe(true);
    expect(unpad16.unpadded.length).toBe(16);
  });

  it('rejects invalid key length and invalid hex characters properly', () => {
    expect(() => hexToBytes('12345')).toThrow('Hex string must have an even number of characters.');
    expect(() => expandKey([1, 2, 3], 128)).toThrow('Invalid key length for AES-128');
  });

  it('handles multi-block UTF-8 and unicode string encryption/decryption round-trip', () => {
    const text = 'AES Cryptography Lab: 🔐 Confidential Data with Unicode: 🚀, 💻, €250, ¥5000, ñ, å, ü.';
    const keyHex = '2b7e151628aed2a6abf7158809cf4f3c';
    const enc = encryptAES(text, keyHex, 128, 'CBC');
    const dec = decryptAES(enc.ciphertextHex, keyHex, 128, 'CBC');

    expect(dec.unpaddedSuccessfully).toBe(true);
    expect(dec.recoveredText).toBe(text);
  });

  it('fails decryption or corrupts data when wrong key is provided', () => {
    const text = 'Super secret payload';
    const goodKey = '000102030405060708090a0b0c0d0e0f';
    const badKey = 'ffffffffffffffffffffffffffffffff';
    const enc = encryptAES(text, goodKey, 128, 'CBC');
    const dec = decryptAES(enc.ciphertextHex, badKey, 128, 'CBC');

    expect(dec.recoveredText).not.toBe(text);
  });

  it('preserves mathematical step-by-step trace integrity for visualizer', () => {
    const pt = hexToBytes('00112233445566778899aabbccddeeff');
    const key = hexToBytes('000102030405060708090a0b0c0d0e0f');
    const trace = encryptBlockWithTrace(pt, key, 128);

    // Initial step + AddRoundKey + 9 standard rounds * 4 steps + final round * 3 steps = 1 + 1 + 36 + 3 = 41 steps
    expect(trace.steps.length).toBe(41);
    expect(trace.steps[0].transformation).toBe('INPUT');
    expect(trace.steps[1].transformation).toBe('ADD_ROUND_KEY_INITIAL');
    expect(trace.steps[trace.steps.length - 1].transformation).toBe('ADD_ROUND_KEY');
    expect(trace.steps[trace.steps.length - 1].round).toBe(10);
  });
});
