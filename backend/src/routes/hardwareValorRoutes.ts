import { Router } from "express";

import { hardwareValorController } from "../controllers/hardwareValorController";
import { authMiddleware } from "../middlewares/authMiddleware";
import { exigirPermissao } from "../middlewares/permissaoMiddleware";

const hardwareValorRoutes = Router();

hardwareValorRoutes.use(authMiddleware);

hardwareValorRoutes.get(
  "/",
  exigirPermissao("hardware.visualizar"),
  (req, res) => hardwareValorController.findAll(req, res),
);

hardwareValorRoutes.get(
  "/hardware/:hardwareId",
  exigirPermissao("hardware.visualizar"),
  (req, res) => hardwareValorController.findByHardware(req, res),
);

hardwareValorRoutes.get(
  "/:id",
  exigirPermissao("hardware.visualizar"),
  (req, res) => hardwareValorController.findById(req, res),
);

// Adicionar um valor modifica as especificações de um hardware existente.
hardwareValorRoutes.post(
  "/",
  exigirPermissao("hardware.visualizar", "hardware.editar"),
  (req, res) => hardwareValorController.create(req, res),
);

hardwareValorRoutes.put(
  "/:id",
  exigirPermissao("hardware.visualizar", "hardware.editar"),
  (req, res) => hardwareValorController.update(req, res),
);

// Remove somente o valor de um campo, não o hardware.
hardwareValorRoutes.delete(
  "/:id",
  exigirPermissao("hardware.visualizar", "hardware.editar"),
  (req, res) => hardwareValorController.delete(req, res),
);

export default hardwareValorRoutes;
