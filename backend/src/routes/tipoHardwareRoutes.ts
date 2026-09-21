import { Router } from "express";

import { tipoHardwareController } from "../controllers/tipoHardwareController";
import { authMiddleware } from "../middlewares/authMiddleware";
import { exigirPermissao } from "../middlewares/permissaoMiddleware";

const router = Router();

router.use(authMiddleware);

router.get("/", exigirPermissao("hardware.visualizar"), (req, res) =>
  tipoHardwareController.findAll(req, res),
);

router.get("/:id", exigirPermissao("hardware.visualizar"), (req, res) =>
  tipoHardwareController.findById(req, res),
);

router.post(
  "/",
  exigirPermissao("configuracoes.visualizar", "configuracoes.editar"),
  (req, res) => tipoHardwareController.create(req, res),
);

router.put(
  "/:id",
  exigirPermissao("configuracoes.visualizar", "configuracoes.editar"),
  (req, res) => tipoHardwareController.update(req, res),
);

router.delete(
  "/:id",
  exigirPermissao("configuracoes.visualizar", "configuracoes.editar"),
  (req, res) => tipoHardwareController.delete(req, res),
);

export default router;
