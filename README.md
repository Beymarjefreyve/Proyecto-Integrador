# SecureVault - Proyecto Integrador

Gestor de contraseñas local seguro, diseñado para proteger la información confidencial mediante encriptación avanzada directamente en el cliente (navegador).

## Características Principales
- **Cifrado Real y Seguro**: Utiliza la API WebCrypto con algoritmos modernos (AES-GCM, PBKDF2) para derivar llaves y rotar accesos en memoria.
- **Interoperabilidad Nativa KDBX**: Importa y exporta bases de datos de contraseñas genuinas, 100% compatibles con software de terceros como KeePass/KeePassXC.
- **Gestión Intuitiva**: Dashboard ágil que permite la catalogación de cuentas por sitio inteligente, monitorización de la salud de las contraseñas e interfaz adaptable a distintos módulos del usuario.
- **Persistencia Aislada y Sin Servidor**: Funciona de forma totalmente descentralizada usando IndexedDB de tu propio navegador. Garantía de «zero-knowledge» y cero peticiones externas de red con tus datos de texto explícito.

## Instalación y Ejecución

Es necesario contar con un entorno de Node.js instalado en la máquina anfitriona.

1. Clona el repositorio e instala las dependencias de los módulos (incluido Vite y Kdbxweb):
   ```bash
   npm install
   ```

2. Levanta el empaquetador del servidor de desarrollo:
   ```bash
   npm run dev
   ```
   
Luego, visita el enlace publicado en tu terminal (usualmente `http://localhost:5173/`).