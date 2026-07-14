import { Router } from "express";
import { EquipamentoController } from "../controllers/equipamentoController";

const router = Router();
const controller = new EquipamentoController();

// GET /api/equipamentos
router.get("/", (req, res) => controller.listarTodos(req, res));

export default router;
