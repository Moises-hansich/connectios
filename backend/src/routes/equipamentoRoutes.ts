import { Router } from "express";
import { EquipamentoController } from "../controllers/equipamentoController";

const router = Router();
const controller = new EquipamentoController();

router.get("/", (req, res) => controller.listarTodos(req, res));
router.get("/:id", (req, res) => controller.buscarPorId(req, res));
router.post("/", (req, res) => controller.criar(req, res));
router.put("/:id", (req, res) => controller.atualizar(req, res));
export default router;
