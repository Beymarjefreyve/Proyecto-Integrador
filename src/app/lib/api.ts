// ==========================================
// SecureVault — Capa API de Sincronización
// Interactúa con el backend de FastAPI
// ==========================================

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  userId?: string;
}

export interface UserResponse {
  id: string;
  email: string;
  created_at: string;
  updated_at: string;
}

export interface VaultPayload {
  encrypted_vault: string;
  salt: string;
  iterations: number;
}

export interface VaultResponse extends VaultPayload {
  id: string;
  user_id: string;
  version: number;
  created_at: string;
  updated_at: string;
}

class ApiService {
  private getHeaders(auth: boolean = true): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    if (auth) {
      const token = localStorage.getItem('secureFace_token');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }
    return headers;
  }

  // --- Auth ---

  async register(email: string, password: string): Promise<UserResponse> {
    const res = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: this.getHeaders(false),
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.detail || 'Ocurrió un error en el registro');
    }
    return res.json();
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: this.getHeaders(false),
      body: JSON.stringify({
        user_in: { email, password },
        device_in: { device_name: navigator.userAgent, device_type: 'Web' }
      }),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.detail || 'Credenciales incorrectas');
    }
    const data: AuthResponse = await res.json();
    localStorage.setItem('secureFace_token', data.access_token);
    localStorage.setItem('secureFace_refreshToken', data.refresh_token);
    
    try {
      const payloadBase64 = data.access_token.split('.')[1];
      // Adapt Base64URL to regular Base64
      let base64 = payloadBase64.replace(/-/g, '+').replace(/_/g, '/');
      while (base64.length % 4) {
        base64 += '=';
      }
      const decodedPayload = JSON.parse(atob(base64));
      data.userId = decodedPayload.sub;
    } catch (e) {
      console.warn("Could not decode JWT payload to extract userId", e);
    }

    return data;
  }

  logout() {
    localStorage.removeItem('secureFace_token');
    localStorage.removeItem('secureFace_refreshToken');
    // Call backend to invalidate optionally
  }

  async deleteAccount(): Promise<void> {
    const res = await fetch(`${API_BASE_URL}/auth/me`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.detail || 'Error al eliminar la cuenta');
    }
    // Purge local session tokens
    localStorage.removeItem('secureFace_token');
    localStorage.removeItem('secureFace_refreshToken');
  }

  // --- Vault ---

  async initVault(payload: VaultPayload): Promise<VaultResponse> {
    const res = await fetch(`${API_BASE_URL}/vault/init`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.detail || 'Error al inicializar la bóveda');
    }
    return res.json();
  }

  async getVault(): Promise<VaultResponse> {
    const res = await fetch(`${API_BASE_URL}/vault`, {
      method: 'GET',
      headers: this.getHeaders(),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.detail || 'Error al obtener la bóveda');
    }
    return res.json();
  }

  async updateVault(encrypted_vault: string, version: number): Promise<VaultResponse> {
    const res = await fetch(`${API_BASE_URL}/vault`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify({ encrypted_vault, version }),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.detail || 'Error al actualizar la bóveda en el servidor');
    }
    return res.json();
  }
}

export const api = new ApiService();
