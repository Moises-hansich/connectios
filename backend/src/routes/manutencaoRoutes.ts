import { Router } from "express";

import { manutencaoController } from "../controllers/manutencaoController";

export const manutencaoRoutes = Router();

manutencaoRoutes.get("/", manutencaoController.listar);

manutencaoRoutes.get(
  "/equipamento/:equipamentoId",
  manutencaoController.buscarPorEquipamento,
);

manutencaoRoutes.get("/:id", manutencaoController.buscarPorId);

manutencaoRoutes.post("/", manutencaoController.abrir);

manutencaoRoutes.patch("/:id/finalizar", manutencaoController.finalizar);
