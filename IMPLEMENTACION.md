# Magic-Juris - Guía de Implementación y Testing

## ✅ IMPLEMENTACIÓN COMPLETADA

### Módulos A-B (Auth, Usuarios, Roles, Procesos, Radicados)
- ✅ Autenticación JWT completa
- ✅ Modelos User, LawyerProfile, Process
- ✅ RBAC por rol (ADMINISTRATIVO, ABOGADO, CLIENTE)
- ✅ Validación radicado (23 dígitos, solo números)
- ✅ Consulta por radicado
- ✅ Endpoints CRUD usuarios
- ✅ Endpoints CRUD procesos

### Módulo F (Alertas y Notificaciones)
- ✅ Modelo Alert y NotificationPreference
- ✅ Endpoints GET/PATCH para alertas
- ✅ Marcado de alertas como leídas
- ✅ Componente AlertsPanel en React
- ✅ Generación automática de alertas por actuaciones
- ✅ Niveles: ALTA, MEDIA, BAJA con colores

### Módulo G (Historial y Trazabilidad)
- ✅ Modelo AuditLog (append-only)
- ✅ Modelo CommunicationHistory
- ✅ Endpoints GET/POST para comunicaciones
- ✅ Export CSV para audit logs
- ✅ Componente HistoryPanel en React
- ✅ Registro automático de eventos

### Actuaciones Judiciales y Clasificación
- ✅ Modelo JudicialActuation
- ✅ Servicio de clasificación automática (ALTA/MEDIA/BAJA)
- ✅ Endpoint sync/{id} para sincronizar por proceso
- ✅ Endpoint /sync-all para sincronización global
- ✅ Generación de actuaciones mock
- ✅ Prevención de duplicados

### Seed Data Completo
- ✅ 3 usuarios (admin, abogado, cliente2)
- ✅ 5 procesos de ejemplo
- ✅ 8 actuaciones judiciales clasificadas
- ✅ 3 alertas de ejemplo
- ✅ 5 registros de audit
- ✅ 3 comunicaciones

### Servicios Frontend
- ✅ apiClient.js con métodos GET/POST/PUT/PATCH/DELETE
- ✅ authService.js (login, logout, getCurrentUser)
- ✅ processService.js (CRUD + sync-all)
- ✅ actuationService.js (get, sync, create)
- ✅ alertService.js (get, mark as read, unread count)
- ✅ auditService.js (get, export CSV, communications)
- ✅ userService.js (CRUD)

### Componentes React
- ✅ AlertsPanel.jsx (muestra alertas con badges por nivel)
- ✅ HistoryPanel.jsx (timeline de eventos con iconos)
- ✅ AuthContext con logout correcto
- ✅ Manejo de errores sin romper UI

---

## 🚀 CÓMO TESTEAR

### Backend
```bash
cd backend
.\venv\Scripts\activate
pip install -r requirements.txt
python -m uvicorn main:app --reload
```

Backend corre en: `http://localhost:8000`
Swagger docs: `http://localhost:8000/docs`

### Frontend (desarrollo)
```bash
npm run dev
```

Accede a: `http://localhost:5173`

### Frontend (build para producción)
```bash
npm run build
npm run preview
```

---

## 🔐 CREDENCIALES DEMO

### Admin (ADMINISTRATIVO)
- Email: `administrativo@hg.com`
- Contraseña: `demo123`
- Permisos: Ver todos procesos, usuarios, alertas, auditoría. Puede sincronizar todos.

### Abogado
- Email: `abogado@hg.com`
- Contraseña: `demo123`
- Permisos: Ver procesos asignados, actualizar procesos, registrar nuevos, sincronizar propios.

### Cliente
- Email: `cliente@hg.com`
- Contraseña: `demo123`
- Permisos: Ver solo sus procesos, ver historial simple, ver alertas básicas.

---

## 📊 ENDPOINTS PRINCIPALES

### Auth
- `POST /api/auth/login` → Token JWT
- `GET /api/auth/me` → Usuario actual
- `POST /api/auth/logout` → Limpia sesión

### Procesos
- `GET /api/processes` → Lista (filtrada por rol)
- `POST /api/processes` → Crear
- `GET /api/processes/{id}` → Detalle
- `GET /api/processes/radicado/{radicado}` → Buscar por radicado
- `PUT /api/processes/{id}` → Actualizar
- `DELETE /api/processes/{id}` → Eliminar
- `POST /api/processes/sync-all` → Sincronizar todos (admin only)

### Actuaciones
- `GET /api/actuaciones` → Lista
- `GET /api/actuaciones/process/{process_id}` → Por proceso
- `POST /api/actuaciones/{process_id}/sync` → Sincronizar un proceso
- `POST /api/actuaciones` → Crear manualmente

### Alertas
- `GET /api/alerts` → Lista (por rol)
- `GET /api/alerts/process/{process_id}` → Por proceso
- `PATCH /api/alerts/{alert_id}/read` → Marcar como leída
- `GET /api/alerts/unread/count` → Contador

### Auditoría
- `GET /api/audit` → Logs (por rol)
- `GET /api/audit/process/{process_id}` → Por proceso
- `GET /api/audit/export.csv` → Descargar CSV (admin only)
- `GET /api/audit/communications/process/{process_id}` → Comunicaciones
- `POST /api/audit/communications` → Registrar comunicación

### Usuarios
- `GET /api/users` → Lista (admin only)
- `GET /api/users/{id}` → Detalle (self or admin)
- `POST /api/users` → Crear (admin only)
- `PUT /api/users/{id}` → Actualizar (self or admin)
- `PATCH /api/users/{id}/role` → Cambiar rol (admin only)

---

## 🎯 FLUJO DE DEMOSTRACIÓN

### 1. Admin
1. Ingresa con `administrativo@hg.com` / `demo123`
2. Va a "Dashboard"
   - Ve 5 procesos listados
   - Ve estadísticas de estados
   - Puede ver alertas globales
3. Va a "Casos"
   - Tabla con todos los procesos
   - Puede filtrar por estado/jurisdicción
4. Botón "Actualizar datos"
   - Llama `/api/processes/sync-all`
   - Crea nuevas actuaciones mock
   - Genera nuevas alertas
5. Puede exportar auditoría (CSV)

### 2. Abogado
1. Ingresa con `abogado@hg.com` / `demo123`
2. Va a "Consulta"
   - Lista sus procesos asignados
   - Selecciona uno
   - Ve actuaciones del caso
3. Botón "Sincronizar Rama Judicial" en proceso
   - Llama `/api/actuaciones/{process_id}/sync`
   - Crea 2-4 actuaciones nuevas
   - Clasifica automáticamente
4. Ve alertas de sus casos
5. Va a "Registrar" para crear nuevo proceso

### 3. Cliente
1. Ingresa con `cliente@hg.com` / `demo123`
2. Ve sus casos (solo los propios)
3. Selecciona un caso
   - Ve historial simple
   - Ve comunicaciones de su abogado
   - NO ve detalles técnicos
4. Puede consultar por radicado (ve solo si es suyo)

---

## 📋 CLASIFICACIÓN DE ACTUACIONES

### ALTA (Crítica) - Rojo
- audiencia
- vencimiento / término
- fallo / sentencia
- notificación / mandamiento
- traslado con término
- requiere subsanar
- auto admite demanda

### MEDIA (Importante) - Amarillo
- traslado
- prueba
- contestación
- memorial
- recurso / apelación
- despacho
- auto que ordena

### BAJA (Informativa) - Verde
- constancia
- secretaría
- al despacho
- fijación en lista
- actualización
- archivo
- cambio menor

---

## 🔧 ARQUITECTURA

### Backend (Python/FastAPI)
```
backend/
├── main.py              → App FastAPI + seed
├── models.py            → SQLAlchemy models (7 total)
├── schemas.py           → Pydantic schemas
├── database.py          → Conexión SQLite
├── auth_utils.py        → JWT + hashing
├── deps.py              → Dependencias FastAPI
├── actuation_service.py → Clasificación lógica
└── routers/
    ├── auth.py
    ├── users.py
    ├── processes.py     (con sync-all)
    ├── actuaciones.py   (con sync individual)
    ├── alerts.py
    └── audit.py         (con export CSV)
```

### Frontend (React/Vite)
```
src/
├── App.jsx              → Router principal
├── context/
│   ├── AuthContext.jsx  → Auth state global
│   └── MockContext.jsx  → Fallback (no usado ahora)
├── services/
│   ├── apiClient.js
│   ├── authService.js
│   ├── processService.js
│   ├── actuationService.js
│   ├── alertService.js
│   ├── auditService.js
│   └── userService.js
├── pages/
│   ├── Login.jsx
│   ├── AdminDashboard.jsx
│   ├── AbogadoDashboard.jsx
│   └── ClienteDashboard.jsx
└── components/
    └── shared/
        ├── AlertsPanel.jsx      (nuevo)
        └── HistoryPanel.jsx     (nuevo)
```

### Base de datos (SQLite)
```
users
  - id, name, email, password_hash, role, is_active

lawyer_profiles
  - id, user_id, tarjeta_profesional

processes
  - id, radicado (único), jurisdiccion, tipo_participacion
  - cliente_id, abogado_id, etapa, estado

judicial_actuations
  - id, process_id, fecha, tipo, anotacion
  - clasificacion (ALTA/MEDIA/BAJA), urgencia
  - fuente (MOCK/RAMA_JUDICIAL)

alerts
  - id, process_id, user_id, tipo, nivel
  - mensaje, canal (interno/correo/whatsapp), leida

notification_preferences
  - id, user_id, email_enabled, whatsapp_enabled

audit_logs
  - id, user_id, process_id, action_type, description

communication_history
  - id, process_id, user_id, audience, channel, message
```

---

## ✨ CARACTERÍSTICAS ESPECIALES

### No implementado (por requerimiento):
- ❌ IA generativa real
- ❌ Rama Judicial real
- ❌ Envío de emails reales
- ❌ Envío de WhatsApp real

### Implementado como stub/mock:
- ✅ Sincronización mock (generación de datos de ejemplo)
- ✅ Alertas automáticas por actuaciones
- ✅ Clasificación por palabras clave
- ✅ Registros de auditoría completos

---

## 🎨 DISEÑO

- Color primario: `#84120C` (rojo HGD)
- Fondo: `#141414` / `#0D0D0D`
- Cards: `#1C1C1C`
- Bordes: `#3A3A3A`
- Texto: `#FFFFFF` / `#D9D9D9`
- Sin animaciones fuertes
- Estilo corporativo/jurídico
- Font principal: Inter
- Font headings: Sora

---

## 📝 VALIDACIONES

El sistema está completamente funcional para:
1. ✅ npm run build (sin errores)
2. ✅ Backend running (uvicorn)
3. ✅ Seed data poblado
4. ✅ RBAC por rol funcionando
5. ✅ Alertas generadas automáticamente
6. ✅ Historial registrado
7. ✅ Export CSV disponible
8. ✅ Clasificación automática

---

## 🚨 NOTAS IMPORTANTES

### Seguridad
- JWT con SECRET_KEY (ver .env.example)
- Passwords con bcrypt
- RBAC en cada endpoint
- Append-only para AuditLog (no delete)

### Escalabilidad
- SQLite → PostgreSQL/MySQL (cambiar DATABASE_URL)
- Cache de alertas sin implementar
- Polling de Rama Judicial sin implementar

### Próximas fases (no requeridas para MVP)
- Implementar real Rama Judicial integration
- Real email/SMS notifications
- WebSocket para live alerts
- Frontend de cliente simplificado
- Mobile app

---

Generado: 2026-06-19 | Magic-Juris v1.0
