# Proyecto Bomberos Cali - Canal Digital Línea 119

Este proyecto es un prototipo funcional de un canal digital web para el Benemérito Cuerpo de Bomberos Voluntarios de Cali, diseñado para agilizar el protocolo de despacho de la línea 119 mediante el envío de coordenadas, fotos y videos por parte de la ciudadanía.

## Integrante
* Juan Martín Carvajal

## Tecnologías Utilizadas
* **Frontend:** React (con Vite)
* **Enrutamiento:** React Router Dom
* **Mapas:** React-Leaflet y OpenStreetMap (gratuito)
* **Escena 3D:** React Three Fiber y Drei
* **Estado Global:** Context API + LocalStorage + Eventos de Sincronización

## Cómo correr el proyecto localmente

1. Asegúrate de tener instalado [Node.js](https://nodejs.org/).
2. Clona o descarga el repositorio del proyecto.
3. Abre una terminal en la carpeta raíz del proyecto (`parcial-119-base`).
4. Instala las dependencias ejecutando:
   ```bash
   npm install
   ```
5. Inicia el servidor de desarrollo ejecutando:
   ```bash
   npm run dev
   ```
6. Abre tu navegador en la URL que indique la consola (generalmente `http://localhost:5173/`).
7. **Para probar la sincronización:** Abre una pestaña en `http://localhost:5173/reportar` (Vista Ciudadano) y otra pestaña paralela en `http://localhost:5173/operador` (Tablero Operador).

---

## Respuestas a las 5 preguntas de Bomberos (Justificación Técnica)

A continuación, se responde a las inquietudes del cliente, explicando qué se implementó en este prototipo web y qué se requeriría para un entorno de producción real.

### 1. ¿Puede llegarle al radio operador un mapa con la ubicación exacta a partir de las coordenadas del ciudadano?
* **Qué se hizo en el prototipo:** Se implementó un mapa interactivo utilizando `react-leaflet` y OpenStreetMap. El ciudadano puede elegir su barrio (con coordenadas predefinidas) o tocar un punto exacto en un mini-mapa. Estas coordenadas viajan en tiempo real al tablero del operador, quien ve el pin renderizado al instante.
* **Qué faltaría para producción:** Implementar la API de geolocalización nativa del navegador (`navigator.geolocation`) para capturar el GPS del celular automáticamente con permiso del usuario, y usar servicios de geocodificación inversa (Google Maps API o Mapbox) para traducir esas coordenadas a una dirección en texto automáticamente.

### 2. ¿Puede el ciudadano recibir una respuesta automática para saber que su reporte fue recibido?
* **Qué se hizo en el prototipo:** Al enviar el formulario, el ciudadano entra a una pantalla de confirmación en vivo con un número de radicado. Gracias a la sincronización con `Context` y `localStorage`, cuando el operador cambia el estado del caso (Ej. "Unidad despachada"), la pantalla del ciudadano se actualiza en tiempo real.
* **Qué faltaría para producción:** Ya que no podemos depender de que el ciudadano deje la pestaña abierta, en producción se debe conectar un backend real para enviar un mensaje de texto (SMS) automatizado vía Twilio, o una notificación de WhatsApp (Meta API) con un enlace para hacer seguimiento.

### 3. ¿Qué pasa si hay una emergencia de gran magnitud y llegan reportes masivos?
* **Qué se hizo en el prototipo:** Se implementó un modo de simulación que genera 50 reportes aleatorios al instante. Para manejarlos, el tablero del operador incluye filtros por "Grupo de emergencia" y "Estado", además de una lista lateral navegable.
* **Qué faltaría para producción:** Implementar "Clustering" (agrupación de pines) en el mapa para que si hay 100 reportes en una misma cuadra, se vea un solo círculo con el número "100" en lugar de saturar la pantalla. En el backend, se requeriría un balanceador de carga y paginación para la base de datos.

### 4. ¿Puede el radio operador, si lo decide, hacer una videollamada al ciudadano?
* **Qué se hizo en el prototipo:** Se incluyeron dos alternativas de comunicación: un botón de "Llamada tradicional" que ejecuta un enlace `tel:` para marcar desde el celular/computador, y un botón extra de "Solicitar más información" que arroja una alerta visual directamente en la pantalla del ciudadano.
* **Qué faltaría para producción:** Integrar WebRTC (comunicación en tiempo real) o APIs de terceros como Twilio Video o Agora. Esto permitiría generar un enlace temporal seguro mediante el backend para abrir una cámara en el navegador del ciudadano sin que instale aplicaciones externas.

### 5. ¿Se pueden enviar varias fotos o videos, con recomendaciones de cómo tomarlos?
* **Qué se hizo en el prototipo:** El formulario permite adjuntar hasta 3 archivos (imágenes o videos cortos). Estos se previsualizan instantáneamente en el navegador mediante `URL.createObjectURL`. Además, se diseñó una ventana flotante (Tips) para educar al ciudadano sobre cómo grabar de forma segura.
* **Qué faltaría para producción:** Conectar un servicio de almacenamiento en la nube (como AWS S3 o Firebase Storage). Los archivos multimedia pesados no deben viajar directo al servidor del operador; deben subirse comprimidos a la nube y el operador simplemente consume la URL pública generada.