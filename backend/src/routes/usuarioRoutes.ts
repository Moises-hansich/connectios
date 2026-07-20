import { Router } from "express";

import { usuarioController } from "../controllers/usuarioController";
import { adminMiddleware } from "../middlewares/adminMiddleware";
import { authMiddleware } from "../middlewares/authMiddleware";

const usuarioRoutes = Router();

usuarioRoutes.use(authMiddleware);

usuarioRoutes.get("/", usuarioController.listar);
usuarioRoutes.get("/:id", usuarioController.buscarPorId);

usuarioRoutes.post("/", adminMiddleware, usuarioController.criar);

usuarioRoutes.put("/:id", adminMiddleware, usuarioController.atualizar);

usuarioRoutes.patch(
  "/:id/status",
  adminMiddleware,
  usuarioController.alterarStatus,
);

usuarioRoutes.delete("/:id", adminMiddleware, usuarioController.excluir);

export default usuarioRoutes;
