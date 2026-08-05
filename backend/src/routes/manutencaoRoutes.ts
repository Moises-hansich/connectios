import { Router } from "express";

import { manutencaoController } from "../controllers/manutencaoController";
import { authMiddleware } from "../middlewares/authMiddleware";
import { adminMiddleware } from "../middlewares/adminMiddleware";

export const manutencaoRoutes = Router();

manutencaoRoutes.use(authMiddleware);

manutencaoRoutes.get("/", manutencaoController.listar);

manutencaoRoutes.get(
  "/equipamento/:equipamentoId/garantia",
  manutencaoController.consultarGarantia,
);

manutencaoRoutes.get(
  "/equipamento/:equipamentoId",
  manutencaoController.buscarPorEquipamento,
);

manutencaoRoutes.get("/:id", manutencaoController.buscarPorId);

manutencaoRoutes.post("/", adminMiddleware, manutencaoController.abrir);

manutencaoRoutes.patch(
  "/:id/finalizar",
  adminMiddleware,
  manutencaoController.finalizar,
);
