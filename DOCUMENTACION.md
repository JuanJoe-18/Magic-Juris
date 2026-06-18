# MagicJuris — Documentación del prototipo

**Sistema de Seguimiento Judicial y Atención Proactiva al Cliente**
Producto desarrollado para **Hurtado Gandini Abogados S.A.S.**

| | |
| :---- | :---- |
| **Evento** | Legal Hack Icesi 2026 |
| **Reto** | Reto 3 — Seguimiento Judicial (monitoreo automatizado y atención proactiva) |
| **Cliente / Organizador** | Hurtado Gandini Abogados S.A.S. |
| **Nombre de trabajo** | MagicJuris *(by Hurtado Gandini)* |
| **Estado** | Prototipo MVP de front-end (interfaz + datos de demostración) |
| **Fecha** | 18 de junio de 2026 |

> Este documento describe **qué se construyó, bajo qué contexto y con qué rol/criterios de diseño**. Es la memoria técnica del prototipo y el punto de partida para las siguientes iteraciones (vistas de Cliente y Administración, e integración con fuentes reales).

---

## 1. Contexto

La firma **Hurtado Gandini Abogados** gestiona carteras de **40–120 procesos judiciales activos por abogado** en la Rama Judicial de Colombia. El seguimiento manual del estado de cada expediente es costoso y riesgoso: **el reloj procesal no se detiene** (art. 295 CGP), y dejar vencer un término puede acarrear responsabilidad disciplinaria.

El Reto 3 pide un sistema que:

1. **Monitoree** automáticamente las actuaciones de cada proceso registrado.
2. Las **clasifique por criticidad** (Crítica / Importante / Informativa).
3. Genere **comunicaciones proactivas y diferenciadas por rol** (Cliente, Abogado, Administración) — un mismo hecho procesal traducido a tres lenguajes.
4. Cumpla el **régimen de Habeas Data (Ley 1581 de 2012)** y el precedente de la **SIC (Res. 58834/2023)** sobre consulta a demanda, con **trazabilidad** integral de las comunicaciones.

El detalle completo de requerimientos está en [`SRS_Reto3_v2.docx.md`](./SRS_Reto3_v2.docx.md) (38 RF, 15 RNF, modelo de estados E0–E4 y matriz de trazabilidad contra los criterios del jurado).

---

## 2. Rol y criterios de diseño

El prototipo se construyó asumiendo el rol de **diseñador UI/UX de alto nivel + desarrollador front-end (React + Tailwind)**, siguiendo la identidad de marca **HG** definida en [`Instruccion1.txt`](./Instruccion1.txt).

### Identidad de marca HG — "Dark Premium"

| Token | Valor | Uso |
| :---- | :---- | :---- |
| Fondo profundo | `#0D0D0D` | Base de la aplicación |
| Superficie 1 | `#161616` | Tarjetas, paneles |
| Superficie 2 | `#1E1E1E` | Elevaciones |
| Acento rojo HG | `#C5202E` | Marca, criticidad Crítica, CTAs |
| Ámbar | `#B8621A` | Criticidad Importante |
| Azul | `#1A5C8A` | Criticidad Informativa |
| Borde | `rgba(255,255,255,0.08)` | Bordes glassmorphism |
| Glass | `rgba(255,255,255,0.04)` + `blur(12px)` | Superficies translúcidas |
| Tipografía | **Sora** (títulos) · **Inter** (cuerpo) | Vía Google Fonts |

Principios: glassmorphism sutil, sin gradientes "kitsch", jerarquía clara, badges 3D para criticidad (rojo pulsante = Crítica), responsive (sidebar colapsa a iconos en móvil).

---

## 3. Stack tecnológico

- **React 18** + **Vite 5** (bundler/dev server)
- **Tailwind CSS 3.4** (utilidades + tokens de marca en `tailwind.config.js`)
- **lucide-react** (iconografía)
- **Sin otras dependencias externas.** Todas las animaciones 3D/interactivas se implementaron con **CSS puro + JavaScript nativo** (sin `framer-motion`, `three.js`, etc.) para máximo rendimiento, menor peso y cero riesgo de incompatibilidades.

Build de producción: **1.594 módulos, 0 errores** · JS ~65 kB gzip · CSS ~6,8 kB gzip.

---

## 4. Estructura del proyecto

```
Magic-Juris/
├─ index.html
├─ package.json / package-lock.json
├─ vite.config.js · tailwind.config.js · postcss.config.js
├─ DOCUMENTACION.md            ← este documento
├─ Instruccion1.txt            ← prompt/brief original
├─ SRS_Reto3_v2.docx.md        ← especificación de requerimientos
├─ Screenshots/                ← referencias del sitio actual de HG
├─ public/
│  └─ favicon.svg
└─ src/
   ├─ main.jsx                 ← punto de entrada
   ├─ App.jsx                  ← conmuta Landing ⇄ Dashboard
   ├─ index.css                ← tokens, fuentes y motor de animaciones
   ├─ data/
   │  └─ mockData.json         ← 6 procesos de demostración
   ├─ hooks/
   │  └─ useReveal.js          ← scroll-reveal + contador animado
   ├─ lib/
   │  └─ ui.js                 ← helpers (criticidad, jurisdicción, formatos)
   ├─ pages/
   │  ├─ Landing.jsx           ← landing de producto
   │  └─ AbogadoDashboard.jsx  ← dashboard del rol Abogado
   └─ components/
      ├─ Sidebar.jsx
      ├─ ProcessCard.jsx
      ├─ ProcessDetail.jsx
      ├─ AlertsBanner.jsx
      └─ landing/
         ├─ Nav.jsx · Hero.jsx · HeroMock.jsx · Marquee.jsx
         ├─ Stats.jsx · Features.jsx · HowItWorks.jsx
         ├─ Roles.jsx · Security.jsx · CTA.jsx · Footer.jsx
         └─ Reveal.jsx · TiltCard.jsx · Spotlight.jsx
```

---

## 5. Lo que se construyó

### 5.1 Dashboard del Abogado (`src/pages/AbogadoDashboard.jsx`)

Interfaz operativa del profesional, que ensambla:

- **Sidebar** (`Sidebar.jsx`) — navegación fija de 260px (Dashboard, Mis Procesos, Alertas, Historial, Configuración), logo HG, indicador de rol activo y **contador de alertas críticas pendientes** (pulsante). Colapsa a iconos en móvil. El logo regresa a la landing.
- **Banner de alertas** (`AlertsBanner.jsx`) — actuaciones críticas del día con **cuenta regresiva** al vencimiento del término (simulada con fecha de referencia 18/06/2026).
- **Tarjetas de proceso** (`ProcessCard.jsx`) — radicado, cliente, jurisdicción, estado y **badge 3D de criticidad** (rojo pulsante / ámbar / azul). Click → abre el detalle.
- **Panel de detalle** (`ProcessDetail.jsx`) — **línea de tiempo vertical** de actuaciones (iconos por tipo, fecha, descripción técnica) + **panel tipo chat** con el resumen IA en lenguaje claro para el cliente, y el resumen técnico para el abogado.
- **Búsqueda y filtros** por criticidad; orden automático con las críticas primero.

### 5.2 Landing de producto (`src/pages/Landing.jsx`)

Página de marketing del producto, con estética de vanguardia. Secciones:

1. **Nav** — barra glass sticky que se opaca al hacer scroll.
2. **Hero** — mock del dashboard que se **inclina en 3D siguiendo el cursor**, fondo de **aurora animada con parallax**, grid en perspectiva, anillos orbitales, titular con gradiente *shimmer* y badges flotantes.
3. **Marquee** — cinta infinita con referencias normativas y actuaciones del CGP.
4. **Stats** — métricas con **contadores animados** (120 procesos · 3 niveles · 4 h de detección · 100% trazabilidad).
5. **Features** — 6 capacidades en **tarjetas con tilt 3D interactivo** (glare que sigue el mouse, borde con gradiente), cada una etiquetada con sus RF del SRS.
6. **Cómo funciona** — flujo de 4 pasos (registrar → vigilar → clasificar → comunicar) con conector luminoso.
7. **Roles** — "un hecho procesal, tres lenguajes": el mismo evento traducido para Cliente, Abogado y Administración.
8. **Seguridad** — cumplimiento por diseño (Ley 1581, consulta a demanda SIC, anonimización ante IA, cifrado, registro append-only, resiliencia).
9. **CTA final** + **Footer** con identidad HG.

### 5.3 Navegación

`App.jsx` mantiene un estado de vista simple: la **landing** es la entrada; los CTA ("Explorar el dashboard" / "Ver demo") llevan al **dashboard del Abogado**, y el logo del sidebar regresa a la landing.

---

## 6. Datos de demostración (`src/data/mockData.json`)

**6 procesos** judiciales realistas, con nombres colombianos y **radicados de 23 dígitos**. Cada proceso incluye:

- Cliente, abogado responsable y despacho.
- Jurisdicción (**civil / laboral / administrativo**).
- Estado del modelo **E1–E4** (Admisión / Apertura / Trámite-pruebas / Decisión-fallo).
- Criticidad de la última actuación y vencimiento del término.
- **Línea de tiempo** (≥ 3 actuaciones) con actuaciones reales del CGP: *auto admisorio, notificación por estado (art. 295), fijación de audiencia inicial (art. 372), inadmisión/subsanación (art. 90), traslado para alegatos, sentencia, recurso de apelación (art. 322), medidas cautelares*, etc.
- **Resumen IA por rol**: `resumenCliente` (lenguaje claro, sin jerga) y `resumenAbogado` (técnico-jurídico).

> Los resúmenes son textos pre-redactados que **simulan la salida del LLM**; en producción se generarían en tiempo real previa anonimización (RF-25).

---

## 7. Sistema de diseño y animaciones

Todo el "motor de animaciones de vanguardia" vive en `src/index.css` (CSS puro) y en tres componentes reutilizables:

| Técnica | Implementación |
| :---- | :---- |
| **Cursor spotlight** global | `Spotlight.jsx` actualiza variables CSS `--spot-x/--spot-y` en `pointermove` |
| **Tilt 3D** interactivo | `TiltCard.jsx` calcula `rotateX/rotateY` + glare radial según el cursor |
| **Scroll-reveal** | `useReveal.js` con `IntersectionObserver`; wrapper `Reveal.jsx` |
| **Contadores animados** | `useCountUp` con `requestAnimationFrame` y *easeOutExpo* |
| **Aurora / blobs** | `@keyframes auroraDrift` + parallax por cursor |
| **Shimmer de texto** | gradiente animado con `background-clip: text` |
| **Marquee, grid en perspectiva, anillos orbitales, glow pulsante, scanline** | keyframes CSS dedicados |
| **Accesibilidad** | `@media (prefers-reduced-motion: reduce)` desactiva animaciones |

**Ayuda de QA:** con el query param `?reveal` en la URL se fuerza la aparición inmediata de todas las secciones (útil para capturas estáticas). No afecta el comportamiento normal.

---

## 8. Trazabilidad con el SRS (cobertura de la interfaz)

La UI actual da soporte visual a, entre otros:

| RF | Cubierto en la interfaz |
| :---- | :---- |
| RF-17 | Secuencia completa de actuaciones por proceso (línea de tiempo) |
| RF-18 | Clasificación en 3 niveles de criticidad (badges) |
| RF-20 | Mapeo de actuación a estado E1–E4 |
| RF-21 / RF-22 | Resumen en lenguaje claro para el cliente |
| RF-23 | Resumen técnico-jurídico para el abogado |
| RF-26 | Alertas con antelación según criticidad (banner + cuenta regresiva) |
| RF-25 | Nota de anonimización conforme a Ley 1581 en los resúmenes IA |
| RF-30/34 | Mensaje de trazabilidad / registro append-only (landing) |

> El backend (monitoreo real, detección por diferencia, persistencia, RBAC, canales de notificación) **aún no está implementado**; el prototipo se centra en la experiencia y la propuesta de valor.

---

## 9. Cómo ejecutarlo

```bash
npm install      # instala dependencias
npm run dev      # servidor de desarrollo en http://localhost:5173
npm run build    # build de producción en /dist
npm run preview  # sirve el build de producción
```

Requisitos: Node 18+ (probado con Node 24). Sin variables de entorno ni servicios externos.

---

## 10. Decisiones técnicas

- **Sin librerías de animación**: las técnicas 3D se logran con CSS transforms + JS nativo → menor peso, mejor rendimiento y cumplimiento del brief ("sin otras dependencias").
- **Fecha de referencia fija** (18/06/2026) en `lib/ui.js` para que las cuentas regresivas de demostración sean coherentes y reproducibles.
- **Datos desacoplados** en `mockData.json` para sustituirlos fácilmente por una API real.
- **Componentes modulares** y reutilizables (`TiltCard`, `Reveal`, helpers de UI).
- **Accesibilidad**: respeto de `prefers-reduced-motion`, contraste alto, navegación por teclado en botones.

---

## 11. Próximos pasos

- [ ] **Vista del Cliente** — consulta en lenguaje claro de sus propios procesos (RF-02, RF-12, RF-21, RF-22, RF-27).
- [ ] **Vista de Administración** — auditoría de comunicaciones, gestión de usuarios/roles y Habeas Data (RF-03, RF-30, RF-33, RF-36).
- [ ] **Autenticación y RBAC** (RF-01, RF-04, RF-05).
- [ ] **Backend de monitoreo**: consulta a demanda, detección por diferencia, resiliencia con retroceso exponencial (RF-10, RF-15, RNF-12).
- [ ] **Integración con LLM** para generación real de resúmenes con anonimización previa (RF-25).
- [ ] **Historial append-only** y exportación para auditoría (RF-30, RF-33, RF-34).

---

*Prototipo MVP — Hurtado Gandini Abogados S.A.S. · Legal Hack Icesi 2026 · Reto 3.*
