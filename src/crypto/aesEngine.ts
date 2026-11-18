import { AES_SPECS } from './aesConstants';
import { subBytes, shiftRows, mixColumns, addRoundKey, invShiftRows, invSubBytes, invMixColumns } from './aesCore';
import { expandKey } from './keyExpansion';
import {
  bytesToHex,
  hexToBytes,
  bytesToState,
  stateToBytes,
  cloneState,
  compareStates,
  applyPkcs7Padding,
  removePkcs7Padding,
  bytesToBase64,
  base64ToBytes,
  bytesToString,
  stringToBytes,
  generateRandomHex,
} from './utils';
import {
  KeySize,
  CipherMode,
  StateStep,
  BlockTrace,
  EncryptionResult,
  DecryptionResult,
} from '../types/aes';

// Encrypt a single 16-byte block with complete state step tracing
export function encryptBlockWithTrace(
  inputBytes: number[],
  keyBytes: number[],
  keySize: KeySize = 128
): BlockTrace {
  const specs = AES_SPECS[keySize];
  const { nr } = specs;
  const expansion = expandKey(keyBytes, keySize);
  const steps: StateStep[] = [];

  let stepIdx = 0;
  let currentState = bytesToState(inputBytes);

  // Initial Plaintext State
  steps.push({
    round: 0,
    stepIndex: stepIdx++,
    transformation: 'INPUT',
    name: 'Initial State Matrix',
    description: 'Plaintext block (16 bytes) loaded into 4×4 State Matrix in column-major order.',
    matrixBefore: cloneState(currentState),
    matrixAfter: cloneState(currentState),
    changedCells: [
      [true, true, true, true],
      [true, true, true, true],
      [true, true, true, true],
      [true, true, true, true],
    ],
  });

  // Initial AddRoundKey (Round 0)
  const roundKey0 = expansion.roundKeys[0];
  const stateAfterInitKey = addRoundKey(currentState, roundKey0);
  steps.push({
    round: 0,
    stepIndex: stepIdx++,
    transformation: 'ADD_ROUND_KEY_INITIAL',
    name: 'Initial AddRoundKey',
    description: 'XOR the initial State Matrix bitwise with Round Key 0 (the original key).',
    matrixBefore: cloneState(currentState),
    matrixAfter: cloneState(stateAfterInitKey),
    roundKey: cloneState(roundKey0),
    changedCells: compareStates(currentState, stateAfterInitKey),
  });
  currentState = stateAfterInitKey;

  // Rounds 1 through Nr - 1
  for (let r = 1; r < nr; r++) {
    // 1. SubBytes
    const stateAfterSubBytes = subBytes(currentState);
    steps.push({
      round: r,
      stepIndex: stepIdx++,
      transformation: 'SUB_BYTES',
      name: `Round ${r}: SubBytes`,
      description: 'Non-linear byte substitution using the AES S-box lookup table.',
      matrixBefore: cloneState(currentState),
      matrixAfter: cloneState(stateAfterSubBytes),
      changedCells: compareStates(currentState, stateAfterSubBytes),
    });
    currentState = stateAfterSubBytes;

    // 2. ShiftRows
    const stateAfterShiftRows = shiftRows(currentState);
    steps.push({
      round: r,
      stepIndex: stepIdx++,
      transformation: 'SHIFT_ROWS',
      name: `Round ${r}: ShiftRows`,
      description: 'Row 0 is unchanged. Row 1 shifts left by 1, Row 2 by 2, Row 3 by 3 bytes.',
      matrixBefore: cloneState(currentState),
      matrixAfter: cloneState(stateAfterShiftRows),
      changedCells: compareStates(currentState, stateAfterShiftRows),
    });
    currentState = stateAfterShiftRows;

    // 3. MixColumns
    const stateAfterMixColumns = mixColumns(currentState);
    steps.push({
      round: r,
      stepIndex: stepIdx++,
      transformation: 'MIX_COLUMNS',
      name: `Round ${r}: MixColumns`,
      description: 'Linear column diffusion multiplying each column vector over Galois Field GF(2^8).',
      matrixBefore: cloneState(currentState),
      matrixAfter: cloneState(stateAfterMixColumns),
      changedCells: compareStates(currentState, stateAfterMixColumns),
    });
    currentState = stateAfterMixColumns;

    // 4. AddRoundKey
    const roundKeyR = expansion.roundKeys[r];
    const stateAfterAddRoundKey = addRoundKey(currentState, roundKeyR);
    steps.push({
      round: r,
      stepIndex: stepIdx++,
      transformation: 'ADD_ROUND_KEY',
      name: `Round ${r}: AddRoundKey`,
      description: `XOR state matrix with expanded Round Key ${r}.`,
      matrixBefore: cloneState(currentState),
      matrixAfter: cloneState(stateAfterAddRoundKey),
      roundKey: cloneState(roundKeyR),
      changedCells: compareStates(currentState, stateAfterAddRoundKey),
    });
    currentState = stateAfterAddRoundKey;
  }

  // Final Round (Round Nr) - No MixColumns!
  // 1. SubBytes
  const finalSubBytes = subBytes(currentState);
  steps.push({
    round: nr,
    stepIndex: stepIdx++,
    transformation: 'SUB_BYTES',
    name: `Final Round ${nr}: SubBytes`,
    description: 'Final S-box non-linear substitution.',
    matrixBefore: cloneState(currentState),
    matrixAfter: cloneState(finalSubBytes),
    changedCells: compareStates(currentState, finalSubBytes),
  });
  currentState = finalSubBytes;

  // 2. ShiftRows
  const finalShiftRows = shiftRows(currentState);
  steps.push({
    round: nr,
    stepIndex: stepIdx++,
    transformation: 'SHIFT_ROWS',
    name: `Final Round ${nr}: ShiftRows`,
    description: 'Final row transposition.',
    matrixBefore: cloneState(currentState),
    matrixAfter: cloneState(finalShiftRows),
    changedCells: compareStates(currentState, finalShiftRows),
  });
  currentState = finalShiftRows;

  // 3. Final AddRoundKey
  const finalRoundKey = expansion.roundKeys[nr];
  const finalState = addRoundKey(currentState, finalRoundKey);
  steps.push({
    round: nr,
    stepIndex: stepIdx++,
    transformation: 'ADD_ROUND_KEY',
    name: `Final Round ${nr}: AddRoundKey`,
    description: `Final key injection with Round Key ${nr} (MixColumns is omitted in final round).`,
    matrixBefore: cloneState(currentState),
    matrixAfter: cloneState(finalState),
    roundKey: cloneState(finalRoundKey),
    changedCells: compareStates(currentState, finalState),
  });
  currentState = finalState;

  const outputBytes = stateToBytes(currentState);
  return {
    blockIndex: 0,
    inputBytes,
    outputBytes,
    isDecryption: false,
    keySize,
    roundsCount: nr,
    steps,
  };
}

// Decrypt a single 16-byte block with complete inverse state step tracing
export function decryptBlockWithTrace(
  inputBytes: number[],
  keyBytes: number[],
  keySize: KeySize = 128
): BlockTrace {
  const specs = AES_SPECS[keySize];
  const { nr } = specs;
  const expansion = expandKey(keyBytes, keySize);
  const steps: StateStep[] = [];

  let stepIdx = 0;
  let currentState = bytesToState(inputBytes);

  // Initial Ciphertext State
  steps.push({
    round: 0,
    stepIndex: stepIdx++,
    transformation: 'INPUT',
    name: 'Initial Ciphertext State Matrix',
    description: 'Ciphertext block (16 bytes) loaded into 4×4 State Matrix in column-major order.',
    matrixBefore: cloneState(currentState),
    matrixAfter: cloneState(currentState),
    changedCells: [
      [true, true, true, true],
      [true, true, true, true],
      [true, true, true, true],
      [true, true, true, true],
    ],
  });

  // Initial AddRoundKey (with final Round Key Nr)
  const initRoundKey = expansion.roundKeys[nr];
  const stateAfterInitKey = addRoundKey(currentState, initRoundKey);
  steps.push({
    round: 0,
    stepIndex: stepIdx++,
    transformation: 'ADD_ROUND_KEY_INITIAL',
    name: 'Initial Decryption AddRoundKey',
    description: `XOR ciphertext state with Round Key ${nr} (reversing the final encryption addition).`,
    matrixBefore: cloneState(currentState),
    matrixAfter: cloneState(stateAfterInitKey),
    roundKey: cloneState(initRoundKey),
    changedCells: compareStates(currentState, stateAfterInitKey),
  });
  currentState = stateAfterInitKey;

  // Standard Decryption Rounds (Round 1 to Nr - 1)
  for (let r = 1; r < nr; r++) {
    // 1. InvShiftRows
    const stateAfterInvShift = invShiftRows(currentState);
    steps.push({
      round: r,
      stepIndex: stepIdx++,
      transformation: 'INV_SHIFT_ROWS',
      name: `Decryption Round ${r}: InvShiftRows`,
      description: 'Cyclically shift rows right to reverse ShiftRows.',
      matrixBefore: cloneState(currentState),
      matrixAfter: cloneState(stateAfterInvShift),
      changedCells: compareStates(currentState, stateAfterInvShift),
    });
    currentState = stateAfterInvShift;

    // 2. InvSubBytes
    const stateAfterInvSub = invSubBytes(currentState);
    steps.push({
      round: r,
      stepIndex: stepIdx++,
      transformation: 'INV_SUB_BYTES',
      name: `Decryption Round ${r}: InvSubBytes`,
      description: 'Inverse S-box substitution to restore pre-substitution bytes.',
      matrixBefore: cloneState(currentState),
      matrixAfter: cloneState(stateAfterInvSub),
      changedCells: compareStates(currentState, stateAfterInvSub),
    });
    currentState = stateAfterInvSub;

    // 3. AddRoundKey with Key (Nr - r)
    const roundKeyR = expansion.roundKeys[nr - r];
    const stateAfterAddKey = addRoundKey(currentState, roundKeyR);
    steps.push({
      round: r,
      stepIndex: stepIdx++,
      transformation: 'ADD_ROUND_KEY',
      name: `Decryption Round ${r}: AddRoundKey`,
      description: `XOR state with Round Key ${nr - r}.`,
      matrixBefore: cloneState(currentState),
      matrixAfter: cloneState(stateAfterAddKey),
      roundKey: cloneState(roundKeyR),
      changedCells: compareStates(currentState, stateAfterAddKey),
    });
    currentState = stateAfterAddKey;

    // 4. InvMixColumns
    const stateAfterInvMix = invMixColumns(currentState);
    steps.push({
      round: r,
      stepIndex: stepIdx++,
      transformation: 'INV_MIX_COLUMNS',
      name: `Decryption Round ${r}: InvMixColumns`,
      description: 'Inverse column matrix multiplication in GF(2^8) restoring original column states.',
      matrixBefore: cloneState(currentState),
      matrixAfter: cloneState(stateAfterInvMix),
      changedCells: compareStates(currentState, stateAfterInvMix),
    });
    currentState = stateAfterInvMix;
  }

  // Final Decryption Round (Round Nr) - No InvMixColumns
  // 1. InvShiftRows
  const finalInvShift = invShiftRows(currentState);
  steps.push({
    round: nr,
    stepIndex: stepIdx++,
    transformation: 'INV_SHIFT_ROWS',
    name: `Final Decryption Round ${nr}: InvShiftRows`,
    description: 'Final cyclical right row shifts.',
    matrixBefore: cloneState(currentState),
    matrixAfter: cloneState(finalInvShift),
    changedCells: compareStates(currentState, finalInvShift),
  });
  currentState = finalInvShift;

  // 2. InvSubBytes
  const finalInvSub = invSubBytes(currentState);
  steps.push({
    round: nr,
    stepIndex: stepIdx++,
    transformation: 'INV_SUB_BYTES',
    name: `Final Decryption Round ${nr}: InvSubBytes`,
    description: 'Final Inverse S-box substitution.',
    matrixBefore: cloneState(currentState),
    matrixAfter: cloneState(finalInvSub),
    changedCells: compareStates(currentState, finalInvSub),
  });
  currentState = finalInvSub;

  // 3. Final AddRoundKey with Key 0
  const finalRoundKey0 = expansion.roundKeys[0];
  const finalState = addRoundKey(currentState, finalRoundKey0);
  steps.push({
    round: nr,
    stepIndex: stepIdx++,
    transformation: 'ADD_ROUND_KEY',
    name: `Final Decryption Round ${nr}: AddRoundKey`,
    description: 'Final AddRoundKey with Key 0 (reversing initial encryption key addition).',
    matrixBefore: cloneState(currentState),
    matrixAfter: cloneState(finalState),
    roundKey: cloneState(finalRoundKey0),
    changedCells: compareStates(currentState, finalState),
  });
  currentState = finalState;

  const outputBytes = stateToBytes(currentState);
  return {
    blockIndex: 0,
    inputBytes,
    outputBytes,
    isDecryption: true,
    keySize,
    roundsCount: nr,
    steps,
  };
}

// Fast block encryption without trace (for multi-block loops)
export function encryptBlockRaw(
  inputBytes: number[],
  roundKeys: number[][][],
  nr: number
): number[] {
  let state = bytesToState(inputBytes);
  state = addRoundKey(state, roundKeys[0]);

  for (let r = 1; r < nr; r++) {
    state = subBytes(state);
    state = shiftRows(state);
    state = mixColumns(state);
    state = addRoundKey(state, roundKeys[r]);
  }

  state = subBytes(state);
  state = shiftRows(state);
  state = addRoundKey(state, roundKeys[nr]);

  return stateToBytes(state);
}

// Fast block decryption without trace
export function decryptBlockRaw(
  inputBytes: number[],
  roundKeys: number[][][],
  nr: number
): number[] {
  let state = bytesToState(inputBytes);
  state = addRoundKey(state, roundKeys[nr]);

  for (let r = 1; r < nr; r++) {
    state = invShiftRows(state);
    state = invSubBytes(state);
    state = addRoundKey(state, roundKeys[nr - r]);
    state = invMixColumns(state);
  }

  state = invShiftRows(state);
  state = invSubBytes(state);
  state = addRoundKey(state, roundKeys[0]);

  return stateToBytes(state);
}

// High-level multi-block encryption
export function encryptAES(
  plaintext: string | number[],
  keyInput: string | number[],
  keySize: KeySize = 128,
  mode: CipherMode = 'CBC',
  customIvHex?: string
): EncryptionResult {
  const plainBytes = typeof plaintext === 'string' ? stringToBytes(plaintext) : plaintext;
  const keyBytes = typeof keyInput === 'string' ? hexToBytes(keyInput) : keyInput;

  const specs = AES_SPECS[keySize];
  if (keyBytes.length !== specs.keyBytes) {
    throw new Error(`Key must be exactly ${specs.keyBytes} bytes (${specs.keyBytes * 2} hex characters).`);
  }

  const expansion = expandKey(keyBytes, keySize);
  const { nr } = specs;

  // PKCS#7 padding
  const { padded, paddingBytesCount } = applyPkcs7Padding(plainBytes);

  let ivBytes: number[] = [];
  if (mode === 'CBC') {
    ivBytes = customIvHex ? hexToBytes(customIvHex) : hexToBytes(generateRandomHex(16));
  }

  const ciphertextBytes: number[] = [];
  const blocks: { index: number; inputHex: string; outputHex: string }[] = [];
  let detailedTrace: BlockTrace | null = null;

  const numBlocks = padded.length / 16;
  let previousCipherBlock = [...ivBytes];

  for (let i = 0; i < numBlocks; i++) {
    const rawBlock = padded.slice(i * 16, (i + 1) * 16);
    let blockToEncrypt = [...rawBlock];

    if (mode === 'CBC') {
      blockToEncrypt = blockToEncrypt.map((b, idx) => b ^ previousCipherBlock[idx]);
    }

    let encryptedBlock: number[];
    if (i === 0) {
      detailedTrace = encryptBlockWithTrace(blockToEncrypt, keyBytes, keySize);
      encryptedBlock = detailedTrace.outputBytes;
    } else {
      encryptedBlock = encryptBlockRaw(blockToEncrypt, expansion.roundKeys, nr);
    }

    if (mode === 'CBC') {
      previousCipherBlock = [...encryptedBlock];
    }

    ciphertextBytes.push(...encryptedBlock);
    blocks.push({
      index: i,
      inputHex: bytesToHex(rawBlock),
      outputHex: bytesToHex(encryptedBlock),
    });
  }

  // Prepend IV for CBC if applicable
  const fullCiphertext = mode === 'CBC' ? [...ivBytes, ...ciphertextBytes] : ciphertextBytes;

  return {
    mode,
    keySize,
    keyHex: bytesToHex(keyBytes),
    ivHex: mode === 'CBC' ? bytesToHex(ivBytes) : undefined,
    plaintextHex: bytesToHex(plainBytes),
    plaintextContent: typeof plaintext === 'string' ? plaintext : bytesToString(plainBytes),
    paddedHex: bytesToHex(padded),
    paddingBytesCount,
    blocks,
    ciphertextHex: bytesToHex(fullCiphertext),
    ciphertextBase64: bytesToBase64(fullCiphertext),
    detailedTrace: detailedTrace!,
  };
}

// High-level multi-block decryption
export function decryptAES(
  ciphertextInput: string | number[],
  keyInput: string | number[],
  keySize: KeySize = 128,
  mode: CipherMode = 'CBC',
  isBase64: boolean = false
): DecryptionResult {
  let cipherBytes: number[];
  if (typeof ciphertextInput === 'string') {
    cipherBytes = isBase64 ? base64ToBytes(ciphertextInput) : hexToBytes(ciphertextInput);
  } else {
    cipherBytes = [...ciphertextInput];
  }

  const keyBytes = typeof keyInput === 'string' ? hexToBytes(keyInput) : keyInput;
  const specs = AES_SPECS[keySize];
  if (keyBytes.length !== specs.keyBytes) {
    throw new Error(`Key must be exactly ${specs.keyBytes} bytes (${specs.keyBytes * 2} hex characters).`);
  }

  const expansion = expandKey(keyBytes, keySize);
  const { nr } = specs;

  let ivBytes: number[] = [];
  let payloadBytes = [...cipherBytes];

  if (mode === 'CBC') {
    if (cipherBytes.length < 32 || cipherBytes.length % 16 !== 0) {
      throw new Error('Ciphertext in CBC mode must contain a 16-byte IV and at least one 16-byte block.');
    }
    ivBytes = cipherBytes.slice(0, 16);
    payloadBytes = cipherBytes.slice(16);
  } else {
    if (cipherBytes.length === 0 || cipherBytes.length % 16 !== 0) {
      throw new Error('Ciphertext must be a multiple of 16 bytes.');
    }
  }

  const decryptedPaddedBytes: number[] = [];
  const blocks: { index: number; inputHex: string; outputHex: string }[] = [];
  let detailedTrace: BlockTrace | null = null;

  const numBlocks = payloadBytes.length / 16;
  let prevCipherBlock = [...ivBytes];

  for (let i = 0; i < numBlocks; i++) {
    const rawCipherBlock = payloadBytes.slice(i * 16, (i + 1) * 16);
    let decryptedBlock: number[];

    if (i === 0) {
      detailedTrace = decryptBlockWithTrace(rawCipherBlock, keyBytes, keySize);
      decryptedBlock = detailedTrace.outputBytes;
    } else {
      decryptedBlock = decryptBlockRaw(rawCipherBlock, expansion.roundKeys, nr);
    }

    if (mode === 'CBC') {
      decryptedBlock = decryptedBlock.map((b, idx) => b ^ prevCipherBlock[idx]);
      prevCipherBlock = [...rawCipherBlock];
    }

    decryptedPaddedBytes.push(...decryptedBlock);
    blocks.push({
      index: i,
      inputHex: bytesToHex(rawCipherBlock),
      outputHex: bytesToHex(decryptedBlock),
    });
  }

  const { unpadded, valid } = removePkcs7Padding(decryptedPaddedBytes);
  const recoveredText = valid ? bytesToString(unpadded) : '(Invalid padding: could not decode)';

  return {
    mode,
    keySize,
    keyHex: bytesToHex(keyBytes),
    ivHex: mode === 'CBC' ? bytesToHex(ivBytes) : undefined,
    ciphertextHex: bytesToHex(cipherBytes),
    decryptedPaddedHex: bytesToHex(decryptedPaddedBytes),
    recoveredText,
    recoveredHex: valid ? bytesToHex(unpadded) : bytesToHex(decryptedPaddedBytes),
    unpaddedSuccessfully: valid,
    blocks,
    detailedTrace: detailedTrace!,
  };
}
