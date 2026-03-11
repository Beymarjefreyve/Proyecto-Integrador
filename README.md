# SecureVault - Gestor de Contraseñas Local

Este repositorio forma parte del proyecto integrador y contiene el desarrollo de una bóveda local segura para la gestión de contraseñas. 

A continuación se detallan las funcionalidades principales integradas en la aplicación:

## 🔒 Base de Datos Local Encriptada
Almacenamiento local completamente cifrado que se ejecuta del lado del cliente. Utiliza tecnologías como **IndexedDB** para la persistencia de datos y la **Web Crypto API** nativa del navegador para aplicar cifrado de grado militar (AES-256-GCM y PBKDF2). Las contraseñas nunca se guardan en texto plano en la aplicación, garantizando máxima privacidad y operabilidad offline.

## 🌐 Catálogo Integrado de Sitios
A la hora de añadir una nueva contraseña, el sistema despliega un catálogo con los servicios y plataformas más populares (tales como Google, Netflix, GitHub, Facebook, etc.). Cada servicio viene preconfigurado con su ícono y URL oficial correspondiente, agilizando el proceso de registro y previniendo enlaces erróneos o phishing.

## 🔑 Generador de Contraseñas Inteligente
Consiste en una herramienta sumamente personalizable integrada al proceso de creación de cuentas para sugerir contraseñas robustas y aleatorias con un solo clic.
* **Ajuste Dinámico:** Permite elegir la longitud del texto y forzar el uso de mayúsculas, minúsculas, números y símbolos.
* **Feedback y Pruebas:** Mide e indica visualmente el nivel de "fortaleza" de la contraseña sugerida (Fuerte, Media, Débil).
* Proporciona atajos rápidos para copiar la clave generada o ser redirigido directamente al sitio oficial correspondiente.

## 📂 Dashboard Dinámico con Agrupación
El panel de control (dashboard principal) se alimenta directamente y en tiempo real de las cuentas encriptadas en la base de datos.
* **Agrupación tipo Acordeón:** Si un usuario tiene múltiples cuentas asociadas a la misma plataforma (por ejemplo, tres direcciones de correo distintas para Gmail), el sistema las agrupa sabiamente en un único componente expandible, para mantener la bóveda limpia y organizada.
* **Acciones Rápidas:** Botones integrados para copiar contraseñas guardadas al portapapeles (desencriptando al instante) y abrir nuevas pestañas al sitio destino.
* **Búsqueda Funcional:** Una barra de búsqueda responsiva que filtra visualmente las cuentas al vuelo basada en nombres, correos o nombres de los sitios.

## ⚙️ Respaldos y Configuración (Importar / Exportar)
Una suite de herramientas para que el usuario siempre mantenga el control sobre sus datos.
* **Exportación de Bóveda:** Función que compila todas las contraseñas encriptadas de IndexedDB y genera automáticamente un fichero de respaldo descargable (`.kdbx`), el cual continúa cifrado y protegido frente a cualquier ataque local.
* **Restauración:** Permite cargar dicho fichero previamente generado al sistema para restaurar por completo la bóveda en otro navegador u equipo sin perder configuraciones ni cuentas.
