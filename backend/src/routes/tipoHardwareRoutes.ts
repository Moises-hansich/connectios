import { Router } from "express";
import { tipoHardwareController } from "../controllers/tipoHardwareController";

const tipoHardwareRoutes = Router();

tipoHardwareRoutes.get("/", (req, res) =>
  tipoHardwareController.findAll(req, res),
);

tipoHardwareRoutes.get("/:id", (req, res) =>
  tipoHardwareController.findById(req, res),
);

tipoHardwareRoutes.post("/", (req, res) =>
  tipoHardwareController.create(req, res),
);

tipoHardwareRoutes.put("/:id", (req, res) =>
  tipoHardwareController.update(req, res),
);

tipoHardwareRoutes.delete("/:id", (req, res) =>
  tipoHardwareController.delete(req, res),
);

export default tipoHardwareRoutes;
