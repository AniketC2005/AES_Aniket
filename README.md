# AES LAB – Advanced Encryption Standard Simulator

**AES LAB** is a professional-grade, interactive educational web application and cryptography laboratory built with React, TypeScript, and Tailwind CSS. It visualizes and simulates the inner mathematical workings of the Advanced Encryption Standard (AES, NIST FIPS 197) for AES-128, AES-192, and AES-256.

---

## 🌟 Key Features

1. **Dashboard**
   - High-level AES pipeline diagram: `Plaintext → Initial AddRoundKey → Standard Rounds → Final Round → Ciphertext`.
   - Side-by-side comparison of AES-128 (10 rounds), AES-192 (12 rounds), and AES-256 (14 rounds).
   - Quick launch buttons and cryptographic security parameters.

2. **Interactive Encryption Simulator**
   - Plaintext input with live toggle between UTF-8 text and Hexadecimal bytes.
   - Key generation (Cryptographically Secure Random Key generator or custom hex).
   - Key size selection: 128-bit, 192-bit, 256-bit.
   - Modes of Operation: CBC (with random 16-byte IV) and ECB (single-block educational demonstration with prominent security warnings).
   - PKCS#7 block padding breakdown.
   - Ciphertext output in Hexadecimal (with byte grouping) and Base64 with copy-to-clipboard buttons.
   - Seamless *"Inspect in Round Simulator"* button to send the exact block and key directly into the Round Visualizer.

3. **AES Round-by-Round Visualizer (Core Laboratory)**
   - 4×4 byte State Matrix visualization arranged in standard column-major order (`State[r,c] = Byte[r + 4*c]`).
   - Step-by-step playback: First Step, Previous, Play Animation, Pause, Next, Last Step, Reset.
   - Adjustable animation playback speed (0.5x, 1x, 1.5x, 2x) and keyboard navigation (`ArrowLeft`, `ArrowRight`, `Space`).
   - Round selector pills to jump directly to any round (Round 0 through Round 10 / 12 / 14).
   - Side-by-side comparison of **State Before** and **State After**, with changed cells highlighted in accent colors.
   - Dedicated transformation cards explaining:
     - `SubBytes` (S-box non-linear substitution over GF(2⁸))
     - `ShiftRows` (Cyclic row permutations)
     - `MixColumns` (MDS matrix multiplication in GF(2⁸) modulo $x^4 + 1$)
     - `AddRoundKey` (Bitwise XOR with round key, plus active round key matrix display)
   - Supports both forward Encryption rounds and inverse Decryption rounds.

4. **Decryption Simulator**
   - Hexadecimal or Base64 ciphertext input.
   - Inverse AES transformations: `InvShiftRows`, `InvSubBytes`, and `InvMixColumns`.
   - PKCS#7 padding validation and clean unpadding back to original UTF-8 string.
   - One-click loading of official NIST known-answer test vectors.

5. **Key Expansion Explorer**
   - Complete visualization of the Rijndael key schedule for 128, 192, and 256-bit keys.
   - Words table from $w[0]$ through $w[4*(N_r+1)-1]$ (44, 52, or 60 words).
   - Interactive Word Inspector: click any word to inspect its step-by-step derivation:
     - `RotWord` (cyclic 1-byte left rotation)
     - `SubWord` (S-box byte substitution)
     - `Rcon` values ($Rcon[i/N_k]$ XOR)
     - Bitwise XOR with $w[i - N_k]$
     - AES-256 specific rule ($i \pmod 8 = 4$)
   - Grid view of all $N_r + 1$ $4 \times 4$ Round Key matrices.

6. **AES Theory & Mathematics**
   - Undergraduate Computer Science curriculum guide on cryptography, symmetric ciphers, Shannon's confusion and diffusion.
   - Galois Field arithmetic in $\text{GF}(2^8)$ modulo $m(x) = x^8 + x^4 + x^3 + x + 1$ (`0x11B`).
   - Explanations of cipher modes (ECB vs CBC vs GCM) and real-world applications (HTTPS/TLS 1.3, WPA3, BitLocker, ARMv8/AES-NI).

7. **NIST FIPS 197 Verification Suite**
   - In-browser interactive test runner executing official NIST FIPS 197 known-answer test vectors:
     - **AES-128:** Key `000102030405060708090a0b0c0d0e0f`, Plaintext `00112233445566778899aabbccddeeff` $\rightarrow$ Ciphertext `69c4e0d86a7b0430d8cdb78070b4c55a`
     - **AES-192:** Key `000102030405060708090a0b0c0d0e0f1011121314151617`, Plaintext `00112233445566778899aabbccddeeff` $\rightarrow$ Ciphertext `dda97ca4864cdfe06eaf70a0ec0d7191`
     - **AES-256:** Key `000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f`, Plaintext `00112233445566778899aabbccddeeff` $\rightarrow$ Ciphertext `8ea2b7ca516745bfeafc49904b496089`
   - Multi-block CBC round-trip integrity test and negative wrong-key tamper test.

---

## 🛠️ Technology Stack

- **Frontend:** React 19, TypeScript
- **Styling:** Tailwind CSS v4, Lucide React icons
- **Build Tool:** Vite 6
- **Test Runner:** Vitest
- **Execution Environment:** 100% Client-side browser execution (privacy-preserving, no data leaves your browser)

---

## 🚀 How to Run Locally

### 1. Prerequisites
- Node.js (v18.0.0 or higher) and npm.

### 2. Install Dependencies
```bash
npm install
```

### 3. Start Development Server
```bash
npm run dev
```
Open your browser and navigate to the displayed local URL (typically `http://localhost:5173`).

### 4. Run Automated Test Suite
To execute the automated cryptographic test suite verifying all NIST test vectors and edge cases:
```bash
npm test
```

### 5. Build for Production
```bash
npm run build
```
The optimized static production files will be generated in the `dist/` directory.

---

## 📋 Standards Compliance

- **NIST FIPS 197:** Advanced Encryption Standard (AES)
- **RFC 5652:** Cryptographic Message Syntax (PKCS#7 Padding)
- **RFC 3602:** The AES-CBC Cipher Algorithm
- **NIST SP 800-38A:** Recommendation for Block Cipher Modes of Operation
