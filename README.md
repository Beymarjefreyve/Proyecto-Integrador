# SecureVault - Proyecto Integrador de Ciberseguridad

SecureVault es un gestor de contraseñas de alta seguridad que utiliza reconocimiento facial biométrico (Face ID) para el acceso y gestión de credenciales. El proyecto está diseñado con un enfoque "Premium" de ciberseguridad, garantizando que cada usuario tenga una bóveda privada e inaccesible para otros.

## 🛠️ Herramientas Utilizadas

El proyecto utiliza un stack tecnológico moderno y robusto:

- **Biometría de Vanguardia (Face ID Engine)**: 
  Se utiliza la librería **[face-api.js](https://github.com/justadudewhohacks/face-api.js)**, la cual implementa redes neuronales convolucionales (CNN) directamente en el navegador sobre **TensorFlow.js**. El sistema opera mediante tres modelos críticos:
  - **SSD Mobilenet v1**: Un detector de rostros de alta precisión que localiza las cajas delimitadoras de cada cara en el video en tiempo real.
  - **Face Landmark 68**: Un modelo que identifica 68 puntos faciales específicos (ojos, cejas, nariz, boca y contorno mandibular), permitiendo la alineación facial perfecta y la detección de ángulos.
  - **Face Recognition (ResNet-34)**: Genera un "descriptor" único de 128 números (vector de características) que representa la huella digital del rostro. Este descriptor es el que se compara matemáticamente para autenticar al usuario con un margen de error mínimo.
  
- **Desarrollo Frontend**: 
  - **[React 18](https://reactjs.org/)**: Motor de la interfaz basado en componentes funcionales y Hooks para una gestión de estado eficiente.
  - **[TypeScript](https://www.typescriptlang.org/)**: Garantiza la integridad de los datos mediante tipado estático, crucial para manejar estructuras complejas como los descriptores biométricos y las entradas cifradas.
  - **[Vite 6](https://vitejs.dev/)**: Herramienta de nueva generación para el empaquetado y HMR (Hot Module Replacement), optimizando el ciclo de desarrollo y la carga de modelos pesados de IA.

- **Diseño y Experiencia de Usuario (UI/UX)**:
  - **[Tailwind CSS 4](https://tailwindcss.com/)**: Motor de estilos por utilidad que permite crear una estética "Cyber-Dark" con efectos de desenfoque gausiano (glassmorphism) e iluminación de acento.
  - **[Motion](https://motion.dev/)**: Biblioteca de animaciones para React que gestiona los estados de entrada/salida y las micro-interacciones que dan una sensación "Premium" y fluida al software.
  - **[Lucide React](https://lucide.dev/)**: Set de iconos optimizados para ciberseguridad.

- **Almacenamiento y Seguridad de Datos**:
  - **[IndexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)**: Base de datos NoSQL embebida en el navegador. Se utiliza para persistir las contraseñas y perfiles de usuario de forma local, evitando que los datos sensibles salgan del dispositivo del usuario.
  - **Web Crypto API**: Estándar nativo para operaciones criptográficas. Implementamos **AES-GCM** (Advanced Encryption Standard - Galois/Counter Mode) para el cifrado de las contraseñas y **PBKDF2** para la derivación de claves seguras basadas en el perfil biométrico.
  - **Recharts**: Librería de visualización técnica para monitorear el estado de seguridad de la bóveda mediante gráficas dinámicas.

## 📁 Estructura del Proyecto

El repositorio se organiza de la siguiente manera:

```text
Proyecto-Integrador/
├── src/                         # Código fuente de la aplicación
│   ├── app/                     
│   │   ├── components/          # Componentes de UI (Login, Registro, Dashboard, Modales)
│   │   ├── data/                # Catálogo de sitios predefinidos
│   │   ├── lib/                 # Lógica de Base de Datos, KDBX y Criptografía
│   │   ├── types/               # Definición de interfaces TypeScript
│   │   └── utils/               # Utilidades y cargadores de modelos de AI
│   └── models/                  # Modelos de Face-API.js entrenados
├── public/                      # Activos estáticos
├── package.json                 # Dependencias, scripts principales
├── vite.config.ts               # Empaquetador y configurador principal
└── README.md                    # Este archivo de documentación
```

## 📖 Explicación de Apartados

### 1. Acceso Biométrico (Face ID)
El sistema no utiliza contraseñas tradicionales para el login. En su lugar:
- **Registro**: Se capturan 3 ángulos del rostro (frontal, izquierdo, derecho) para crear un perfil biométrico único.
- **Login**: Un escaneo facial en vivo compara el rostro actual con los descriptores almacenados. Si la confianza es alta, se concede el acceso.

### 2. Dashboard de Ciberseguridad
Una interfaz intuitiva que muestra:
- **Resumen Estadístico**: Número de contraseñas guardadas y estado de sincronización.
- **Bóveda de Contraseñas**: Lista organizada de cuentas con búsqueda inteligente.
- **Seguridad Multiusuario**: Cada usuario que se registra tiene su propia base de datos aislada por un `userId` único.

### 3. Gestión de Contraseñas
- **Catálogo de Sitios**: Permite añadir cuentas rápidamente usando una lista de sitios populares o agregando sitios personalizados con iconos por defecto.
- **Generador de Contraseñas**: Herramienta integrada para crear claves robustas y seguras.
- **Cifrado**: Las contraseñas nunca se almacenan en texto plano; se cifran usando AES-GCM con una clave derivada del perfil.

### 4. Configuración y Seguridad
- **Perfil de Usuario**: Gestión de la información del usuario autenticado.
- **Personalización**: Ajustes visuales y de comportamiento de la bóveda.
- **Cierre de Sesión Seguro**: Limpia el estado de la aplicación y redirige al inicio para evitar accesos no autorizados.

---
*Este proyecto es parte del Proyecto Integrador centrado en la seguridad de datos y autenticación avanzada.*