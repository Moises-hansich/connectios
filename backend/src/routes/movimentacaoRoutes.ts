import { Router } from "express";

import { movimentacaoController } from "../controllers/movimentacaoController";
import { authMiddleware } from "../middlewares/authMiddleware";
import { exigirPermissao } from "../middlewares/permissaoMiddleware";

export const movimentacaoRoutes = Router();

movimentacaoRoutes.use(authMiddleware);

movimentacaoRoutes.get(
  "/",
  exigirPermissao("movimentacoes.visualizar"),
  movimentacaoController.listar,
);

movimentacaoRoutes.get(
  "/equipamento/:equipamentoId",
  exigirPermissao("movimentacoes.visualizar"),
  movimentacaoController.buscarPorEquipamento,
);

movimentacaoRoutes.get(
  "/:id",
  exigirPermissao("movimentacoes.visualizar"),
  movimentacaoController.buscarPorId,
);

movimentacaoRoutes.post(
  "/",
  exigirPermissao("movimentacoes.visualizar", "movimentacoes.registrar"),
  movimentacaoController.registrar,
);
