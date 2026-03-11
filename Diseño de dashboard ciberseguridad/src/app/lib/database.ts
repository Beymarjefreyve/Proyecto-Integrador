// ==========================================
// SecureVault — Capa de Base de Datos (IndexedDB)
// ==========================================

import type { PasswordEntry, UserProfile } from '../types';
import { encrypt, decrypt, generateSalt } from './crypto';

const DB_NAME = 'SecureVaultDB';
const DB_VERSION = 1;
const STORE_PASSWORDS = 'passwords';
const STORE_USER = 'user';

/**
 * Abre (o crea) la base de datos IndexedDB
 */
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;

      // Store de contraseñas
      if (!db.objectStoreNames.contains(STORE_PASSWORDS)) {
        const store = db.createObjectStore(STORE_PASSWORDS, { keyPath: 'id' });
        store.createIndex('siteId', 'siteId', { unique: false });
        store.createIndex('siteName', 'siteName', { unique: false });
        store.createIndex('group', 'group', { unique: false });
      }

      // Store de usuario
      if (!db.objectStoreNames.contains(STORE_USER)) {
        db.createObjectStore(STORE_USER, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/** Helper para transacciones */
function withStore<T>(
  storeName: string,
  mode: IDBTransactionMode,
  callback: (store: IDBObjectStore) => IDBRequest<T>
): Promise<T> {
  return new Promise(async (resolve, reject) => {
    const db = await openDB();
    const tx = db.transaction(storeName, mode);
    const store = tx.objectStore(storeName);
    const request = callback(store);

    request.onsuccess = () => {
      resolve(request.result);
      db.close();
    };
    request.onerror = () => {
      reject(request.error);
      db.close();
    };
  });
}

// ==========================================
// CRUD de Contraseñas
// ==========================================

/** Genera un ID único */
function generateId(): string {
  return crypto.randomUUID();
}

/** Agregar una nueva entrada de contraseña */
export async function addPasswordEntry(
  entry: Omit<PasswordEntry, 'id' | 'createdAt' | 'updatedAt' | 'lastAccessedAt'>
): Promise<PasswordEntry> {
  const now = Date.now();
  const newEntry: PasswordEntry = {
    ...entry,
    id: generateId(),
    createdAt: now,
    updatedAt: now,
    lastAccessedAt: now,
  };

  await withStore(STORE_PASSWORDS, 'readwrite', (store) =>
    store.add(newEntry)
  );

  return newEntry;
}

/** Obtener todas las entradas de contraseñas */
export async function getAllPasswordEntries(): Promise<PasswordEntry[]> {
  return new Promise(async (resolve, reject) => {
    const db = await openDB();
    const tx = db.transaction(STORE_PASSWORDS, 'readonly');
    const store = tx.objectStore(STORE_PASSWORDS);
    const request = store.getAll();

    request.onsuccess = () => {
      resolve(request.result);
      db.close();
    };
    request.onerror = () => {
      reject(request.error);
      db.close();
    };
  });
}

/** Obtener entradas por ID de sitio */
export async function getEntriesBySiteId(siteId: string): Promise<PasswordEntry[]> {
  return new Promise(async (resolve, reject) => {
    const db = await openDB();
    const tx = db.transaction(STORE_PASSWORDS, 'readonly');
    const store = tx.objectStore(STORE_PASSWORDS);
    const index = store.index('siteId');
    const request = index.getAll(siteId);

    request.onsuccess = () => {
      resolve(request.result);
      db.close();
    };
    request.onerror = () => {
      reject(request.error);
      db.close();
    };
  });
}

/** Obtener una entrada por ID */
export async function getPasswordEntry(id: string): Promise<PasswordEntry | undefined> {
  return withStore(STORE_PASSWORDS, 'readonly', (store) =>
    store.get(id)
  );
}

/** Actualizar una entrada existente */
export async function updatePasswordEntry(
  id: string,
  updates: Partial<PasswordEntry>
): Promise<PasswordEntry> {
  const existing = await getPasswordEntry(id);
  if (!existing) throw new Error(`Entrada no encontrada: ${id}`);

  const updated: PasswordEntry = {
    ...existing,
    ...updates,
    id, // no permitir cambiar el ID
    updatedAt: Date.now(),
  };

  await withStore(STORE_PASSWORDS, 'readwrite', (store) =>
    store.put(updated)
  );

  return updated;
}

/** Actualizar el timestamp de último acceso */
export async function touchPasswordEntry(id: string): Promise<void> {
  await updatePasswordEntry(id, { lastAccessedAt: Date.now() });
}

/** Eliminar una entrada */
export async function deletePasswordEntry(id: string): Promise<void> {
  await withStore(STORE_PASSWORDS, 'readwrite', (store) =>
    store.delete(id)
  );
}

/** Eliminar todas las entradas */
export async function clearAllPasswordEntries(): Promise<void> {
  await withStore(STORE_PASSWORDS, 'readwrite', (store) =>
    store.clear()
  );
}

/** Contar entradas totales */
export async function countPasswordEntries(): Promise<number> {
  return withStore(STORE_PASSWORDS, 'readonly', (store) =>
    store.count()
  );
}

// ==========================================
// Perfil de Usuario
// ==========================================

/** Guardar perfil de usuario */
export async function saveUserProfile(profile: UserProfile): Promise<void> {
  await withStore(STORE_USER, 'readwrite', (store) =>
    store.put(profile)
  );
}

/** Obtener perfil de usuario */
export async function getUserProfile(): Promise<UserProfile | undefined> {
  return new Promise(async (resolve, reject) => {
    const db = await openDB();
    const tx = db.transaction(STORE_USER, 'readonly');
    const store = tx.objectStore(STORE_USER);
    const request = store.getAll();

    request.onsuccess = () => {
      resolve(request.result[0] || undefined);
      db.close();
    };
    request.onerror = () => {
      reject(request.error);
      db.close();
    };
  });
}

// ==========================================
// Exportar / Importar todos los datos
// ==========================================

/** Obtener todos los datos para exportar */
export async function getAllData(): Promise<{
  passwords: PasswordEntry[];
  user: UserProfile | undefined;
}> {
  const passwords = await getAllPasswordEntries();
  const user = await getUserProfile();
  return { passwords, user };
}

/** Importar datos (reemplaza todo) */
export async function importAllData(data: {
  passwords: PasswordEntry[];
  user?: UserProfile;
}): Promise<void> {
  // Limpiar datos existentes
  await clearAllPasswordEntries();

  // Insertar contraseñas
  const db = await openDB();
  const tx = db.transaction([STORE_PASSWORDS, STORE_USER], 'readwrite');

  const passwordStore = tx.objectStore(STORE_PASSWORDS);
  for (const entry of data.passwords) {
    passwordStore.add(entry);
  }

  // Insertar usuario si existe
  if (data.user) {
    const userStore = tx.objectStore(STORE_USER);
    userStore.put(data.user);
  }

  return new Promise((resolve, reject) => {
    tx.oncomplete = () => {
      db.close();
      resolve();
    };
    tx.onerror = () => {
      db.close();
      reject(tx.error);
    };
  });
}

/** Exportar datos a un Blob encriptado (simulando .kdbx) */
export async function exportToKdbx(data: any, masterKey: string): Promise<Blob> {
  const jsonString = JSON.stringify(data);
  const salt = generateSalt();
  const { encrypted, iv } = await encrypt(jsonString, masterKey, salt);
  
  // Estructura del archivo: salt (32 chars) + iv (24 chars) + encrypted content
  const content = salt + iv + encrypted;
  return new Blob([content], { type: 'application/octet-stream' });
}

/** Importar datos desde un Blob encriptado */
export async function importFromKdbx<T>(file: File, masterKey: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const text = e.target?.result as string;
        if (!text || text.length < 56) throw new Error('Archivo inválido');
        
        const salt = text.slice(0, 32);
        const iv = text.slice(32, 56);
        const encrypted = text.slice(56);
        
        const decryptedJson = await decrypt(encrypted, iv, masterKey, salt);
        const data = JSON.parse(decryptedJson) as T;
        resolve(data);
      } catch (err) {
        reject(new Error('Fallo al desencriptar. Clave incorrecta o archivo corrupto.'));
      }
    };
    reader.onerror = () => reject(new Error('Error leyendo el archivo'));
    reader.readAsText(file);
  });
}
