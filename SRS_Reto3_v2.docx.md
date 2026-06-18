**ESPECIFICACIÓN DE REQUERIMIENTOS DE SOFTWARE**

(SRS — IEEE 830 \+ Historias de Usuario)

**Sistema de Seguimiento Judicial y Atención Proactiva al Cliente**

*Nombre de trabajo del producto — sujeto a definición del equipo*

**Evento:** Legal Hack Icesi 2026

**Reto:** Reto 3 — Seguimiento Judicial (monitoreo automatizado y atención proactiva al cliente)

**Organizador / Cliente:** Hurtado Gandini Abogados S.A.S.

**Equipo:** \[completar\]

**Fecha:** Junio de 2026

### **Control de versiones**

| Versión | Fecha | Autor | Descripción del cambio |
| :---- | :---- | :---- | :---- |
| **1.0** | 18/06/2026 | Equipo | Versión inicial: identificación de requerimientos. |
| **1.1** | 18/06/2026 | Equipo | RF reformulados como historias de usuario con rol explícito. |

# **Tabla de contenido**

*(En Word: clic derecho sobre la tabla → “Actualizar campos” para regenerar los números de página.)*

# **1\. Introducción**

## **1.1 Propósito**

Este documento especifica los requerimientos del sistema de seguimiento judicial y atención proactiva al cliente desarrollado para el Reto 3 del Legal Hack Icesi 2026\. Cada requerimiento funcional se formula como historia de usuario (Como \[rol\], quiero \[acción\] para \[beneficio\]), garantizando trazabilidad entre el actor, la funcionalidad y su justificación.

## **1.2 Alcance del producto**

El sistema monitorea automáticamente el estado de procesos judiciales registrados por la firma en la Rama Judicial de Colombia, detecta nuevas actuaciones, las clasifica por nivel de criticidad y genera comunicaciones proactivas y personalizadas según el perfil del destinatario. La plataforma es multiusuario y jerarquizada por rol (Cliente, Abogado, Administración), de modo que un mismo hecho procesal se traduce a tres niveles de lenguaje y detalle distintos.

**Valor base:** facilitar la revisión de expedientes, equiparable a soluciones existentes (NeoJurídico, Monolegal, Litigando, entre otras). **Valor agregado y diferenciador:** trazabilidad integral de las comunicaciones y un tratamiento de datos personales conforme al régimen de Habeas Data, incorporado desde el diseño, junto con una experiencia diferenciada por rol.

## **1.3 Roles del sistema**

Cada requerimiento funcional se asocia a uno de los siguientes roles:

| Rol | Abreviatura | Descripción |
| :---- | :---- | :---- |
| **Abogado** | Abogado | Profesional del derecho con 40–120 procesos activos. Registra procesos, recibe alertas priorizadas y resúmenes técnicos. |
| **Cliente** | Cliente | Persona natural o jurídica sin formación jurídica. Consulta el estado de sus procesos en lenguaje claro y recibe notificaciones. |
| **Administración** | Admin | Gestión de la firma. Audita comunicaciones, gestiona usuarios/roles, supervisa cumplimiento de Habeas Data. |
| **Sistema** | Sistema | Procesos automatizados que no requieren interacción humana directa (monitoreo, clasificación, resiliencia). |

## **1.4 Definiciones, acrónimos y abreviaturas**

| Término | Definición |
| :---- | :---- |
| **Actuación** | Cada acto o providencia que se registra en el expediente judicial (auto, fijación de audiencia, traslado, fallo, constancia, etc.). |
| **Radicado** | Número único de identificación del proceso (23 dígitos) asignado por la Rama Judicial. |
| **CGP** | Código General del Proceso (Ley 1564 de 2012). |
| **SIC** | Superintendencia de Industria y Comercio (autoridad de protección de datos). |
| **Habeas Data** | Derecho a conocer, actualizar y rectificar los datos personales propios (Ley 1581 de 2012). |
| **Consulta a demanda** | Modelo en que la consulta se ejecuta solo sobre procesos previamente registrados por un usuario autorizado, en contraposición a la recolección masiva indiscriminada. |
| **RBAC** | Control de acceso basado en roles (Role-Based Access Control). |
| **Historia de usuario** | Formato: Como \[rol\], quiero \[acción\] para \[beneficio\]. |

## **1.5 Referencias normativas y técnicas**

* Ley 1564 de 2012 (CGP): arts. 110–121 (notificaciones y términos), 133 (nulidades), 203 (silencio procesal), 295 (notificación por estado).

* Ley 270 de 1996 (Estatutaria de la Administración de Justicia): arts. 95 y 96\.

* Ley 1437 de 2011 (CPACA): notificaciones en lo contencioso-administrativo.

* Ley 1581 de 2012 (Habeas Data) y su régimen reglamentario.

* Acuerdo PCSJA16-10554 del Consejo Superior de la Judicatura.

* Resolución SIC 58834 de 2023 (“Caso Dataset”): precedente contra web scraping masivo.

* Enunciado Oficial de Retos, Legal Hack Icesi 2026 (Reto 3).

* Estado del Arte: Sistemas LegalTech en Colombia — Automatización y Seguimiento de Procesos Judiciales.

## **1.6 Visión general del documento**

La Sección 2 describe restricciones y supuestos. La Sección 3 contiene el catálogo de requerimientos funcionales (RF) como historias de usuario y los no funcionales (RNF). La Sección 4 define el modelo de estados del proceso judicial. La Sección 5 presenta la matriz de trazabilidad contra los criterios del jurado. La Sección 6 recoge decisiones abiertas.

# **2\. Restricciones y supuestos**

## **2.1 Restricciones generales**

**R-01 (Legal — datos públicos).** La obtención de datos debe ceñirse al precedente de la SIC (Caso Dataset): no se permite recolección masiva indiscriminada. El sistema opera exclusivamente bajo consulta a demanda sobre procesos registrados por un abogado autenticado, con base de legitimación (poder/mandato).

**R-02 (Técnica — ausencia de API).** La Rama Judicial no ofrece una API pública; la captura depende de consulta/extracción del portal, que es inestable y puede cambiar de estructura. Esto impone requerimientos de resiliencia y tolerancia a fallos.

**R-03 (Legal — Habeas Data).** Todo tratamiento de datos personales de clientes y partes procesales debe cumplir la Ley 1581 de 2012: finalidad declarada, minimización, acceso y supresión.

**R-04 (Procesal — el reloj no se detiene).** Conforme al art. 295 del CGP, los términos corren con independencia de que la consulta automatizada falle. Una omisión puede acarrear responsabilidad disciplinaria; la confiabilidad es, por tanto, crítica.

## **2.2 Supuestos y dependencias**

* La firma cuenta con poder o mandato vigente sobre los procesos que registra.

* La fuente oficial mantiene públicamente consultable la información procesal.

* El uso de IA generativa de terceros (p. ej., LLMs) requiere anonimización previa de datos sensibles de terceros.

# **3\. Requerimientos específicos**

**Formato:** cada RF se formula como historia de usuario: ***Como \[rol\], quiero \[acción\] para \[beneficio\].***

**Leyenda de prioridad: Esencial** \= imprescindible para el MVP (criterio del jurado). **Alta** \= fuerte impacto en la calidad. **Media** \= deseable si el tiempo lo permite.

## **3.1 Requerimientos funcionales (RF)**

### **Módulo A — Autenticación, usuarios y roles**

| Código | Rol | Historia de usuario | Prioridad |
| :---- | ----- | :---- | ----- |
| **RF-01** | **Abogado** | Como abogado, quiero autenticarme con mis credenciales individuales para acceder únicamente a los procesos bajo mi responsabilidad. | **Esencial** |
| **RF-02** | **Cliente** | Como cliente, quiero autenticarme con mis credenciales para consultar exclusivamente mis propios procesos. | **Esencial** |
| **RF-03** | **Admin** | Como administrador, quiero gestionar (crear, modificar y desactivar) cuentas de usuario para controlar quién accede al sistema. | **Esencial** |
| **RF-04** | **Sistema** | Como sistema, debo soportar tres perfiles con permisos diferenciados (Cliente, Abogado, Administración) para garantizar el control de acceso por roles (RBAC). | **Esencial** |
| **RF-05** | **Sistema** | Como sistema, debo restringir la visibilidad de cada proceso al cliente titular, al/los abogado(s) asignado(s) y a la Administración, para proteger la confidencialidad de la información procesal. | **Esencial** |
| **RF-06** | **Abogado** | Como abogado, quiero que el sistema exija mi número de tarjeta profesional al registrarme para que exista trazabilidad sobre la credencial que habilita la consulta. | **Esencial** |
| **RF-07** | **Admin** | Como administrador, quiero asignar uno o más abogados a cada proceso para definir quién es responsable de su seguimiento. | **Alta** |

### **Módulo B — Registro y consulta de procesos**

| Código | Rol | Historia de usuario | Prioridad |
| :---- | ----- | :---- | ----- |
| **RF-08** | **Abogado** | Como abogado, quiero registrar un proceso ingresando su número de radicado (23 dígitos) y asociándolo a un cliente, para que el sistema comience a monitorearlo. | **Esencial** |
| **RF-09** | **Sistema** | Como sistema, debo validar el formato del número de radicado en el momento del registro para evitar errores de captura. | **Alta** |
| **RF-10** | **Sistema** | Como sistema, debo consultar la Rama Judicial únicamente sobre procesos previamente registrados por un abogado autenticado (consulta a demanda), para cumplir con el precedente de la SIC y no incurrir en recolección masiva. | **Esencial** |
| **RF-11** | **Sistema** | Como sistema, debo identificar y almacenar la jurisdicción o rama del proceso (civil, laboral, administrativo, entre otras) para diferenciar los regímenes de términos y notificaciones. | **Alta** |
| **RF-12** | **Cliente** | Como cliente, quiero ver el número de radicado de mi proceso para poder referenciarlo en comunicaciones con mi abogado. | **Media** |

### **Módulo C — Monitoreo y detección de actuaciones**

| Código | Rol | Historia de usuario | Prioridad |
| :---- | ----- | :---- | ----- |
| **RF-13** | **Sistema** | Como sistema, debo consultar periódicamente la fuente oficial para cada proceso registrado, según una frecuencia configurable, para detectar cambios oportunamente. | **Esencial** |
| **RF-14** | **Sistema** | Como sistema, debo almacenar el último estado conocido de cada proceso como respaldo, para tener una línea base contra la cual comparar nuevas actuaciones. | **Esencial** |
| **RF-15** | **Sistema** | Como sistema, debo detectar nuevas actuaciones comparando el estado actual contra el último estado conocido (detección por diferencia), para identificar cualquier novedad procesal. | **Esencial** |
| **RF-16** | **Sistema** | Como sistema, debo registrar la fecha y hora exactas en que detecté cada nueva actuación, para respaldar la trazabilidad temporal. | **Alta** |
| **RF-17** | **Abogado** | Como abogado, quiero ver la secuencia completa de actuaciones realizadas durante el proceso (qué se hizo y cuándo), diferenciada por jurisdicción, para tener el contexto histórico completo. | **Alta** |

### **Módulo D — Clasificación de criticidad**

| Código | Rol | Historia de usuario | Prioridad |
| :---- | ----- | :---- | ----- |
| **RF-18** | **Sistema** | Como sistema, debo clasificar cada actuación detectada en uno de tres niveles — Crítica (audiencia, vencimiento de término, fallo), Importante (traslado, solicitud de prueba) o Informativa (constancia de secretaría) — para priorizar las alertas. | **Esencial** |
| **RF-19** | **Admin** | Como administrador, quiero configurar la ventana de antelación distinta para cada nivel de criticidad, para ajustar los tiempos de alerta a la operación de la firma. | **Esencial** |
| **RF-20** | **Sistema** | Como sistema, debo mapear cada actuación a su etapa dentro del modelo de estados del proceso (Sección 4\) para contextualizar en qué fase se encuentra el litigio. | **Alta** |

### **Módulo E — Generación de resúmenes por rol**

| Código | Rol | Historia de usuario | Prioridad |
| :---- | ----- | :---- | ----- |
| **RF-21** | **Cliente** | Como cliente, quiero recibir un resumen en lenguaje claro y comprensible (sin jerga jurídica) para entender qué pasa con mi proceso sin necesidad de formación legal. | **Esencial** |
| **RF-22** | **Cliente** | Como cliente, quiero que el resumen distinga explícitamente lo que ya ocurrió, lo que está por ocurrir y las acciones que se requieren de mi parte, para saber si debo hacer algo. | **Esencial** |
| **RF-23** | **Abogado** | Como abogado, quiero recibir un resumen técnico-jurídico más denso que el del cliente, para evaluar rápidamente la situación procesal sin abrir el expediente completo. | **Alta** |
| **RF-24** | **Admin** | Como administrador, quiero un resumen agregado o ejecutivo de la cartera de procesos, para supervisar la operación general de la firma. | **Media** |
| **RF-25** | **Sistema** | Como sistema, debo anonimizar o seudonimizar los datos personales de terceros no vinculados al litigio antes de enviar texto a servicios de IA generativa externos, para cumplir la Ley 1581 y proteger el secreto profesional. | **Alta** |

### **Módulo F — Alertas y notificaciones**

| Código | Rol | Historia de usuario | Prioridad |
| :---- | ----- | :---- | ----- |
| **RF-26** | **Abogado** | Como abogado, quiero recibir alertas ante actuaciones que exijan respuesta procesal, con la antelación correspondiente a su criticidad, para no dejar vencer términos. | **Esencial** |
| **RF-27** | **Cliente** | Como cliente, quiero ser notificado de las actuaciones relevantes de mi proceso a través de los canales configurados (correo, WhatsApp), para estar informado sin tener que consultar manualmente. | **Alta** |
| **RF-28** | **Abogado** | Como abogado, quiero que las actuaciones informativas (de mero trámite) se agrupen o silencien, para evitar la fatiga de alertas y concentrarme en lo crítico. | **Media** |
| **RF-29** | **Admin** | Como administrador, quiero configurar, por nivel de criticidad, el canal y la antelación de cada notificación, para adaptar el sistema a las políticas internas de la firma. | **Media** |

### **Módulo G — Historial y trazabilidad**

| Código | Rol | Historia de usuario | Prioridad |
| :---- | ----- | :---- | ----- |
| **RF-30** | **Admin** | Como administrador, quiero que el sistema mantenga, por proceso, un historial de todas las comunicaciones enviadas al cliente (contenido, destinatario, canal, fecha/hora), para poder auditar qué se informó y cuándo. | **Esencial** |
| **RF-31** | **Abogado** | Como abogado, quiero consultar el historial de comunicaciones enviadas a mi cliente, para saber exactamente qué información ya recibió. | **Alta** |
| **RF-32** | **Sistema** | Como sistema, debo registrar qué usuario visualizó cada actuación y cuándo, para respaldar la trazabilidad de lectura. | **Alta** |
| **RF-33** | **Admin** | Como administrador, quiero exportar el historial de comunicaciones con fines de auditoría, para responder ante requerimientos internos o externos. | **Alta** |
| **RF-34** | **Sistema** | Como sistema, no debo permitir la alteración ni el borrado de los registros del historial de comunicaciones (registro inalterable / append-only), para garantizar su valor probatorio. | **Alta** |

### **Módulo H — Cumplimiento de Habeas Data (Ley 1581\)**

| Código | Rol | Historia de usuario | Prioridad |
| :---- | ----- | :---- | ----- |
| **RF-35** | **Sistema** | Como sistema, debo registrar y conservar la finalidad declarada del tratamiento de los datos personales de cada titular, para demostrar la base de licitud del tratamiento. | **Esencial** |
| **RF-36** | **Admin** | Como administrador, quiero un mecanismo para atender solicitudes de acceso, rectificación y supresión de datos de los titulares, para cumplir con los derechos de Habeas Data. | **Esencial** |
| **RF-37** | **Sistema** | Como sistema, debo almacenar únicamente los metadatos necesarios para el seguimiento (radicado, fecha, juzgado, tipo de actuación), aplicando minimización de datos, para reducir la exposición de información sensible. | **Alta** |
| **RF-38** | **Abogado** | Como abogado, quiero que el sistema conserve evidencia de la base de legitimación (poder/mandato o consentimiento) que habilita el tratamiento de datos de cada proceso, para respaldar la licitud de la consulta ante la SIC. | **Alta** |

## **3.2 Requerimientos no funcionales (RNF)**

### **Cumplimiento legal**

| Código | Rol | Historia de usuario | Prioridad |
| :---- | ----- | :---- | ----- |
| **RNF-01** | **Sistema** | La obtención de datos deberá ajustarse al precedente de la SIC (Res. 58834/2023), operando bajo consulta a demanda y nunca por recolección masiva. | **Esencial** |
| **RNF-02** | **Sistema** | El tratamiento de datos personales deberá cumplir la Ley 1581 de 2012\. | **Esencial** |
| **RNF-03** | **Sistema** | El sistema deberá respetar el régimen de publicidad y acceso a la información de la Ley 270 de 1996 (arts. 95 y 96). | **Media** |

### **Seguridad**

| Código | Rol | Historia de usuario | Prioridad |
| :---- | ----- | :---- | ----- |
| **RNF-04** | **Sistema** | Toda comunicación deberá cifrarse en tránsito (TLS 1.2 o superior). | **Alta** |
| **RNF-05** | **Sistema** | Los datos en reposo deberán almacenarse cifrados. | **Alta** |
| **RNF-06** | **Sistema** | El acceso a la información deberá controlarse por roles (RBAC). | **Esencial** |
| **RNF-07** | **Sistema** | El sistema deberá mantener registros (logs) de auditoría inalterables. | **Alta** |

### **Rendimiento**

| Código | Rol | Historia de usuario | Prioridad |
| :---- | ----- | :---- | ----- |
| **RNF-08** | **Sistema** | El sistema deberá soportar el monitoreo simultáneo de al menos 120 procesos activos por abogado. | **Alta** |
| **RNF-09** | **Sistema** | La detección de una nueva actuación deberá reflejarse en el sistema dentro de la ventana de frecuencia definida. | **Alta** |

### **Usabilidad**

| Código | Rol | Historia de usuario | Prioridad |
| :---- | ----- | :---- | ----- |
| **RNF-10** | **Cliente** | Los resúmenes dirigidos al cliente deberán ser comprensibles por una persona sin formación jurídica. | **Esencial** |
| **RNF-11** | **Sistema** | Cada perfil de usuario deberá contar con una interfaz adecuada a su rol y nivel de información. | **Alta** |

### **Confiabilidad y resiliencia**

| Código | Rol | Historia de usuario | Prioridad |
| :---- | ----- | :---- | ----- |
| **RNF-12** | **Sistema** | Ante indisponibilidad de la fuente oficial (errores HTTP 5xx), el sistema deberá reintentar con retroceso exponencial y encolar la consulta hasta completarla, sin pérdida de actuaciones. | **Esencial** |
| **RNF-13** | **Sistema** | La estrategia de extracción deberá tolerar cambios menores en la estructura del portal (extracción semántica/adaptativa, no rutas rígidas). | **Alta** |

### **Mantenibilidad y escalabilidad**

| Código | Rol | Historia de usuario | Prioridad |
| :---- | ----- | :---- | ----- |
| **RNF-14** | **Sistema** | La arquitectura deberá ser modular para permitir incorporar nuevas fuentes o jurisdicciones sin rediseño mayor. | **Media** |
| **RNF-15** | **Sistema** | El sistema deberá registrar métricas operativas (consultas exitosas/fallidas, latencia) para su monitoreo. | **Media** |

# **4\. Modelo de estados del proceso judicial**

Aplica a procesos iniciados por demanda. El modelo es la base para mapear cada actuación a una etapa (RF-20), calcular criticidad (RF-18) y derivar la antelación de las alertas (RF-19). Las transiciones marcadas como “por definir” deben completarse por el equipo (ver Sección 6).

| Estado | Descripción | Transiciones y términos asociados |
| :---- | :---- | :---- |
| **E0 — Registrado** | El proceso fue cargado en el sistema por su radicado; aún sin actuación monitoreada. | → E1 al detectarse la primera providencia. |
| **E1 — Admisión** | El juez decide sobre la admisión de la demanda. | Admite → E2. Inadmite → 5 días hábiles para subsanar (art. 90 CGP), luego vuelve a E1 o Rechazo → fin. |
| **E2 — Apertura** | Surtida la admisión y notificaciones, se fija audiencia inicial (art. 372 CGP); empiezan a correr términos según el tipo de proceso. | → E3 al fijarse fecha de audiencia y vencerse términos. Notificaciones: arts. 110–121 y 295 CGP. |
| **E3 — Trámite / pruebas** | Por definir: práctica de pruebas, traslados, incidentes. | Por definir. |
| **E4 — Decisión / fallo** | Por definir: sentencia, recursos, ejecución. | Por definir. |

**Nota:** la clasificación de criticidad se ancla a este modelo. Ejemplos: “fijación de fecha de audiencia” y “vencimiento de término” \= Crítica; “traslado / solicitud de prueba” \= Importante; “constancia de secretaría / obedézcase y cúmplase” \= Informativa.

# **5\. Matriz de trazabilidad (criterio del jurado → requerimiento)**

Cada criterio de evaluación del Reto 3 queda cubierto por uno o más requerimientos. Esta matriz permite demostrar al jurado que la solución responde a lo que se calificará.

| Criterio de evaluación (Reto 3\) | Requerimientos asociados |
| :---- | :---- |
| **Cobertura de actuaciones (detección y clasificación por tipo, diferenciando ramas y acciones)** | RF-11, RF-13, RF-15, RF-17, RF-18, RF-20 |
| **Calidad del resumen (comprensible para un no abogado, lenguaje simple)** | RF-21, RF-22, RF-23, RNF-10 |
| **Sistema de alertas (distingue urgencia; cada nivel con tiempo distinto)** | RF-18, RF-19, RF-26, RF-28, RF-29 |
| **Cumplimiento Ley 1581 (qué datos, finalidad, acceso, supresión)** | RF-35, RF-36, RF-37, RF-38, RNF-01, RNF-02 |
| **Trazabilidad (registro auditable de qué se comunicó y cuándo; historial)** | RF-16, RF-30, RF-31, RF-32, RF-33, RF-34, RNF-07 |

## **5.1 Resumen de cobertura por rol**

Distribución de los requerimientos funcionales por actor:

| Rol | Requerimientos funcionales | Total |
| :---- | :---- | :---- |
| **Abogado** | RF-01, RF-06, RF-08, RF-17, RF-23, RF-26, RF-28, RF-31, RF-38 | 9 |
| **Cliente** | RF-02, RF-12, RF-21, RF-22, RF-27 | 5 |
| **Admin** | RF-03, RF-07, RF-19, RF-24, RF-29, RF-30, RF-33, RF-36 | 8 |
| **Sistema** | RF-04, RF-05, RF-09, RF-10, RF-11, RF-13, RF-14, RF-15, RF-16, RF-18, RF-20, RF-25, RF-32, RF-34, RF-35, RF-37 | 16 |

# **6\. Supuestos y decisiones abiertas**

Decisiones que el equipo debe cerrar para fijar el alcance del MVP:

* **Modelo de estados:** completar las etapas E3 y E4 con sus términos procesales.

* **Frecuencia de consulta (RNF-09):** definir cada cuánto se monitorea cada proceso (p. ej., cada 4 horas, 6 veces/día).

* **Canal de notificación:** decidir si en el prototipo el canal (WhatsApp/correo) es real o simulado.

* **Alcance de jurisdicciones:** confirmar si el MVP cubre solo civil o también laboral y administrativo.

* **Nombre del producto:** definir nombre comercial definitivo.