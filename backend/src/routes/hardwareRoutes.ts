import { Router } from "express";
import { hardwareController } from "../controllers/hardwareController";
import { authMiddleware } from "../middlewares/authMiddleware";
import { adminMiddleware } from "../middlewares/adminMiddleware";

const hardwareRoutes = Router();

hardwareRoutes.use(authMiddleware);

hardwareRoutes.get("/", (req, res) => hardwareController.findAll(req, res));

hardwareRoutes.get("/:id", (req, res) => hardwareController.findById(req, res));

hardwareRoutes.post("/", adminMiddleware, (req, res) =>
  hardwareController.create(req, res),
);

hardwareRoutes.put("/:id", adminMiddleware, (req, res) =>
  hardwareController.update(req, res),
);

hardwareRoutes.delete("/:id", adminMiddleware, (req, res) =>
  hardwareController.delete(req, res),
);

export default hardwareRoutes;
