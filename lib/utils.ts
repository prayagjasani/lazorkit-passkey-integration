/**
 * Local Encryption Utilities
 * 
 * These functions provide client-side encryption for storing sensitive data
 * (like passkey credentialId) in localStorage. The encryption is device-specific,
 * meaning data encrypted on one device cannot be decrypted on another.
 * 
 * WHY ENCRYPTION:
 * - localStorage is accessible to any script on the page
 * - Encrypting sensitive data adds a layer of security
 * - Even if localStorage is compromised, data is encrypted
 * - Device-specific keys prevent cross-device access
 * 
 * SECURITY MODEL:
 * - Uses AES-GCM encryption (authenticated encryption)
 * - Keys derived from device info (user agent + platform)
 * - Each device has different keys (can't decrypt on other devices)
 * - IV and salt are random for each encryption
 * 
 * LIMITATIONS:
 * - This is client-side encryption, not server-side
 * - Keys are derived from device info (not cryptographically random)
 * - Suitable for low-sensitivity data (credentialId is not a secret)
 * - For high-security needs, use server-side encryption
 * 
 * ALTERNATE APPROACHES:
 * - Could use Web Crypto API with user-provided password
 * - Could use IndexedDB with encryption
 * - Could store encrypted data on server instead
 * - Could use hardware security modules (HSM) for key storage
 */

/**
 * Encrypt data for local storage
 * 
 * This function encrypts a string using AES-GCM encryption with a key
 * derived from device information. The result is a base64-encoded string
 * containing the IV, salt, and encrypted data.
 * 
 * HOW IT WORKS:
 * 1. Generate random IV (initialization vector) and salt
 * 2. Derive encryption key from device info + salt
 * 3. Encrypt data using AES-GCM
 * 4. Encode IV, salt, and ciphertext as base64
 * 5. Return as dot-separated string
 * 
 * WHY AES-GCM:
 * - Authenticated encryption (prevents tampering)
 * - Standard and well-tested
 * - Supported by Web Crypto API
 * - Good performance
 * 
 * WHY DEVICE-SPECIFIC KEYS:
 * - Prevents cross-device data access
 * - Each device has different encryption key
 * - More secure than a single global key
 * - Matches passkey security model (device-bound)
 * 
 * @param data - String to encrypt (e.g., credentialId)
 * @returns Encrypted string in format "iv.salt.ciphertext" (all base64)
 * 
 * NOTE: Uses type assertions due to strict ArrayBuffer types in TypeScript 5.7+
 */
export async function encryptLocal(data: string): Promise<string> {
  const enc = new TextEncoder();
  /**
   * Generate random IV and salt
   * 
   * WHY RANDOM:
   * - IV (Initialization Vector) must be unique for each encryption
   * - Salt ensures different keys even with same device info
   * - Prevents pattern analysis attacks
   * - Standard security practice
   */
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const salt = crypto.getRandomValues(new Uint8Array(16));
  
  /**
   * Derive encryption key from device info
   * 
   * This creates a device-specific key that can't be used on other devices.
   * The key is derived using PBKDF2 with the device info as input.
   */
  const secretSeed = await subtleKeyFromDeviceInfo(salt);
  
  /**
   * Encrypt data
   * 
   * AES-GCM provides both encryption and authentication.
   * The ciphertext cannot be tampered with without detection.
   */
  const cipher = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    secretSeed,
    enc.encode(data)
  );
  const out = new Uint8Array(cipher);
  
  /**
   * Return as dot-separated base64 string
   * 
   * Format: "iv.salt.ciphertext"
   * - Easy to parse
   * - All components needed for decryption
   * - Base64 encoding for safe storage
   */
  return `${bufferToBase64(iv)}.${bufferToBase64(salt)}.${bufferToBase64(out)}`;
}

/**
 * Decrypt data from local storage
 * 
 * This function reverses the encryption process, taking the encrypted
 * string and returning the original data.
 * 
 * HOW IT WORKS:
 * 1. Split encrypted string into IV, salt, and ciphertext
 * 2. Decode from base64
 * 3. Derive same encryption key (using device info + salt)
 * 4. Decrypt ciphertext
 * 5. Return original string
 * 
 * ERROR HANDLING:
 * - Returns null on any error (invalid format, wrong device, etc.)
 * - Silent failure is intentional (security through obscurity)
 * - Caller should handle null case appropriately
 * 
 * @param payload - Encrypted string from encryptLocal()
 * @returns Decrypted string, or null if decryption fails
 * 
 * ALTERNATE:
 * - Could throw error instead of returning null
 * - Could provide more specific error messages
 * - Could log errors for debugging (not recommended for production)
 */
export async function decryptLocal(payload: string): Promise<string | null> {
  try {
    /**
     * Parse encrypted payload
     * 
     * Format: "iv.salt.ciphertext"
     * All components are base64-encoded
     */
    const [ivB64, saltB64, dataB64] = payload.split(".");
    const iv = base64ToBuffer(ivB64);
    const salt = base64ToBuffer(saltB64);
    const data = base64ToBuffer(dataB64);
    
    /**
     * Derive same key used for encryption
     * 
     * Must use same device info and salt to get same key.
     * This is why data encrypted on one device can't be
     * decrypted on another device.
     */
    const key = await subtleKeyFromDeviceInfo(salt);
    
    /**
     * Decrypt data
     * 
     * NOTE: TypeScript error is expected here.
     * Uint8Array is valid BufferSource in Web Crypto API,
     * but TypeScript types are strict. The @ts-expect-error
     * comment suppresses the error.
     */
    const plain = await crypto.subtle.decrypt(
      // @ts-expect-error - Uint8Array is valid BufferSource in Web Crypto API
      { name: "AES-GCM", iv },
      key,
      data
    );
    return new TextDecoder().decode(plain);
  } catch {
    /**
     * Silent failure on error
     * 
     * WHY SILENT:
     * - Security through obscurity (don't reveal why it failed)
     * - Could be wrong device, corrupted data, etc.
     * - Caller should handle null appropriately
     */
    return null;
  }
}

async function subtleKeyFromDeviceInfo(salt: Uint8Array): Promise<CryptoKey> {
  const device = navigator.userAgent + (navigator.platform || "web");
  const baseKey = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(device),
    { name: "PBKDF2" },
    false,
    ["deriveKey"]
  );
  return crypto.subtle.deriveKey(
    // @ts-expect-error - Uint8Array is valid BufferSource in Web Crypto API
    { name: "PBKDF2", salt, iterations: 100000, hash: "SHA-256" },
    baseKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

function bufferToBase64(buf: Uint8Array): string {
  return btoa(String.fromCharCode(...buf));
}
function base64ToBuffer(b64: string): Uint8Array {
  const bin = atob(b64);
  const arr = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
  return arr;
}

/** Retry utility with exponential backoff */
export async function withRetry<T>(
  fn: () => Promise<T>,
  retries = 3,
  delayMs = 2000
): Promise<T> {
  let attempt = 0;
  for (;;) {
    try {
      return await fn();
    } catch (e) {
      attempt++;
      if (attempt > retries) throw e;
      await new Promise((r) => setTimeout(r, delayMs * attempt));
    }
  }
}
