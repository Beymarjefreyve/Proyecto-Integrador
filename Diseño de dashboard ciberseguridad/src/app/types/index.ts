// ==========================================
// SecureVault — Tipos principales
// ==========================================

/** Categoría de un sitio web */
export type SiteCategory =
  | 'social'
  | 'email'
  | 'streaming'
  | 'work'
  | 'finance'
  | 'shopping'
  | 'gaming'
  | 'development'
  | 'education'
  | 'other';

/** Sitio del catálogo predefinido */
export interface CatalogSite {
  id: string;
  name: string;
  url: string;
  icon: string;        // nombre del ícono (lucide) o URL de favicon
  category: SiteCategory;
  color: string;       // color del ícono/fondo
}

/** Una entrada de contraseña guardada */
export interface PasswordEntry {
  id: string;
  siteId: string;         // ID del sitio del catálogo, o 'custom'
  siteName: string;       // nombre visible del sitio
  siteUrl: string;        // URL real del sitio
  siteIcon: string;       // ícono del sitio
  siteColor: string;      // color del sitio
  username: string;       // usuario o email de la cuenta
  encryptedPassword: string; // contraseña cifrada (base64)
  iv: string;             // vector de inicialización (base64)
  group: string;          // grupo/etiqueta (ej: "personal", "trabajo")
  strength: 'strong' | 'medium' | 'weak';
  createdAt: number;      // timestamp
  updatedAt: number;      // timestamp
  lastAccessedAt: number; // timestamp
}

/** Perfil del usuario */
export interface UserProfile {
  id: string;
  name: string;
  email: string;
  masterKeyHash: string;     // hash de la contraseña maestra
  masterKeySalt: string;     // salt para PBKDF2
  createdAt: number;
}

/** Opciones para el generador de contraseñas */
export interface PasswordGeneratorOptions {
  length: number;
  uppercase: boolean;
  lowercase: boolean;
  numbers: boolean;
  symbols: boolean;
}

/** Resultado de la generación de contraseña */
export interface GeneratedPassword {
  password: string;
  strength: 'strong' | 'medium' | 'weak';
}

/** Grupo de cuentas por sitio (para la vista agrupada) */
export interface SiteGroupData {
  siteId: string;
  siteName: string;
  siteUrl: string;
  siteIcon: string;
  siteColor: string;
  accounts: PasswordEntry[];
}
