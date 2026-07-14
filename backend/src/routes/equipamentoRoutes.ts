import { Router } from "express";
import { EquipamentoController } from "../controllers/equipamentoController";
import { asyncHandler } from "../utils/asyncHandler";
const router = Router();
const controller = new EquipamentoController();

router.get(
  "/",
  asyncHandler((req, res) => controller.listarTodos(req, res)),
);
router.get(
  "/:id",
  asyncHandler((req, res) => controller.buscarPorId(req, res)),
);
router.post(
  "/",
  asyncHandler((req, res) => controller.criar(req, res)),
);
router.put(
  "/:id",
  asyncHandler((req, res) => controller.atualizar(req, res)),
);
router.delete(
  "/:id",
  asyncHandler((req, res) => controller.deletar(req, res)),
);
export default router;
