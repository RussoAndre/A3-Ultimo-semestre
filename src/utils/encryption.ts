/**
 * Client-side encryption utilities for sensitive data
 * Note: This is for additional client-side protection. Server-side encryption is primary.
 */

// Convert string to ArrayBuffer
const stringToArrayBuffer = (str: string): ArrayBuffer => {
  const encoder = new TextEncoder()
  return encoder.encode(str).buffer as ArrayBuffer
}

// Convert ArrayBuffer to string
const arrayBufferToString = (buffer: ArrayBuffer): string => {
  const decoder = new TextDecoder()
  return decoder.decode(buffer)
}

// Convert ArrayBuffer to base64
const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
  const bytes = new Uint8Array(buffer)
  let binary = ''
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary)
}

// Convert base64 to ArrayBuffer
const base64ToArrayBuffer = (base64: string): ArrayBuffer => {
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes.buffer
}

// Generate encryption key from password
export const deriveKey = async (
  password: string,
  salt: Uint8Array
): Promise<CryptoKey> => {
  const passwordBuffer = stringToArrayBuffer(password)

  // Import password as key material
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    passwordBuffer,
    'PBKDF2',
    false,
    ['deriveBits', 'deriveKey']
  )

  // Derive key using PBKDF2
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt.buffer as ArrayBuffer,
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  )
}

// Encrypt data
export const encryptData = async (data: string, password: string): Promise<string> => {
  try {
    // Generate random salt and IV
    const salt = crypto.getRandomValues(new Uint8Array(16))
    const iv = crypto.getRandomValues(new Uint8Array(12))

    // Derive key
    const key = await deriveKey(password, salt)

    // Encrypt data
    const dataBuffer = stringToArrayBuffer(data)
    const encryptedBuffer = await crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv: iv,
      },
      key,
      dataBuffer
    )

    // Combine salt, IV, and encrypted data
    const combined = new Uint8Array(salt.length + iv.length + encryptedBuffer.byteLength)
    combined.set(salt, 0)
    combined.set(iv, salt.length)
    combined.set(new Uint8Array(encryptedBuffer), salt.length + iv.length)

    // Return as base64
    return arrayBufferToBase64(combined.buffer)
  } catch (error) {
    console.error('Encryption error:', error)
    throw new Error('Failed to encrypt data')
  }
}

// Decrypt data
export const decryptData = async (encryptedData: string, password: string): Promise<string> => {
  try {
    // Convert from base64
    const combined = new Uint8Array(base64ToArrayBuffer(encryptedData))

    // Extract salt, IV, and encrypted data
    const salt = combined.slice(0, 16)
    const iv = combined.slice(16, 28)
    const encrypted = combined.slice(28)

    // Derive key
    const key = await deriveKey(password, salt)

    // Decrypt data
    const decryptedBuffer = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: iv,
      },
      key,
      encrypted
    )

    return arrayBufferToString(decryptedBuffer)
  } catch (error) {
    console.error('Decryption error:', error)
    throw new Error('Failed to decrypt data')
  }
}

// Hash data (one-way)
export const hashData = async (data: string): Promise<string> => {
  const dataBuffer = stringToArrayBuffer(data)
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer)
  return arrayBufferToBase64(hashBuffer)
}

// Secure storage wrapper with encryption
export class SecureStorage {
  private password: string

  constructor(password: string) {
    this.password = password
  }

  async setItem(key: string, value: string): Promise<void> {
    try {
      const encrypted = await encryptData(value, this.password)
      localStorage.setItem(key, encrypted)
    } catch (error) {
      console.error('Secure storage set error:', error)
      throw error
    }
  }

  async getItem(key: string): Promise<string | null> {
    try {
      const encrypted = localStorage.getItem(key)
      if (!encrypted) return null

      return await decryptData(encrypted, this.password)
    } catch (error) {
      console.error('Secure storage get error:', error)
      return null
    }
  }

  removeItem(key: string): void {
    localStorage.removeItem(key)
  }

  clear(): void {
    localStorage.clear()
  }
}
