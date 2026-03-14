// ==========================================
// SecureVault — Utilidades de Encriptación
// Usa Web Crypto API: PBKDF2 + AES-256-GCM
// ==========================================

const PBKDF2_ITERATIONS = 100_000;
const SALT_LENGTH = 16;   // bytes
const IV_LENGTH = 12;     // bytes para AES-GCM
const KEY_LENGTH = 256;   // bits

/** Convierte ArrayBuffer a string base64 */
function bufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/** Convierte string base64 a ArrayBuffer */
function base64ToBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

/** Genera un salt aleatorio */
export function generateSalt(): string {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
  return bufferToBase64(salt.buffer);
}

/** Genera un IV (vector de inicialización) aleatorio */
function generateIV(): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(IV_LENGTH));
}

/**
 * Deriva una clave criptográfica a partir de la contraseña maestra
 * usando PBKDF2 con SHA-256
 */
async function deriveKey(masterPassword: string, salt: string): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(masterPassword),
    'PBKDF2',
    false,
    ['deriveKey']
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: base64ToBuffer(salt),
      iterations: PBKDF2_ITERATIONS,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: KEY_LENGTH },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Genera un hash de la contraseña maestra para verificación
 * (no se usa para encriptar, solo para validar login)
 */
export async function hashMasterPassword(password: string, salt: string): Promise<string> {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveBits']
  );

  const bits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: base64ToBuffer(salt),
      iterations: PBKDF2_ITERATIONS,
      hash: 'SHA-256',
    },
    keyMaterial,
    256
  );

  return bufferToBase64(bits);
}

/**
 * Encripta un texto plano con AES-256-GCM
 * Retorna { encrypted: base64, iv: base64 }
 */
export async function encrypt(
  plaintext: string,
  masterPassword: string,
  salt: string
): Promise<{ encrypted: string; iv: string }> {
  const key = await deriveKey(masterPassword, salt);
  const iv = generateIV();
  const encoder = new TextEncoder();

  const ciphertext = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    encoder.encode(plaintext)
  );

  return {
    encrypted: bufferToBase64(ciphertext),
    iv: bufferToBase64(iv.buffer),
  };
}

/**
 * Desencripta un texto cifrado con AES-256-GCM
 * Retorna el texto plano
 */
export async function decrypt(
  encryptedBase64: string,
  ivBase64: string,
  masterPassword: string,
  salt: string
): Promise<string> {
  const key = await deriveKey(masterPassword, salt);
  const iv = base64ToBuffer(ivBase64);
  const ciphertext = base64ToBuffer(encryptedBase64);

  const plaintext = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    key,
    ciphertext
  );

  const decoder = new TextDecoder();
  return decoder.decode(plaintext);
}

/**
 * Exporta todas las entradas como un blob binario encriptado (.kdbx)
 * El formato es: [salt(16)] + [iv(12)] + [AES-GCM encrypted JSON]
 */
export async function exportToKdbx(
  data: object,
  masterPassword: string
): Promise<Blob> {
  const salt = generateSalt();
  const json = JSON.stringify(data);
  const { encrypted, iv } = await encrypt(json, masterPassword, salt);

  // Construir blob binario: salt + iv + datos encriptados
  const saltBuffer = base64ToBuffer(salt);
  const ivBuffer = base64ToBuffer(iv);
  const dataBuffer = base64ToBuffer(encrypted);

  const combined = new Uint8Array(
    saltBuffer.byteLength + ivBuffer.byteLength + dataBuffer.byteLength
  );
  combined.set(new Uint8Array(saltBuffer), 0);
  combined.set(new Uint8Array(ivBuffer), saltBuffer.byteLength);
  combined.set(new Uint8Array(dataBuffer), saltBuffer.byteLength + ivBuffer.byteLength);

  return new Blob([combined], { type: 'application/octet-stream' });
}

/**
 * Importa datos desde un blob binario encriptado (.kdbx)
 */
export async function importFromKdbx<T>(
  blob: Blob,
  masterPassword: string
): Promise<T> {
  const buffer = await blob.arrayBuffer();
  const bytes = new Uint8Array(buffer);

  // Extraer salt, iv y datos
  const saltBuffer = bytes.slice(0, SALT_LENGTH).buffer;
  const ivBuffer = bytes.slice(SALT_LENGTH, SALT_LENGTH + IV_LENGTH).buffer;
  const dataBuffer = bytes.slice(SALT_LENGTH + IV_LENGTH).buffer;

  const salt = bufferToBase64(saltBuffer);
  const iv = bufferToBase64(ivBuffer);
  const encrypted = bufferToBase64(dataBuffer);

  const json = await decrypt(encrypted, iv, masterPassword, salt);
  return JSON.parse(json) as T;
}
