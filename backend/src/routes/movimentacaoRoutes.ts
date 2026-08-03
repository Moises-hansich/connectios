import { Router } from "express";

import { movimentacaoController } from "../controllers/movimentacaoController";
import { authMiddleware } from "../middlewares/authMiddleware";
import { adminMiddleware } from "../middlewares/adminMiddleware";

export const movimentacaoRoutes = Router();

movimentacaoRoutes.use(authMiddleware);

movimentacaoRoutes.get("/", movimentacaoController.listar);

movimentacaoRoutes.get(
  "/equipamento/:equipamentoId",
  movimentacaoController.buscarPorEquipamento,
);

movimentacaoRoutes.get("/:id", movimentacaoController.buscarPorId);

movimentacaoRoutes.post("/", adminMiddleware, movimentacaoController.registrar);
