import { Router } from "express";

import { fotoEquipamentoController } from "../controllers/fotoEquipamentoController";
import { authMiddleware } from "../middlewares/authMiddleware";
import { exigirPermissao } from "../middlewares/permissaoMiddleware";
import { uploadFotosEquipamento } from "../middlewares/uploadEquipamento";

export const fotoEquipamentoRoutes = Router();

fotoEquipamentoRoutes.use(authMiddleware);

fotoEquipamentoRoutes.get(
  "/:equipamentoId/fotos",
  exigirPermissao("equipamentos.visualizar", "fotos.visualizar"),
  fotoEquipamentoController.listarPorEquipamento,
);

fotoEquipamentoRoutes.post(
  "/:equipamentoId/fotos",
  exigirPermissao(
    "equipamentos.visualizar",
    "fotos.visualizar",
    "fotos.editar",
  ),
  uploadFotosEquipamento.array("fotos", 5),
  fotoEquipamentoController.adicionar,
);

fotoEquipamentoRoutes.patch(
  "/:equipamentoId/fotos/:fotoId/principal",
  exigirPermissao(
    "equipamentos.visualizar",
    "fotos.visualizar",
    "fotos.editar",
  ),
  fotoEquipamentoController.definirPrincipal,
);

fotoEquipamentoRoutes.delete(
  "/:equipamentoId/fotos/:fotoId",
  exigirPermissao(
    "equipamentos.visualizar",
    "fotos.visualizar",
    "fotos.editar",
  ),
  fotoEquipamentoController.excluir,
);
