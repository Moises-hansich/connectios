import { Router } from "express";
import { campoHardwareController } from "../controllers/campoHardwareController";
import { authMiddleware } from "../middlewares/authMiddleware";
import { adminMiddleware } from "../middlewares/adminMiddleware";

const campoHardwareRoutes = Router();

campoHardwareRoutes.use(authMiddleware);

campoHardwareRoutes.get("/", (req, res) =>
  campoHardwareController.findAll(req, res),
);

campoHardwareRoutes.get("/:id", (req, res) =>
  campoHardwareController.findById(req, res),
);

campoHardwareRoutes.post("/", adminMiddleware, (req, res) =>
  campoHardwareController.create(req, res),
);

campoHardwareRoutes.put("/:id", adminMiddleware, (req, res) =>
  campoHardwareController.update(req, res),
);

campoHardwareRoutes.delete("/:id", adminMiddleware, (req, res) =>
  campoHardwareController.delete(req, res),
);

export default campoHardwareRoutes;
