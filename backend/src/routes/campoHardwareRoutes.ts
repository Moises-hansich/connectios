import { Router } from "express";

import { campoHardwareController } from "../controllers/campoHardwareController";
import { authMiddleware } from "../middlewares/authMiddleware";
import { exigirPermissao } from "../middlewares/permissaoMiddleware";

const router = Router();

router.use(authMiddleware);

router.get("/", exigirPermissao("hardware.visualizar"), (req, res) =>
  campoHardwareController.findAll(req, res),
);

router.get("/:id", exigirPermissao("hardware.visualizar"), (req, res) =>
  campoHardwareController.findById(req, res),
);

router.post(
  "/",
  exigirPermissao("configuracoes.visualizar", "configuracoes.editar"),
  (req, res) => campoHardwareController.create(req, res),
);

router.put(
  "/:id",
  exigirPermissao("configuracoes.visualizar", "configuracoes.editar"),
  (req, res) => campoHardwareController.update(req, res),
);

router.delete(
  "/:id",
  exigirPermissao("configuracoes.visualizar", "configuracoes.editar"),
  (req, res) => campoHardwareController.delete(req, res),
);

export default router;
