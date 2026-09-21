import { Router } from "express";

import { hardwareController } from "../controllers/hardwareController";
import { authMiddleware } from "../middlewares/authMiddleware";
import { exigirPermissao } from "../middlewares/permissaoMiddleware";

const router = Router();

router.use(authMiddleware);

router.get("/", exigirPermissao("hardware.visualizar"), (req, res) =>
  hardwareController.findAll(req, res),
);

router.get("/:id", exigirPermissao("hardware.visualizar"), (req, res) =>
  hardwareController.findById(req, res),
);

router.post(
  "/",
  exigirPermissao("hardware.visualizar", "hardware.criar"),
  (req, res) => hardwareController.create(req, res),
);

router.put(
  "/:id",
  exigirPermissao("hardware.visualizar", "hardware.editar"),
  (req, res) => hardwareController.update(req, res),
);

router.delete(
  "/:id",
  exigirPermissao("hardware.visualizar", "hardware.excluir"),
  (req, res) => hardwareController.delete(req, res),
);

export default router;
