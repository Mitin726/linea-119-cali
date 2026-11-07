# Proyecto Bomberos Cali - Canal Digital Línea 119

Este proyecto es un prototipo funcional de un canal digital web para el Benemérito Cuerpo de Bomberos Voluntarios de Cali, diseñado para agilizar el protocolo de despacho de la línea 119 mediante el envío de coordenadas, fotos y videos por parte de la ciudadanía.

## Integrante
* Juan Martín Carvajal

## Sitio desplegado
🔗 **https://linea-119-cali.vercel.app/**

> El repositorio ya incluye `vercel.json` y `public/_redirects` para que `/reportar` y `/operador` funcionen al recargar en Vercel o Netlify.

## Tecnologías Utilizadas
* **Frontend:** React (con Vite)
* **Enrutamiento:** React Router Dom
* **Mapas:** React-Leaflet y OpenStreetMap (gratuito), react-leaflet-cluster para agrupar reportes
* **Escena 3D:** React Three Fiber y Drei
* **Íconos y tipografía:** lucide-react, Inter y JetBrains Mono (Google Fonts)
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
7. **Flujo de prueba:** `/` → «Reportar Emergencia» → llenar el formulario → enviar. Luego abrir `/operador`, seleccionar el reporte, **Validar** → elegir unidad → **Despachar** → **Cerrar caso**. La pantalla de confirmación del ciudadano muestra cada cambio de estado.
8. **Para probar la sincronización:** Abre una pestaña en `http://localhost:5173/reportar` (Vista Ciudadano) y otra pestaña paralela en `http://localhost:5173/operador` (Tablero Operador).

---

## Respuestas a las 5 preguntas de Bomberos (Justificación Técnica)

A continuación, se responde a las inquietudes del cliente, explicando qué se implementó en este prototipo web y qué se requeriría para un entorno de producción real.

### 1. ¿Puede llegarle al radio operador un mapa con la ubicación exacta a partir de las coordenadas del ciudadano?
* **Qué se hizo en el prototipo:** Se implementó un mapa interactivo utilizando `react-leaflet` y OpenStreetMap. El ciudadano elige su barrio (lista con coordenadas) y, opcionalmente, toca el punto exacto en un mini mapa (`useMapEvents`). Esas coordenadas llegan al tablero del operador como un pin del color del grupo, y el detalle trae el enlace «Ver en Google Maps» (`https://www.google.com/maps?q=LAT,LNG`).
* **Qué faltaría para producción:** Implementar la API de geolocalización nativa del navegador (`navigator.geolocation`) para capturar el GPS del celular automáticamente con permiso del usuario, y usar servicios de geocodificación inversa (Google Maps API o Mapbox) para traducir esas coordenadas a una dirección en texto automáticamente.

### 2. ¿Puede el ciudadano recibir una respuesta automática para saber que su reporte fue recibido?
* **Qué se hizo en el prototipo:** Al enviar el formulario, el ciudadano entra a una pantalla de confirmación con número de radicado, hora del reporte, estado actual y una línea de tiempo con cada cambio. Gracias a la sincronización con `Context` y `localStorage`, cuando el operador cambia el estado del caso (Ej. "Unidad despachada"), la pantalla del ciudadano se actualiza en tiempo real.
* **Qué faltaría para producción:** Ya que no podemos depender de que el ciudadano deje la pestaña abierta, en producción se debe conectar un backend real para enviar un mensaje de texto (SMS) automatizado vía Twilio, o una notificación de WhatsApp (Meta API) con un enlace para hacer seguimiento.

### 3. ¿Qué pasa si hay una emergencia de gran magnitud y llegan reportes masivos?
* **Qué se hizo en el prototipo:** Se implementó un modo de simulación que genera 50 reportes aleatorios al instante. Para manejarlos, el tablero del operador incluye filtros por "Grupo de emergencia" y "Estado", contadores por estado, una lista ordenada por prioridad (primero lo que falta validar) y **agrupación de reportes cercanos** en el mapa (`react-leaflet-cluster`): los pines cercanos se muestran como un círculo con el total, rojo si dentro hay reportes sin validar. Cada estado se distingue en el pin: pulso (Recibido), normal (Validado), anillo (Unidad despachada) y gris (Cerrado/Descartado).
* **Qué faltaría para producción:** Un backend con cola de mensajes y base de datos para recibir miles de reportes a la vez, detección automática de duplicados (mismo lugar y misma hora), paginación de la lista y varios operadores trabajando sobre el mismo tablero en tiempo real (WebSockets).

### 4. ¿Puede el radio operador, si lo decide, hacer una videollamada al ciudadano?
* **Qué se hizo en el prototipo:** La videollamada está fuera del alcance del parcial. En su lugar, el detalle del reporte tiene un botón **«Llamar»** (enlace `tel:` con el teléfono del ciudadano) y un botón **«Solicitar más información»** que muestra un aviso en la pantalla de confirmación del ciudadano.
* **Qué faltaría para producción:** Integrar WebRTC (comunicación en tiempo real) o APIs de terceros como Twilio Video o Agora. Esto permitiría generar un enlace temporal seguro mediante el backend para abrir una cámara en el navegador del ciudadano sin que instale aplicaciones externas.

### 5. ¿Se pueden enviar varias fotos o videos, con recomendaciones de cómo tomarlos?
* **Qué se hizo en el prototipo:** El formulario permite adjuntar hasta 3 archivos (imágenes o videos cortos). Estos se previsualizan instantáneamente en el navegador mediante `URL.createObjectURL`. Además, se diseñó una ventana flotante (Tips) para educar al ciudadano sobre cómo grabar de forma segura.
* **Qué faltaría para producción:** Conectar un servicio de almacenamiento en la nube (como AWS S3 o Firebase Storage). Los archivos multimedia pesados no deben viajar directo al servidor del operador; deben subirse comprimidos a la nube y el operador simplemente consume la URL pública generada.

---

## Pregunta de diseño: ¿qué preguntas del protocolo se pueden omitir con foto, video o videollamada?

1. **«¿Dónde es su emergencia?» (punto de referencia / nombre del edificio):** una foto de la fachada, la placa o un letrero, junto con el punto marcado en el mapa, ubica el sitio sin tener que preguntar referencias una por una.
2. **«¿Cuál es su emergencia?» (clasificación del grupo y magnitud):** una foto o video muestra si hay fuego, humo, una fuga o un vehículo accidentado. El operador confirma o corrige el grupo al validar, sin interrogar al ciudadano.
3. **Preguntas de continuación del grupo 300 (¿consciente?, ¿respira?, cuántas personas):** en una videollamada el operador ve directamente el estado del paciente y cuántos afectados hay.

## Estructura del código

```
src/
├── context/EmergencyContext.jsx   Estado global (Context + localStorage + evento storage)
├── data/                          grupos.js, gruposInfo.js (íconos y ejemplos), barrios.js, estados.js
├── mapa/                          MapaOperador.jsx (mapa del operador), iconos.js, mapa.css
├── three/EscenaLanding.jsx        Escena 3D (botón de emergencia con alarma)
├── components/                    SiteHeader, SiteFooter, Marca, CampoFormulario, MiniMapa,
│                                  ConfirmacionReporte, ReporteItem, DetalleReporte, HistorialEstados
└── pages/                         Landing, Reportar, Operador
```

## Diseño

Dos ambientes con un mismo sistema de diseño (tokens en `src/index.css`):
* **Sitio ciudadano (landing y reporte):** claro e institucional, para transmitir confianza y calma. Tipografía **Inter**, rojo institucional solo en las acciones principales e íconos de **lucide-react**.
* **Tablero del operador:** oscuro, tipo centro de control (clase `.tema-oscuro`), con reloj en vivo, contadores por estado, lista ordenada por prioridad y mapa oscuro. **JetBrains Mono** se usa para radicados, horas y códigos.
* El reporte es un asistente de 5 pasos (Emergencia → Ubicación → Tus datos → Evidencia → Revisar) que sigue el orden del interrogatorio del protocolo, y la confirmación muestra el estado como un seguimiento paso a paso.

## Escena 3D

Botón de emergencia 119 hecho con geometrías básicas (cilindros y un anillo):
* **Animación (`useFrame`):** gira y flota constantemente; con la alarma activa gira más rápido, el botón se hunde, parpadea y emite una onda roja.
* **Interacción con el mouse:** `onPointerOver` lo agranda e ilumina; `onClick` activa o desactiva la alarma (luz roja intermitente).

## Extras implementados
* Videos además de fotos, con ventana flotante de recomendaciones para tomarlos.
* Botón del operador «Solicitar más información» con aviso en la pantalla del ciudadano.
* Modo emergencia masiva: «Simular 50 reportes», filtros por grupo y estado, y agrupación de reportes cercanos en el mapa.
* Preguntas de continuación del grupo 300 (sexo, edad, ¿consciente?, ¿respira?).
* Mini mapa en `/reportar` para tocar el punto exacto (`useMapEvents`).
* Sincronización de dos pestañas (ciudadano y operador) con el evento `storage`.
