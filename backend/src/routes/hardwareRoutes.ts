import { Router } from "express";
import { hardwareController } from "../controllers/hardwareController";

const hardwareRoutes = Router();

hardwareRoutes.get("/", (req, res) => hardwareController.findAll(req, res));

hardwareRoutes.get("/:id", (req, res) => hardwareController.findById(req, res));

hardwareRoutes.post("/", (req, res) => hardwareController.create(req, res));

hardwareRoutes.put("/:id", (req, res) => hardwareController.update(req, res));

hardwareRoutes.delete("/:id", (req, res) =>
  hardwareController.delete(req, res),
);

export default hardwareRoutes;
