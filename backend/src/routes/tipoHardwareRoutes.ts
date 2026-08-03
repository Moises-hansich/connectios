import { Router } from "express";
import { tipoHardwareController } from "../controllers/tipoHardwareController";
import { authMiddleware } from "../middlewares/authMiddleware";
import { adminMiddleware } from "../middlewares/adminMiddleware";

const tipoHardwareRoutes = Router();

tipoHardwareRoutes.use(authMiddleware);

tipoHardwareRoutes.get("/", (req, res) =>
  tipoHardwareController.findAll(req, res),
);

tipoHardwareRoutes.get("/:id", (req, res) =>
  tipoHardwareController.findById(req, res),
);

tipoHardwareRoutes.post("/", adminMiddleware, (req, res) =>
  tipoHardwareController.create(req, res),
);

tipoHardwareRoutes.put("/:id", adminMiddleware, (req, res) =>
  tipoHardwareController.update(req, res),
);

tipoHardwareRoutes.delete("/:id", adminMiddleware, (req, res) =>
  tipoHardwareController.delete(req, res),
);

export default tipoHardwareRoutes;
