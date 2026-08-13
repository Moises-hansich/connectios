import "dotenv/config";

import { prisma } from "../prisma";

async function executar() {
  const equipamentos = await prisma.equipamento.findMany({
    select: {
      id: true,
      nome: true,
      patrimonio: true,
    },
    orderBy: {
      id: "asc",
    },
  });

  let maiorNumero = 0;

  for (const equipamento of equipamentos) {
    const patrimonio = equipamento.patrimonio?.trim().toUpperCase();

    if (!patrimonio) {
      continue;
    }

    const resultado = /^PAT(\d+)$/.exec(patrimonio);

    if (!resultado) {
      continue;
    }

    const numero = Number(resultado[1]);

    if (Number.isInteger(numero) && numero > maiorNumero) {
      maiorNumero = numero;
    }
  }

  const equipamentosSemPatrimonio = equipamentos.filter(
    (equipamento) => !equipamento.patrimonio?.trim(),
  );

  if (equipamentosSemPatrimonio.length === 0) {
    console.log("Todos os equipamentos já possuem patrimônio.");
    return;
  }

  for (const equipamento of equipamentosSemPatrimonio) {
    maiorNumero += 1;

    const patrimonio = `PAT${String(maiorNumero).padStart(3, "0")}`;

    await prisma.equipamento.update({
      where: {
        id: equipamento.id,
      },
      data: {
        patrimonio,
      },
    });

    console.log(
      `${equipamento.nome} (ID ${equipamento.id}) recebeu ${patrimonio}`,
    );
  }

  console.log(
    `${equipamentosSemPatrimonio.length} equipamento(s) atualizado(s).`,
  );
}

executar()
  .catch((error) => {
    console.error("Erro ao preencher patrimônios:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
