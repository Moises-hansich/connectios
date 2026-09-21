import { Router } from "express";

import { pecasController } from "../controllers/pecasController";
import { manutencaoController } from "../controllers/manutencaoController";

import { authMiddleware } from "../middlewares/authMiddleware";
import { exigirPermissao } from "../middlewares/permissaoMiddleware";

export const manutencaoRoutes = Router();

manutencaoRoutes.use(authMiddleware);

// Consultar opções para instalação, troca e retirada de peças.
manutencaoRoutes.get(
  "/pecas/opcoes",
  exigirPermissao("pecas.visualizar", "equipamentos.visualizar"),
  pecasController.opcoes,
);

// A operação pode abrir uma manutenção interna automaticamente.
manutencaoRoutes.post(
  "/pecas",
  exigirPermissao(
    "equipamentos.visualizar",
    "pecas.visualizar",
    "pecas.movimentar",
    "manutencoes.visualizar",
    "manutencoes.abrir",
  ),
  pecasController.registrar,
);

manutencaoRoutes.get(
  "/",
  exigirPermissao("manutencoes.visualizar"),
  manutencaoController.listar,
);

manutencaoRoutes.get(
  "/equipamento/:equipamentoId/garantia",
  exigirPermissao("equipamentos.visualizar", "manutencoes.visualizar"),
  manutencaoController.consultarGarantia,
);

manutencaoRoutes.get(
  "/equipamento/:equipamentoId",
  exigirPermissao("manutencoes.visualizar"),
  manutencaoController.buscarPorEquipamento,
);

manutencaoRoutes.get(
  "/:id",
  exigirPermissao("manutencoes.visualizar"),
  manutencaoController.buscarPorId,
);

manutencaoRoutes.post(
  "/",
  exigirPermissao(
    "equipamentos.visualizar",
    "manutencoes.visualizar",
    "manutencoes.abrir",
  ),
  manutencaoController.abrir,
);

manutencaoRoutes.patch(
  "/:id/finalizar",
  exigirPermissao("manutencoes.visualizar", "manutencoes.finalizar"),
  manutencaoController.finalizar,
);
