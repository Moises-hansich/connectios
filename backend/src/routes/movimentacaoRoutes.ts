import { Router } from "express";

import { movimentacaoController } from "../controllers/movimentacaoController";

export const movimentacaoRoutes = Router();

movimentacaoRoutes.get("/", movimentacaoController.listar);

movimentacaoRoutes.get(
  "/equipamento/:equipamentoId",
  movimentacaoController.buscarPorEquipamento,
);

movimentacaoRoutes.get("/:id", movimentacaoController.buscarPorId);

movimentacaoRoutes.post("/", movimentacaoController.registrar);
