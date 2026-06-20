# Arquitectura consolidada — MagicJuris (post-merge)

Decisión de equipo: **microservicios**. Dos backends con dueños claros; el pipeline de
IA (Node + Gemini) es el **oficial** para consulta real y clasificación.

## Diagrama (texto)

```
                 ┌─────────────────────────────┐
                 │  Frontend React (Vite :5173)│
                 │  - login/auth (AuthContext) │
                 └───────────┬─────────────────┘
            apiClient → :8000 │  lib/api → /api (proxy) → :3001
        (URL absoluta)        │                 (relativo)
        ┌─────────────────────┴──────────┐   ┌────────────────────────────┐
        │  Python · FastAPI  (:8000)     │   │  Node · Express  (:3001)   │
        │  CORE                          │   │  IA                        │
        │  A auth/JWT/RBAC               │   │  C consulta RJ REAL        │
        │  A usuarios                    │   │  D clasificación Gemini    │
        │  B procesos/registro           │   │     (criticidad + sujeto)  │
        │  F alertas/notif.              │   │  E resúmenes por rol       │
        │  G auditoría/CSV/comunic.      │   │  + chatbot multi-rol (RAG) │
        │  tareas cliente                │   │                            │
        │  SQLite (SQLAlchemy)           │   │  SQLite (Prisma dev.db)    │
        └────────────────────────────────┘   └────────────────────────────┘
```

## Matriz de dueños (qué backend manda en qué)

| Dominio | Dueño | Módulo |
|---|---|---|
| Login, JWT, RBAC, usuarios | **Python** | A |
| Registro de procesos, listado | **Python** | B |
| Alertas / notificaciones | **Python** | F |
| Auditoría, export CSV, comunicaciones | **Python** | G |
| Tareas asignadas al cliente | **Python** | — |
| **Consulta real Rama Judicial** | **Node** | C |
| **Clasificación criticidad + sujeto (Gemini)** | **Node** | D |
| **Resúmenes por rol (Gemini)** | **Node** | E |
| **Chatbot multi-rol (RAG)** | **Node** | — |

## Ruteo del frontend (confirmado)

- `src/services/apiClient.js` → `config.apiUrl` = `http://localhost:8000/api` → **Python**.
- `src/lib/api.js` → `/api/...` → proxy Vite → **Node :3001**.
- No colisionan: Python usa URL absoluta; Node usa ruta relativa con proxy.

## Decisión sobre duplicados

Python tiene su propio `actuation_service.py` (clasificador por keywords ALTA/MEDIA/BAJA)
y un `rama_judicial/client.py` con **sync mock**. **No son la fuente oficial.**
- La **criticidad oficial** la produce Node+Gemini (Crítica/Importante/Informativa + sujeto).
- El clasificador keyword de Python queda como **fallback interno** de sus alertas, no como
  criterio mostrado al jurado. Idealmente las alertas del Admin deberían leer la criticidad
  de Node (pendiente, ver punch-list).

## El hueco real: dos bases de datos

Los procesos/actuaciones viven en **dos DBs sin sincronizar**. Para que la demo fluya:
- La vista **Abogado → Consultar** (Node) necesita el radicado registrado en la DB de Node.
- El resto (login, listado de procesos, tareas, auditoría) vive en Python.
- **Mínimo para la demo:** registrar los mismos radicados demo en ambos backends, y usar el
  radicado real `76001310300220230012600` como caso estrella (ya está en el seed de Node).
- **Puente recomendado (lado Node):** que `POST /api/procesos/:radicado/consultar` **auto-registre**
  el radicado en la DB de Node si no existe, antes de consultar. Así el Abogado consulta
  cualquier radicado del listado de Python sin pre-sembrarlo. (Sigue siendo "consulta a demanda".)

## Cómo correr todo (3 procesos)

```bash
# 1) Backend Python (core)
cd backend
.\venv\Scripts\activate
python -m uvicorn main:app --reload     # http://localhost:8000  (docs en /docs)

# 2) Backend Node (IA)
cd server
npm run dev                             # http://localhost:3001

# 3) Frontend
npm run dev                             # http://localhost:5173
```

Logins demo (Python seed): admin `administrativo@hg.com` / `demo123` (y los de abogado/cliente).

## Punch-list para pulir (con dueño sugerido)

1. **[Node · Juan Jose]** Puente de datos: auto-registrar radicado en `consultar` para que el
   Abogado consulte cualquier proceso del listado sin pre-seed.
2. **[Frontend · compartido]** Asegurar que cada vista pega al backend correcto y la demo fluye
   login → rol → vista (Abogado=Node, Cliente=mix, Admin=Python).
3. **[Python · Fajardo]** Que las alertas/actuaciones del Admin reflejen la criticidad de Node
   (o al menos no muestren una escala distinta a la del Abogado).
4. **[Python · Fajardo]** Confirmar usuarios demo (abogado/cliente/admin) y que el rol enrute bien.
5. **[Compartido]** Quitar/ocultar restos de datos mock que ya no se usan (MockContext) para que
   no haya "dos verdades" en pantalla.
6. **[Node · Juan Jose]** Habeas Data (RF-36): endpoint mínimo de solicitudes ARCO (tu hueco de H).
```
```
