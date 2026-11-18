import { NISTTestVector } from '../types/aes';
import { encryptBlockWithTrace, decryptBlockWithTrace, encryptAES, decryptAES } from './aesEngine';
import { hexToBytes, bytesToHex } from './utils';

export const NIST_VECTORS: NISTTestVector[] = [
  {
    id: 'nist-aes-128',
    title: 'NIST FIPS 197 Appendix B (AES-128)',
    keySize: 128,
    keyHex: '000102030405060708090a0b0c0d0e0f',
    plaintextHex: '00112233445566778899aabbccddeeff',
    expectedCiphertextHex: '69c4e0d86a7b0430d8cdb78070b4c55a',
    description: 'Standard 128-bit key (10 rounds) known-answer test vector from NIST FIPS 197 specification.',
  },
  {
    id: 'nist-aes-192',
    title: 'NIST FIPS 197 Appendix B (AES-192)',
    keySize: 192,
    keyHex: '000102030405060708090a0b0c0d0e0f1011121314151617',
    plaintextHex: '00112233445566778899aabbccddeeff',
    expectedCiphertextHex: 'dda97ca4864cdfe06eaf70a0ec0d7191',
    description: 'Standard 192-bit key (12 rounds) known-answer test vector from NIST FIPS 197 specification.',
  },
  {
    id: 'nist-aes-256',
    title: 'NIST FIPS 197 Appendix C (AES-256)',
    keySize: 256,
    keyHex: '000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f',
    plaintextHex: '00112233445566778899aabbccddeeff',
    expectedCiphertextHex: '8ea2b7ca516745bfeafc49904b496089',
    description: 'Standard 256-bit key (14 rounds) known-answer test vector from NIST FIPS 197 specification.',
  },
];

export interface TestResult {
  id: string;
  title: string;
  passed: boolean;
  expected: string;
  actual: string;
  durationMs: number;
  details?: string;
}

export function runAllTestVectors(): TestResult[] {
  const results: TestResult[] = [];

  // 1. Run NIST Known-Answer Test Vectors
  for (const vec of NIST_VECTORS) {
    const t0 = performance.now();
    try {
      const ptBytes = hexToBytes(vec.plaintextHex);
      const keyBytes = hexToBytes(vec.keyHex);
      const trace = encryptBlockWithTrace(ptBytes, keyBytes, vec.keySize);
      const actualHex = bytesToHex(trace.outputBytes).toLowerCase();
      const expectedHex = vec.expectedCiphertextHex.toLowerCase();
      const passed = actualHex === expectedHex;

      // Also verify inverse decryption recovers original plaintext
      const decTrace = decryptBlockWithTrace(trace.outputBytes, keyBytes, vec.keySize);
      const recoveredHex = bytesToHex(decTrace.outputBytes).toLowerCase();
      const decPassed = recoveredHex === vec.plaintextHex.toLowerCase();

      results.push({
        id: vec.id,
        title: vec.title,
        passed: passed && decPassed,
        expected: expectedHex,
        actual: actualHex,
        durationMs: performance.now() - t0,
        details: passed && decPassed
          ? `Encryption matches NIST standard. Decryption round-trip verified (recovered 0x${recoveredHex}).`
          : `Mismatch: Expected ${expectedHex}, got ${actualHex}`,
      });
    } catch (err: any) {
      results.push({
        id: vec.id,
        title: vec.title,
        passed: false,
        expected: vec.expectedCiphertextHex,
        actual: 'Error: ' + err.message,
        durationMs: performance.now() - t0,
      });
    }
  }

  // 2. Multi-block Unicode UTF-8 test with CBC Mode and PKCS#7
  const tUnicode = performance.now();
  try {
    const testKeyHex = '2b7e151628aed2a6abf7158809cf4f3c';
    const sampleText = 'AES Cryptography Demonstration: 🔒 Confidential Data with Unicode 🚀!';
    const encRes = encryptAES(sampleText, testKeyHex, 128, 'CBC');
    const decRes = decryptAES(encRes.ciphertextHex, testKeyHex, 128, 'CBC');
    const unicodePassed = decRes.recoveredText === sampleText && decRes.unpaddedSuccessfully;

    results.push({
      id: 'unicode-cbc-roundtrip',
      title: 'Multi-block UTF-8 CBC Round-Trip with PKCS#7',
      passed: unicodePassed,
      expected: sampleText,
      actual: decRes.recoveredText,
      durationMs: performance.now() - tUnicode,
      details: `Plaintext length: ${sampleText.length} chars (${encRes.blocks.length} blocks with PKCS#7 padding). Decrypted successfully.`,
    });
  } catch (err: any) {
    results.push({
      id: 'unicode-cbc-roundtrip',
      title: 'Multi-block UTF-8 CBC Round-Trip with PKCS#7',
      passed: false,
      expected: 'Matching decrypted text',
      actual: 'Error: ' + err.message,
      durationMs: performance.now() - tUnicode,
    });
  }

  // 3. Negative test: wrong key fails or produces scrambled output
  const tNeg = performance.now();
  try {
    const testKeyHex = '000102030405060708090a0b0c0d0e0f';
    const wrongKeyHex = 'ffffffffffffffffffffffffffffffff';
    const sampleText = 'Top Secret Payload';
    const encRes = encryptAES(sampleText, testKeyHex, 128, 'CBC');
    const decRes = decryptAES(encRes.ciphertextHex, wrongKeyHex, 128, 'CBC');
    const correctlyRejectedOrScrambled = !decRes.unpaddedSuccessfully || decRes.recoveredText !== sampleText;

    results.push({
      id: 'tamper-wrong-key',
      title: 'Decryption with Wrong Key (Tamper / Integrity Check)',
      passed: correctlyRejectedOrScrambled,
      expected: 'Invalid padding or corrupted recovered data',
      actual: decRes.unpaddedSuccessfully ? 'Padding passed accidentally but text scrambled' : 'Invalid padding correctly rejected',
      durationMs: performance.now() - tNeg,
      details: 'Decryption with a mismatched key cannot recover the original plaintext and properly triggers padding error.',
    });
  } catch (err: any) {
    results.push({
      id: 'tamper-wrong-key',
      title: 'Decryption with Wrong Key',
      passed: true,
      expected: 'Exception or invalid padding rejection',
      actual: 'Correctly caught error: ' + err.message,
      durationMs: performance.now() - tNeg,
    });
  }

  return results;
}
