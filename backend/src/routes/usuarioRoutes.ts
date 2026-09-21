import { Router } from "express";

import { usuarioController } from "../controllers/usuarioController";
import { permissaoController } from "../controllers/permissaoController";
import { adminMiddleware } from "../middlewares/adminMiddleware";
import { authMiddleware } from "../middlewares/authMiddleware";

const usuarioRoutes = Router();

usuarioRoutes.use(authMiddleware);

usuarioRoutes.get("/minhas-permissoes", permissaoController.minhas);

usuarioRoutes.get(
  "/permissoes/catalogo",
  adminMiddleware,
  permissaoController.catalogo,
);

usuarioRoutes.get(
  "/:id/permissoes",
  adminMiddleware,
  permissaoController.buscar,
);

usuarioRoutes.put(
  "/:id/permissoes",
  adminMiddleware,
  permissaoController.atualizar,
);

// Mantidas por enquanto: outras telas usam a lista de usuários,
// inclusive a seleção do técnico responsável.
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
