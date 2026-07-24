import { Router } from "express";
import { campoHardwareController } from "../controllers/campoHardwareController";

const campoHardwareRoutes = Router();

campoHardwareRoutes.get("/", (req, res) =>
  campoHardwareController.findAll(req, res),
);

campoHardwareRoutes.get("/:id", (req, res) =>
  campoHardwareController.findById(req, res),
);

campoHardwareRoutes.post("/", (req, res) =>
  campoHardwareController.create(req, res),
);

campoHardwareRoutes.put("/:id", (req, res) =>
  campoHardwareController.update(req, res),
);

campoHardwareRoutes.delete("/:id", (req, res) =>
  campoHardwareController.delete(req, res),
);

export default campoHardwareRoutes;
