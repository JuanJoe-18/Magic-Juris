-- CreateTable
CREATE TABLE "Usuario" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nombre" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "rol" TEXT NOT NULL,
    "tarjetaProfesional" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "creadoEn" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Proceso" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "radicado" TEXT NOT NULL,
    "clienteId" TEXT NOT NULL,
    "jurisdiccion" TEXT NOT NULL,
    "despacho" TEXT,
    "estado" TEXT NOT NULL DEFAULT 'E0',
    "estadoLabel" TEXT,
    "ultimoEstadoConocido" TEXT,
    "creadoPorId" TEXT,
    "creadoEn" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Proceso_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Usuario" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Proceso_creadoPorId_fkey" FOREIGN KEY ("creadoPorId") REFERENCES "Usuario" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ProcesoAbogado" (
    "procesoId" TEXT NOT NULL,
    "abogadoId" TEXT NOT NULL,

    PRIMARY KEY ("procesoId", "abogadoId"),
    CONSTRAINT "ProcesoAbogado_procesoId_fkey" FOREIGN KEY ("procesoId") REFERENCES "Proceso" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ProcesoAbogado_abogadoId_fkey" FOREIGN KEY ("abogadoId") REFERENCES "Usuario" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Actuacion" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "procesoId" TEXT NOT NULL,
    "fecha" DATETIME NOT NULL,
    "tipo" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "criticidad" TEXT NOT NULL,
    "estado" TEXT NOT NULL,
    "documento" TEXT,
    "claveFuente" TEXT,
    "detectadaEn" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Actuacion_procesoId_fkey" FOREIGN KEY ("procesoId") REFERENCES "Proceso" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Resumen" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "actuacionId" TEXT NOT NULL,
    "rolDestino" TEXT NOT NULL,
    "contenido" TEXT NOT NULL,
    "anonimizado" BOOLEAN NOT NULL DEFAULT false,
    "modelo" TEXT,
    "generadoEn" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Resumen_actuacionId_fkey" FOREIGN KEY ("actuacionId") REFERENCES "Actuacion" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Comunicacion" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "procesoId" TEXT NOT NULL,
    "resumenId" TEXT,
    "destinatario" TEXT NOT NULL,
    "canal" TEXT NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'enviado',
    "enviadoEn" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "hashPrev" TEXT,
    CONSTRAINT "Comunicacion_procesoId_fkey" FOREIGN KEY ("procesoId") REFERENCES "Proceso" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Comunicacion_resumenId_fkey" FOREIGN KEY ("resumenId") REFERENCES "Resumen" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ConfigCriticidad" (
    "nivel" TEXT NOT NULL PRIMARY KEY,
    "antelacionDias" INTEGER NOT NULL,
    "canalDefault" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "LecturaActuacion" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "usuarioId" TEXT NOT NULL,
    "actuacionId" TEXT NOT NULL,
    "vistoEn" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "LecturaActuacion_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "LecturaActuacion_actuacionId_fkey" FOREIGN KEY ("actuacionId") REFERENCES "Actuacion" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TratamientoDatos" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "procesoId" TEXT NOT NULL,
    "finalidad" TEXT NOT NULL,
    "baseLegitimacion" TEXT NOT NULL,
    "evidencia" TEXT,
    CONSTRAINT "TratamientoDatos_procesoId_fkey" FOREIGN KEY ("procesoId") REFERENCES "Proceso" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SolicitudHabeas" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "titularId" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'pendiente',
    "creadoEn" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resueltoEn" DATETIME,
    CONSTRAINT "SolicitudHabeas_titularId_fkey" FOREIGN KEY ("titularId") REFERENCES "Usuario" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Proceso_radicado_key" ON "Proceso"("radicado");

-- CreateIndex
CREATE INDEX "Actuacion_procesoId_detectadaEn_idx" ON "Actuacion"("procesoId", "detectadaEn");

-- CreateIndex
CREATE INDEX "Actuacion_procesoId_claveFuente_idx" ON "Actuacion"("procesoId", "claveFuente");

-- CreateIndex
CREATE INDEX "Comunicacion_procesoId_enviadoEn_idx" ON "Comunicacion"("procesoId", "enviadoEn");

-- CreateIndex
CREATE UNIQUE INDEX "TratamientoDatos_procesoId_key" ON "TratamientoDatos"("procesoId");
