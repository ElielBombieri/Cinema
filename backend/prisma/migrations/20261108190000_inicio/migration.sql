-- CreateEnum
CREATE TYPE "Papel" AS ENUM ('CLIENTE', 'OPERADOR');

-- CreateEnum
CREATE TYPE "StatusAssento" AS ENUM ('LIVRE', 'RESERVADO', 'VENDIDO');

-- CreateEnum
CREATE TYPE "StatusReserva" AS ENUM ('ABERTA', 'PAGA', 'EXPIRADA', 'CANCELADA');

-- CreateTable
CREATE TABLE "Usuario" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senhaHash" TEXT NOT NULL,
    "papel" "Papel" NOT NULL DEFAULT 'CLIENTE',

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Filme" (
    "id" SERIAL NOT NULL,
    "titulo" TEXT NOT NULL,
    "sinopse" TEXT NOT NULL,
    "duracaoMinutos" INTEGER NOT NULL,

    CONSTRAINT "Filme_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Sala" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,

    CONSTRAINT "Sala_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Assento" (
    "id" SERIAL NOT NULL,
    "salaId" INTEGER NOT NULL,
    "fila" TEXT NOT NULL,
    "numero" INTEGER NOT NULL,

    CONSTRAINT "Assento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Sessao" (
    "id" SERIAL NOT NULL,
    "filmeId" INTEGER NOT NULL,
    "salaId" INTEGER NOT NULL,
    "inicio" TIMESTAMP(3) NOT NULL,
    "preco" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "Sessao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AssentoSessao" (
    "id" SERIAL NOT NULL,
    "sessaoId" INTEGER NOT NULL,
    "assentoId" INTEGER NOT NULL,
    "status" "StatusAssento" NOT NULL DEFAULT 'LIVRE',
    "reservaExpiraEm" TIMESTAMP(3),
    "usuarioId" INTEGER,
    "reservaId" INTEGER,

    CONSTRAINT "AssentoSessao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Reserva" (
    "id" SERIAL NOT NULL,
    "usuarioId" INTEGER NOT NULL,
    "sessaoId" INTEGER NOT NULL,
    "expiraEm" TIMESTAMP(3) NOT NULL,
    "status" "StatusReserva" NOT NULL DEFAULT 'ABERTA',
    "criadaEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Reserva_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ingresso" (
    "id" SERIAL NOT NULL,
    "codigo" TEXT NOT NULL,
    "reservaId" INTEGER NOT NULL,
    "assentoSessaoId" INTEGER NOT NULL,
    "usuarioId" INTEGER NOT NULL,
    "sessaoId" INTEGER NOT NULL,
    "valor" DECIMAL(10,2) NOT NULL,
    "utilizadoEm" TIMESTAMP(3),
    "emitidoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Ingresso_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Sala_nome_key" ON "Sala"("nome");

-- CreateIndex
CREATE INDEX "Assento_salaId_idx" ON "Assento"("salaId");

-- CreateIndex
CREATE UNIQUE INDEX "Assento_salaId_fila_numero_key" ON "Assento"("salaId", "fila", "numero");

-- CreateIndex
CREATE INDEX "Sessao_inicio_idx" ON "Sessao"("inicio");

-- CreateIndex
CREATE INDEX "AssentoSessao_sessaoId_status_idx" ON "AssentoSessao"("sessaoId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "AssentoSessao_sessaoId_assentoId_key" ON "AssentoSessao"("sessaoId", "assentoId");

-- CreateIndex
CREATE INDEX "Reserva_usuarioId_status_idx" ON "Reserva"("usuarioId", "status");

-- CreateIndex
CREATE INDEX "Reserva_expiraEm_idx" ON "Reserva"("expiraEm");

-- CreateIndex
CREATE UNIQUE INDEX "Ingresso_codigo_key" ON "Ingresso"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "Ingresso_assentoSessaoId_key" ON "Ingresso"("assentoSessaoId");

-- CreateIndex
CREATE INDEX "Ingresso_sessaoId_idx" ON "Ingresso"("sessaoId");

-- AddForeignKey
ALTER TABLE "Assento" ADD CONSTRAINT "Assento_salaId_fkey" FOREIGN KEY ("salaId") REFERENCES "Sala"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sessao" ADD CONSTRAINT "Sessao_filmeId_fkey" FOREIGN KEY ("filmeId") REFERENCES "Filme"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sessao" ADD CONSTRAINT "Sessao_salaId_fkey" FOREIGN KEY ("salaId") REFERENCES "Sala"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssentoSessao" ADD CONSTRAINT "AssentoSessao_sessaoId_fkey" FOREIGN KEY ("sessaoId") REFERENCES "Sessao"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssentoSessao" ADD CONSTRAINT "AssentoSessao_assentoId_fkey" FOREIGN KEY ("assentoId") REFERENCES "Assento"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssentoSessao" ADD CONSTRAINT "AssentoSessao_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssentoSessao" ADD CONSTRAINT "AssentoSessao_reservaId_fkey" FOREIGN KEY ("reservaId") REFERENCES "Reserva"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reserva" ADD CONSTRAINT "Reserva_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reserva" ADD CONSTRAINT "Reserva_sessaoId_fkey" FOREIGN KEY ("sessaoId") REFERENCES "Sessao"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ingresso" ADD CONSTRAINT "Ingresso_reservaId_fkey" FOREIGN KEY ("reservaId") REFERENCES "Reserva"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ingresso" ADD CONSTRAINT "Ingresso_assentoSessaoId_fkey" FOREIGN KEY ("assentoSessaoId") REFERENCES "AssentoSessao"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ingresso" ADD CONSTRAINT "Ingresso_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ingresso" ADD CONSTRAINT "Ingresso_sessaoId_fkey" FOREIGN KEY ("sessaoId") REFERENCES "Sessao"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
