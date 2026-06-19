# Backend MVP — MagicJuris (HG · Reto 3)

Node + Express + **Prisma + SQLite** (gratis, sin infra; la DB es un archivo `prisma/dev.db`).
Para migrar a PostgreSQL más adelante: cambiar `provider` en `prisma/schema.prisma` y `DATABASE_URL`.

## Estructura

```
server/
├─ package.json
├─ .env.example          → copiar a .env
├─ prisma/
│  ├─ schema.prisma      → modelo de datos (entidades del MVP)
│  └─ seed.js            → puebla la DB con mockData del frontend
└─ src/
   └─ db.js              → cliente Prisma compartido
```

## Puesta en marcha (una sola vez)

Desde la carpeta `server/`:

```bash
cd server
npm install

# Windows (PowerShell/CMD):
copy .env.example .env
# (Git Bash / Linux / Mac: cp .env.example .env)

# Crea la base SQLite y aplica el esquema:
npx prisma migrate dev --name init

# Puebla con los datos de demostración:
npm run seed
```

## Comandos útiles

| Comando | Qué hace |
|---|---|
| `npx prisma studio` | Explorador visual de la base de datos (http://localhost:5555) |
| `npm run seed` | Re-puebla la base (limpia y recrea) |
| `npx prisma migrate dev --name <cambio>` | Nueva migración tras editar el schema |
| `npx prisma generate` | Regenera el cliente Prisma tras editar el schema |

## Notas

- `passwordHash` se guarda como `"demo"` en el seed; el hashing real es parte del **módulo A (auth, Fajardo)**.
- `comunicacion` es **append-only** a nivel de aplicación (RF-34): solo INSERT, nunca UPDATE/DELETE.
- El seed lee `../src/data/mockData.json` (datos del frontend) para no duplicar la información.
- `prisma/dev.db` y `.env` están en `.gitignore` (no se versionan).

## Módulo C — Monitoreo y detección (scraping)

Estructura:

```
src/
├─ lib/
│  ├─ fetchRetry.js     → fetch con backoff exponencial (RNF-12)
│  └─ radicado.js       → validación de radicado 23 dígitos (RF-09)
├─ sources/
│  ├─ index.js          → selector de fuente (FUENTE_JUDICIAL)
│  ├─ ramaJudicial.js   → adaptador REAL (API oficial CPNU, consulta a demanda)
│  └─ simulada.js       → adaptador SIMULADO (demo offline)
├─ services/
│  ├─ clasificacion.js  → clasificador stub por reglas (RF-18/20 · Módulo D)
│  └─ monitoreo.js      → detección por diferencia + último estado (RF-14/15/16)
└─ jobs/
   └─ monitor.js        → runner on-demand / programado (RF-13)
```

### Probar la detección (con la fuente simulada por defecto)

```bash
# Un proceso concreto (consulta a demanda). Usa un radicado del seed:
npm run monitor -- --radicado=11001310300520240012300

# Todos los procesos registrados, una vez:
npm run monitor:all

# Monitoreo programado cada INTERVALO_MIN minutos:
npm run monitor:watch
```

La primera corrida detecta 1 actuación nueva por proceso (la "novedad" simulada).
La segunda corrida ya no detecta nada → demuestra la **detección por diferencia** (RF-15).

### Usar la fuente REAL (API Rama Judicial) — viabilidad CONFIRMADA

No es scraping: es una **API REST pública** que devuelve JSON, sin login ni anti-bots.
Flujo (2 pasos), verificado contra la API real:

1. `GET /Procesos/Consulta/NumeroRadicacion?numero=<radicado>` → `idProceso` + despacho + partes.
2. `GET /Proceso/Actuaciones/<idProceso>?pagina=N` → actuaciones (40/página, paginado).

Prueba rápida de la fuente (sin tocar la DB):

```bash
# Pon FUENTE_JUDICIAL="real" en .env y prueba un radicado público real:
npm run probar:fuente -- --radicado=76001310300220230012600
```

Opera por **consulta a demanda**: solo radicados ya registrados (RF-10 / RNF-01), nunca
recolección masiva, y respeta procesos `esPrivado`. Si el portal cambia su estructura,
ajustar `src/sources/ramaJudicial.js` (`normaliza()` y rutas) — RNF-13.

> Nota: se añadió la columna `claveFuente` a `Actuacion` para deduplicar por id estable
> (`idRegActuacion`). Tras este cambio, vuelve a migrar y re-sembrar:
> `npx prisma migrate dev --name add_clave_fuente && npm run seed`.

## Siguiente paso

Módulo D (clasificación con IA): reemplazar `services/clasificacion.js` por el modelo,
y módulo E (resúmenes por rol con anonimización, RF-21..25).
