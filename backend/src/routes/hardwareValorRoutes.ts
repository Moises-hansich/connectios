import { Router } from "express";
import { hardwareValorController } from "../controllers/hardwareValorController";
import { authMiddleware } from "../middlewares/authMiddleware";
import { adminMiddleware } from "../middlewares/adminMiddleware";

const hardwareValorRoutes = Router();

hardwareValorRoutes.use(authMiddleware);

hardwareValorRoutes.get("/", (req, res) =>
  hardwareValorController.findAll(req, res),
);

hardwareValorRoutes.get("/:id", (req, res) =>
  hardwareValorController.findById(req, res),
);

hardwareValorRoutes.get("/hardware/:hardwareId", (req, res) =>
  hardwareValorController.findByHardware(req, res),
);

hardwareValorRoutes.post("/", adminMiddleware, (req, res) =>
  hardwareValorController.create(req, res),
);

hardwareValorRoutes.put("/:id", adminMiddleware, (req, res) =>
  hardwareValorController.update(req, res),
);

hardwareValorRoutes.delete("/:id", adminMiddleware, (req, res) =>
  hardwareValorController.delete(req, res),
);

export default hardwareValorRoutes;
