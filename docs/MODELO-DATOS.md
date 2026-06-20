# Modelo de datos — MVP (lo necesario y suficiente)

Entidades mínimas para cubrir los RF Esenciales sin sobre-diseñar. Tipos finales (SQLite/Postgres)
se concretan al elegir el stack. `id` = clave primaria; `*_id` = clave foránea.

## Núcleo (imprescindible para el MVP)

### usuario  · (RF-01..07, RBAC)
| Campo | Tipo | Notas |
|---|---|---|
| id | uuid/int | PK |
| nombre | texto | |
| email | texto | único |
| password_hash | texto | nunca en claro |
| rol | enum | `cliente` · `abogado` · `admin` |
| tarjeta_profesional | texto | solo abogado (RF-06) |
| activo | bool | desactivar cuenta (RF-03) |
| creado_en | timestamp | |

### proceso  · (RF-08, RF-10, RF-11, RF-14)
| Campo | Tipo | Notas |
|---|---|---|
| id | uuid/int | PK |
| radicado | texto(23) | único, validado 23 dígitos (RF-09) |
| cliente_id | FK→usuario | titular (RF-05) |
| jurisdiccion | enum | `civil` · `laboral` · `administrativo` (RF-11) |
| despacho | texto | |
| estado | enum | `E0`..`E4` (modelo de estados) |
| estado_label | texto | etiqueta legible |
| ultimo_estado_conocido | json/texto | snapshot para detección por diferencia (RF-14) |
| creado_por | FK→usuario | abogado que registró (RF-08) |
| creado_en | timestamp | |

### proceso_abogado  · (RF-07, N:M)
| Campo | Tipo | Notas |
|---|---|---|
| proceso_id | FK→proceso | |
| abogado_id | FK→usuario | uno o más abogados por proceso |
| (PK compuesta) | | |

### actuacion  · (RF-15, RF-16, RF-17, RF-18, RF-20)
| Campo | Tipo | Notas |
|---|---|---|
| id | uuid/int | PK |
| proceso_id | FK→proceso | |
| fecha | date | fecha en el expediente |
| tipo | texto | Auto, Notificación, Audiencia… |
| titulo | texto | |
| descripcion | texto | anotación cruda |
| criticidad | enum | `Critica` · `Importante` · `Informativa` (RF-18) |
| estado | enum | etapa E0..E4 mapeada (RF-20) |
| documento | texto | nombre/URL del PDF |
| detectada_en | timestamp | momento de detección (RF-16) |

### resumen  · (RF-21..25)
| Campo | Tipo | Notas |
|---|---|---|
| id | uuid/int | PK |
| actuacion_id | FK→actuacion | (o proceso_id para resumen de estado) |
| rol_destino | enum | `cliente` · `abogado` · `admin` |
| contenido | texto | salida del LLM |
| anonimizado | bool | datos de terceros seudonimizados antes de IA (RF-25) |
| modelo | texto | LLM usado (trazabilidad) |
| generado_en | timestamp | |

### comunicacion  · (RF-30..34) — **append-only**
| Campo | Tipo | Notas |
|---|---|---|
| id | uuid/int | PK |
| proceso_id | FK→proceso | |
| resumen_id | FK→resumen | qué se envió |
| destinatario | texto | correo / número |
| canal | enum | `correo` · `whatsapp` · `dashboard` (RF-27) |
| estado | enum | `enviado` · `entregado` · `visto` |
| enviado_en | timestamp | |
| hash_prev | texto | encadenamiento para inalterabilidad (RF-34) |

> Regla: la tabla `comunicacion` no admite UPDATE ni DELETE (solo INSERT). Cada fila guarda
> `hash_prev` = hash de la fila anterior → cadena verificable (RF-34, RNF-07).

### config_criticidad  · (RF-19, RF-29) — parámetros del admin
| Campo | Tipo | Notas |
|---|---|---|
| nivel | enum (PK) | `Critica` · `Importante` · `Informativa` |
| antelacion_dias | int | ventana de alerta (RF-19) |
| canal_default | enum | canal por defecto (RF-29) |

## Soporte / cumplimiento (si el tiempo lo permite)

### lectura_actuacion  · (RF-32) — quién vio qué
`id`, `usuario_id`→usuario, `actuacion_id`→actuacion, `visto_en` timestamp.

### tratamiento_datos  · (RF-35, RF-37, RF-38) — finalidad + base legal por proceso
`id`, `proceso_id`→proceso, `finalidad` texto (RF-35), `base_legitimacion` enum (`poder`·`consentimiento`, RF-38), `evidencia` texto/URL.

### solicitud_habeas  · (RF-36) — derechos ARCO
`id`, `titular_id`→usuario, `tipo` enum (`acceso`·`rectificacion`·`supresion`), `estado` enum (`pendiente`·`resuelta`), `creado_en`, `resuelto_en`.

## Relaciones (resumen)

- `usuario (cliente) 1—N proceso` (titular)
- `usuario (abogado) N—M proceso` vía `proceso_abogado`
- `proceso 1—N actuacion`
- `actuacion 1—N resumen`
- `resumen 1—N comunicacion`
- `proceso 1—1 tratamiento_datos`

## Índices clave

- `proceso.radicado` único.
- `actuacion (proceso_id, detectada_en)` para listar novedades por proceso.
- `comunicacion (proceso_id, enviado_en)` para el historial.

## Minimización (RF-37)

Solo se almacenan metadatos de seguimiento (radicado, fecha, juzgado, tipo de actuación,
descripción pública). No se guardan datos personales de terceros ajenos al litigio.
