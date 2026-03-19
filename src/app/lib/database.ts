// ==========================================
// SecureVault — Capa de Base de Datos (IndexedDB)
// ==========================================

import type { PasswordEntry, UserProfile } from '../types';
import { encrypt, decrypt, generateSalt } from './crypto';
import * as kdbxweb from 'kdbxweb';

const DB_NAME = 'SecureVaultDB';
const DB_VERSION = 2;
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
        store.createIndex('userId', 'userId', { unique: false });
        store.createIndex('siteId', 'siteId', { unique: false });
        store.createIndex('siteName', 'siteName', { unique: false });
        store.createIndex('group', 'group', { unique: false });
      } else {
        const store = request.transaction!.objectStore(STORE_PASSWORDS);
        if (!store.indexNames.contains('userId')) {
          store.createIndex('userId', 'userId', { unique: false });
        }
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

/** Obtener todas las entradas de contraseñas de un usuario */
export async function getAllPasswordEntries(userId: string): Promise<PasswordEntry[]> {
  return new Promise(async (resolve, reject) => {
    const db = await openDB();
    const tx = db.transaction(STORE_PASSWORDS, 'readonly');
    const store = tx.objectStore(STORE_PASSWORDS);
    const index = store.index('userId');
    const request = index.getAll(userId);

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

/** Contar entradas totales de un usuario */
export async function countPasswordEntries(userId: string): Promise<number> {
  return new Promise(async (resolve, reject) => {
    const db = await openDB();
    const tx = db.transaction(STORE_PASSWORDS, 'readonly');
    const store = tx.objectStore(STORE_PASSWORDS);
    const index = store.index('userId');
    const request = index.count(userId);

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
// Perfil de Usuario
// ==========================================

/** Guardar perfil de usuario */
export async function saveUserProfile(profile: UserProfile): Promise<void> {
  await withStore(STORE_USER, 'readwrite', (store) =>
    store.put(profile)
  );
}

/** Obtener perfil de usuario por ID */
export async function getUserProfile(userId?: string): Promise<UserProfile | undefined> {
  return new Promise(async (resolve, reject) => {
    const db = await openDB();
    const tx = db.transaction(STORE_USER, 'readonly');
    const store = tx.objectStore(STORE_USER);
    let request: IDBRequest<any>;
    if (userId) {
      request = store.get(userId);
    } else {
      request = store.getAll();
    }

    request.onsuccess = () => {
      const result = request.result;
      if (Array.isArray(result)) {
        resolve(result[0] || undefined);
      } else {
        resolve(result || undefined);
      }
      db.close();
    };
    request.onerror = () => {
      reject(request.error);
      db.close();
    };
  });
}

/** Eliminar el perfil de usuario y todas sus datos */
export async function deleteUserProfile(): Promise<void> {
  const db = await openDB();
  const tx = db.transaction([STORE_USER, STORE_PASSWORDS], 'readwrite');
  
  tx.objectStore(STORE_USER).clear();
  tx.objectStore(STORE_PASSWORDS).clear();
  
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

// ==========================================
// Exportar / Importar todos los datos
// ==========================================

/** Obtener todos los datos de un usuario para exportar */
export async function getAllData(userId: string): Promise<{
  passwords: PasswordEntry[];
  user: UserProfile | undefined;
}> {
  const passwords = await getAllPasswordEntries(userId);
  const user = await getUserProfile(userId);
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

/** Exportar datos a un Blob en formato KDBX (Real) */
export interface RawKdbxEntry {
  title: string;
  username: string;
  password: string;
  url: string;
  notes: string;
}

export async function exportToKdbxReal(data: { passwords: PasswordEntry[] }, internalMasterKey: string, kdbxPassword: string): Promise<Blob> {
  const credentials = new kdbxweb.Credentials(kdbxweb.ProtectedValue.fromString(kdbxPassword));
  const db = kdbxweb.Kdbx.create(credentials, 'SecureVault Export');
  
  try {
    db.header.setKdf(kdbxweb.Consts.KdfId.Aes);
  } catch (e) {}

  const defaultGroup = db.getDefaultGroup();
  
  for (const p of data.passwords) {
    const entry = db.createEntry(defaultGroup);
    
    // El objeto fields en kdbxweb es un diccionario en runtime,
    // pero TS cree que es un Map. Cast to any.
    const fields = entry.fields as any;

    fields['Title'] = p.siteName || 'Desconocido';
    fields['UserName'] = p.username || '';
    fields['URL'] = p.siteUrl || '';
    if (p.group) fields['Notes'] = `Grupo: ${p.group}`;
    
    let plainPassword = '';
    try {
      const user = await getUserProfile(p.userId);
      const salt = user?.masterKeySalt || 'default-salt';
      plainPassword = await decrypt(p.encryptedPassword, p.iv, internalMasterKey, salt);
    } catch (err) {
      console.warn('Failed to decrypt password for export', err);
    }
    
    fields['Password'] = kdbxweb.ProtectedValue.fromString(plainPassword);
  }
  
  const arrayBuffer = await db.save();
  return new Blob([arrayBuffer], { type: 'application/octet-stream' });
}

/** Importar datos desde un archivo KDBX (Real) */
export async function importFromKdbxReal(file: File, kdbxPassword: string): Promise<RawKdbxEntry[]> {
  const arrayBuffer = await file.arrayBuffer();
  const credentials = new kdbxweb.Credentials(kdbxweb.ProtectedValue.fromString(kdbxPassword));
  
  let db: kdbxweb.Kdbx;
  try {
    db = await kdbxweb.Kdbx.load(arrayBuffer, credentials);
  } catch (err: any) {
    throw new Error(err.message || 'Error loading KDBX');
  }

  const newEntries: RawKdbxEntry[] = [];

  function traverse(group: kdbxweb.KdbxGroup) {
    if (group.entries && Array.isArray(group.entries)) {
      for (const entry of group.entries) {
        // En kdbxweb `fields` puede ser un objeto dict dict ({[key: string]: KdbxField}), no un Map.
        // Pero en TypeScript está tipado como Map. Usamos un cast.
        const fields = entry.fields as any;
        
        // Extraemos variables (intentando dict primero, y fallback a Map.get por seguridad cruzada)
        let fTitle = fields['Title'];
        let fUser = fields['UserName'];
        let fPass = fields['Password'];
        let fUrl = fields['URL'];
        let fNotes = fields['Notes'];

        if (fTitle === undefined && typeof entry.fields.get === 'function') {
           fTitle = entry.fields.get('Title');
           fUser = entry.fields.get('UserName');
           fPass = entry.fields.get('Password');
           fUrl = entry.fields.get('URL');
           fNotes = entry.fields.get('Notes');
        }

        const title = fTitle ? fTitle.toString() : '';
        const username = fUser ? fUser.toString() : '';
        const url = fUrl ? fUrl.toString() : '';
        const notes = fNotes ? fNotes.toString() : '';

        let password = '';
        if (fPass instanceof kdbxweb.ProtectedValue) {
          password = fPass.getText();
        } else if (fPass !== undefined && fPass !== null) {
          password = fPass.toString();
        }

        // Evitar entradas completamente vacías
        if (!title && !username && !password && !url) {
          console.warn('Entrada vacía detectada y omitida.');
          continue;
        }

        newEntries.push({ title, username, password, url, notes });
      }
    }
    
    if (group.groups && Array.isArray(group.groups)) {
      for (const childGroup of group.groups) {
        traverse(childGroup);
      }
    }
  }

  traverse(db.getDefaultGroup());
  return newEntries;
}
