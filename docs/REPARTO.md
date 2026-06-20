# Reparto de responsabilidades — MVP Reto 3 (MagicJuris · HG)

División de los 8 módulos de requerimientos (A–H) en dos bloques de 4, por fortalezas:
**Juan Jose** → IA + sistema (detección, clasificación, resúmenes, datos sensibles).
**Fajardo** → auth + UX + integraciones (login, formularios, notificaciones, historial UI).

## Juan Jose — IA + sistema

| Módulo | Alcance | RF (Esenciales en negrita) |
|---|---|---|
| **C. Monitoreo y detección** | Scraping a demanda, último estado conocido, detección por diferencia, timestamp de detección | **RF-13, RF-14, RF-15**, RF-16, RF-17 |
| **D. Clasificación de criticidad** | Reglas/IA Crítica/Importante/Informativa + mapeo a estados E0–E4 | **RF-18, RF-19**, RF-20 |
| **E. Resúmenes por rol** | LLM (cliente/abogado/admin) + **anonimización antes de IA** (RF-25) | **RF-21, RF-22**, RF-23, RF-24, RF-25 |
| **H. Habeas Data** | Finalidad del tratamiento, minimización, evidencia de legitimación | **RF-35, RF-36**, RF-37, RF-38 |

Total: 17 RF · 9 Esenciales. Pipeline coherente **detectar → clasificar → resumir → proteger**.

## Fajardo — auth + UX + integraciones

| Módulo | Alcance | RF (Esenciales en negrita) |
|---|---|---|
| **A. Auth, usuarios y roles** | Login por rol, RBAC, CRUD de usuarios, tarjeta profesional | **RF-01, RF-02, RF-03, RF-04, RF-05, RF-06**, RF-07 |
| **B. Registro y consulta** | Registrar proceso por radicado, validar 23 dígitos, jurisdicción | **RF-08, RF-10**, RF-09, RF-11, RF-12 |
| **F. Alertas y notificaciones** | Disparo de alertas + canales (correo/WhatsApp), agrupar informativas | RF-26, RF-27, RF-28, RF-29 |
| **G. Historial y trazabilidad** | Log append-only, vista de auditoría, exportar | **RF-30**, RF-31, RF-32, RF-33, RF-34 |

Total: 21 RF · 9 Esenciales.

## Camino crítico (orden de trabajo)

1. **Juntos:** cerrar el **esquema de datos** (`MODELO-DATOS.md`) y el **contrato de API**.
2. Fajardo: **A (auth/RBAC) + B (registro)** → desbloquean C.
3. Juan Jose: **C → D → E** (pipeline IA) sobre los procesos registrados.
4. Cierre: **F (alertas)** consume D/E; **G (historial)** consume E; **H** se cruza con anonimización (RF-25).

## Infra compartida (dueño único, acordar ya)

- **RBAC + esquema de usuarios** (RNF-06): base de Fajardo (A); el pipeline lo respeta.
- **Log inalterable** (RNF-07): infra de G (Fajardo); el pipeline escribe en él.
- **Cifrado TLS / at-rest** (RNF-04/05), DB e infra: dueño único.
- **Ley 1581 / consulta a demanda** (RNF-01/02): transversal, grueso en E + H (Juan Jose).
