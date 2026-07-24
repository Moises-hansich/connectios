import { Router } from "express";
import { hardwareValorController } from "../controllers/hardwareValorController";

const hardwareValorRoutes = Router();

hardwareValorRoutes.post("/", hardwareValorController.create);

hardwareValorRoutes.get("/", hardwareValorController.findAll);

hardwareValorRoutes.get("/:id", hardwareValorController.findById);

hardwareValorRoutes.get(
  "/hardware/:hardwareId",
  hardwareValorController.findByHardware,
);

hardwareValorRoutes.put("/:id", hardwareValorController.update);

hardwareValorRoutes.delete("/:id", hardwareValorController.delete);

export default hardwareValorRoutes;
