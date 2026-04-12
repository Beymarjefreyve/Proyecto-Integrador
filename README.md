# SecureVault - Proyecto Integrador de Ciberseguridad

SecureVault es un gestor de contraseñas de alta seguridad con arquitectura **Hybrid Zero-Knowledge**. Utiliza reconocimiento facial biométrico (Face ID) para el acceso y garantiza la soberanía de los datos mediante el cifrado local antes de la sincronización en la nube.

## 🌟 Características Principales

- **Autenticación Biométrica (Face ID)**: Login inteligente mediante redes neuronales que analizan la geometría facial en tiempo real.
- **Arquitectura Zero-Knowledge**: Los datos se cifran en el dispositivo del usuario con una clave que el servidor nunca conoce.
- **Sincronización Multi-dispositivo**: Mantén tus contraseñas seguras y disponibles en cualquier lugar gracias al backend sincronizado.
- **Interoperabilidad KDBX**: Exporta e importa tus datos en el formato estándar de KeePass, permitiendo migraciones seguras y acumulativas.
- **Purga de Privacidad**: Eliminación completa de cuenta que garantiza el borrado de biometría local y registros remotos de forma irreversible.

## 🛠️ Stack Tecnológico

### Frontend (Modern Web UI)
- **[React 18](https://reactjs.org/) + [TypeScript](https://www.typescriptlang.org/)**: Interfaz reactiva y tipado seguro.
- **[Vite 6](https://vitejs.dev/)**: Empaquetador ultra-rápido para el desarrollo moderno.
- **[Tailwind CSS 4](https://tailwindcss.com/)**: Estilos optimizados con estética Cyber-Dark de alto impacto.
- **[Motion](https://motion.dev/)**: Micro-interacciones y animaciones fluidas para una experiencia Premium.

### Inteligencia Artificial (Biometría)
- **[face-api.js](https://github.com/justadudewhohacks/face-api.js)**: Implementación de Redes Neuronales Convolucionales (SSD Mobilenet v1, ResNet-34) para el reconocimiento facial directamente en el navegador.

### Backend (Seguridad & Sincronización)
- **[FastAPI](https://fastapi.tiangolo.com/)**: Framework de alto rendimiento en Python para la gestión de dispositivos y vaults.
- **[SQLAlchemy](https://www.sqlalchemy.org/)**: ORM para una gestión de base de datos robusta y escalable.
- **JWT (JSON Web Tokens)**: Gestión de sesiones segura con soporte para cierre de sesión global y control de versiones de tokens.

### Almacenamiento Criptográfico
- **[IndexedDB](https://developer.mozilla.org/es/docs/Web/API/IndexedDB_API)**: Almacenamiento local persistente y aislado por usuario.
- **Web Crypto API (AES-GCM)**: Estándar industrial para asegurar que las contraseñas nunca se guarden en texto plano.

## 📁 Estructura del Repositorio

```text
Proyecto-Integrador/
├── backend/                     # Servidor de sincronización (Python)
│   ├── app/                     # Lógica principal, modelos y rutas
│   ├── venv/                    # Entorno virtual de Python
│   └── requirements.txt         # Dependencias del backend
├── src/                         # Aplicación Frontend (React)
│   ├── app/                     
│   │   ├── components/          # Dashboard, Login, FaceID y Escáner
│   │   ├── lib/                 # Capas de API, DB y Criptografía
│   │   └── types/               # Definiciones de interfaces
│   └── main.tsx                 # Entrada principal React
├── public/                      # Modelos de Face-API y activos estáticos
├── package.json                 # Scripts de Node.js y dependencias
└── README.md                    # Documentación técnica
```

## 🚀 Instalación y Ejecución

### 1. Requisitos Previos
- Node.js (v18+)
- Python (v3.9+)

### 2. Configurar el Backend
```bash
cd backend
python -m venv venv
.\venv\Scripts\activate  # En Windows
pip install -r requirements.txt
uvicorn app.main:app --reload
```
*El backend correrá en `http://127.0.0.1:8000`*

### 3. Configurar el Frontend
```bash
# En la raíz del proyecto
npm install
npm run dev
```
*El frontend correrá en `http://localhost:5173`*

## 🔒 Consideraciones de Seguridad
1. **Clave Maestra**: La contraseña maestra del usuario se utiliza para derivar las claves de cifrado AES. Esta contraseña **nunca se envía al servidor**.
2. **Biometría Local**: Los descriptores faciales (puntos geométricos) se almacenan localmente en el dispositivo para máxima privacidad.
3. **Sincronización**: Solo los datos ya cifrados (bóveda) se envían a la nube, garantizando que incluso ante una brecha en el servidor, tus contraseñas permanezcan ilegibles.

---
*Este proyecto es parte del Proyecto Integrador centrado en la seguridad de datos y autenticación de última generación.*