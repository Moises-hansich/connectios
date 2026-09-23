import { Router } from "express";

import { usuarioController } from "../controllers/usuarioController";
import { permissaoController } from "../controllers/permissaoController";

import { adminMiddleware } from "../middlewares/adminMiddleware";
import { authMiddleware } from "../middlewares/authMiddleware";
import { exigirPermissao } from "../middlewares/permissaoMiddleware";

const usuarioRoutes = Router();

usuarioRoutes.use(authMiddleware);

usuarioRoutes.get("/minhas-permissoes", permissaoController.minhas);

// Consulta específica para selecionar o responsável pela manutenção.
// Deve ficar antes de "/:id".
usuarioRoutes.get(
  "/tecnicos",
  exigirPermissao(
    "equipamentos.visualizar",
    "manutencoes.visualizar",
    "manutencoes.abrir",
  ),
  usuarioController.listarTecnicos,
);

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

// Gerenciamento de usuários.
usuarioRoutes.get("/", adminMiddleware, usuarioController.listar);

usuarioRoutes.get("/:id", adminMiddleware, usuarioController.buscarPorId);

usuarioRoutes.post("/", adminMiddleware, usuarioController.criar);

usuarioRoutes.put("/:id", adminMiddleware, usuarioController.atualizar);

usuarioRoutes.patch(
  "/:id/status",
  adminMiddleware,
  usuarioController.alterarStatus,
);

usuarioRoutes.delete("/:id", adminMiddleware, usuarioController.excluir);

export default usuarioRoutes;
