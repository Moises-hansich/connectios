import { Router } from "express";

import { fotoEquipamentoController } from "../controllers/fotoEquipamentoController";
import { adminMiddleware } from "../middlewares/adminMiddleware";
import { authMiddleware } from "../middlewares/authMiddleware";
import { uploadFotosEquipamento } from "../middlewares/uploadEquipamento";

export const fotoEquipamentoRoutes = Router();

fotoEquipamentoRoutes.use(authMiddleware);

fotoEquipamentoRoutes.get(
  "/:equipamentoId/fotos",
  fotoEquipamentoController.listarPorEquipamento,
);

fotoEquipamentoRoutes.post(
  "/:equipamentoId/fotos",
  adminMiddleware,
  uploadFotosEquipamento.array("fotos", 5),
  fotoEquipamentoController.adicionar,
);

fotoEquipamentoRoutes.patch(
  "/:equipamentoId/fotos/:fotoId/principal",
  adminMiddleware,
  fotoEquipamentoController.definirPrincipal,
);

fotoEquipamentoRoutes.delete(
  "/:equipamentoId/fotos/:fotoId",
  adminMiddleware,
  fotoEquipamentoController.excluir,
);
