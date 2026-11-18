export type KeySize = 128 | 192 | 256;

export type CipherMode = 'ECB' | 'CBC' | 'CTR' | 'GCM';

export type TransformationType = 
  | 'INPUT' 
  | 'ADD_ROUND_KEY_INITIAL' 
  | 'SUB_BYTES' 
  | 'SHIFT_ROWS' 
  | 'MIX_COLUMNS' 
  | 'ADD_ROUND_KEY'
  | 'INV_SHIFT_ROWS'
  | 'INV_SUB_BYTES'
  | 'INV_MIX_COLUMNS'
  | 'OUTPUT';

export interface StateStep {
  round: number; // 0 = initial, 1..Nr = rounds
  stepIndex: number;
  transformation: TransformationType;
  name: string;
  description: string;
  matrixBefore: number[][]; // 4x4
  matrixAfter: number[][];  // 4x4
  roundKey?: number[][];     // 4x4 if AddRoundKey
  changedCells: boolean[][]; // 4x4 boolean
  details?: {
    sboxLookup?: { input: number; row: number; col: number; output: number };
    shiftDetails?: { row: number; shiftAmount: number };
    mixColumnMatrix?: number[][];
    formula?: string;
  };
}

export interface KeyExpansionWord {
  index: number;
  bytes: number[]; // 4 bytes
  hex: string;
  isRconStep: boolean;
  isSubWordOnlyStep?: boolean;
  tempBefore?: number[];
  rotWord?: number[];
  subWord?: number[];
  rcon?: number[];
  rconIndex?: number;
  xorSource1?: { index: number; bytes: number[] };
  xorSource2?: { label: string; bytes: number[] };
}

export interface KeyExpansionResult {
  keyBytes: number[];
  keySize: KeySize;
  words: KeyExpansionWord[];
  roundKeys: number[][][]; // array of Nr+1 round keys, each 4x4 matrix
}

export interface BlockTrace {
  blockIndex: number;
  inputBytes: number[];
  outputBytes: number[];
  isDecryption: boolean;
  keySize: KeySize;
  roundsCount: number;
  steps: StateStep[];
}

export interface EncryptionResult {
  mode: CipherMode;
  keySize: KeySize;
  keyHex: string;
  ivHex?: string;
  plaintextHex: string;
  plaintextContent: string;
  paddedHex: string;
  paddingBytesCount: number;
  blocks: {
    index: number;
    inputHex: string;
    outputHex: string;
  }[];
  ciphertextHex: string;
  ciphertextBase64: string;
  authTagHex?: string; // for GCM
  detailedTrace: BlockTrace; // detailed trace for visualizer (block 0 or user selected block)
}

export interface DecryptionResult {
  mode: CipherMode;
  keySize: KeySize;
  keyHex: string;
  ivHex?: string;
  ciphertextHex: string;
  decryptedPaddedHex: string;
  recoveredText: string;
  recoveredHex: string;
  unpaddedSuccessfully: boolean;
  authTagValid?: boolean;
  blocks: {
    index: number;
    inputHex: string;
    outputHex: string;
  }[];
  detailedTrace: BlockTrace; // detailed trace for visualizer (block 0)
}

export interface NISTTestVector {
  id: string;
  title: string;
  keySize: KeySize;
  keyHex: string;
  plaintextHex: string;
  expectedCiphertextHex: string;
  description: string;
}
