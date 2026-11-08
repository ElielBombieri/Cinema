import bcrypt from "bcrypt";
import { prisma } from "./prisma.js";

const senhaCliente = "cliente123";
const senhaOperador = "operador123";

async function usuario(nome: string, email: string, senha: string, papel: "CLIENTE" | "OPERADOR") {
  const senhaHash = await bcrypt.hash(senha, 10);
  await prisma.usuario.upsert({
    where: { email },
    update: {},
    create: { nome, email, senhaHash, papel },
  });
}

async function main() {
  await usuario("Cliente Exemplo", "cliente@cinema.local", senhaCliente, "CLIENTE");
  await usuario("Bilheteria", "operador@cinema.local", senhaOperador, "OPERADOR");

  const jaTemFilme = await prisma.filme.count();
  if (jaTemFilme > 0) {
    console.log("Catálogo já existe. Usuários de exemplo garantidos.");
    console.log(`Cliente: cliente@cinema.local / ${senhaCliente}`);
    console.log(`Operador: operador@cinema.local / ${senhaOperador}`);
    return;
  }

  const filme = await prisma.filme.create({
    data: {
      titulo: "O Farol",
      sinopse: "Dois faroleiros enfrentam uma tempestade e um ao outro.",
      duracaoMinutos: 109,
    },
  });
  const outro = await prisma.filme.create({
    data: {
      titulo: "Noite na Cidade",
      sinopse: "Uma noite em que as ruas da cidade não dormem.",
      duracaoMinutos: 98,
    },
  });

  const sala = await prisma.sala.create({
    data: {
      nome: "Sala 1",
      assentos: {
        create: ["A", "B", "C"].flatMap((fila) =>
          [1, 2, 3, 4, 5].map((numero) => ({ fila, numero })),
        ),
      },
    },
    include: { assentos: true },
  });

  const amanha = new Date();
  amanha.setDate(amanha.getDate() + 1);
  amanha.setHours(19, 0, 0, 0);
  const depois = new Date(amanha);
  depois.setHours(21, 30, 0, 0);

  for (const item of [
    { filmeId: filme.id, inicio: amanha, preco: "30.00" },
    { filmeId: outro.id, inicio: depois, preco: "24.00" },
  ]) {
    await prisma.sessao.create({
      data: {
        filmeId: item.filmeId,
        salaId: sala.id,
        inicio: item.inicio,
        preco: item.preco,
        assentos: { create: sala.assentos.map((assento) => ({ assentoId: assento.id })) },
      },
    });
  }

  console.log("Banco populado.");
  console.log(`Cliente: cliente@cinema.local / ${senhaCliente}`);
  console.log(`Operador: operador@cinema.local / ${senhaOperador}`);
}

main()
  .catch((erro: unknown) => {
    console.error(erro);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
