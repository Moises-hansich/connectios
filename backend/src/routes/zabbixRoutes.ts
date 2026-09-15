import { Router } from "express";
import { ZabbixController } from "../controllers/zabbixController";
import { authMiddleware } from "../middlewares/authMiddleware";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();
const controller = new ZabbixController();

router.use(authMiddleware);

router.get(
  "/hosts",
  asyncHandler((req, res) => controller.listarComputadores(req, res)),
);

export default router;
