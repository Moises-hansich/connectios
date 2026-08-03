import { Router } from "express";
import { EquipamentoController } from "../controllers/equipamentoController";
import { asyncHandler } from "../utils/asyncHandler";
import { authMiddleware } from "../middlewares/authMiddleware";
import { adminMiddleware } from "../middlewares/adminMiddleware";
import { validateBody } from "../middlewares/validationMiddleware";
import {
  criarEquipamentoSchema,
  atualizarEquipamentoSchema,
} from "../validators/equipamentoValidator";
const router = Router();
const controller = new EquipamentoController();

router.use(authMiddleware);

router.get(
  "/",
  asyncHandler((req, res) => controller.listarTodos(req, res)),
);
router.get(
  "/:id/completo",
  asyncHandler((req, res) => controller.buscarCompleto(req, res)),
);
router.get(
  "/:id",
  asyncHandler((req, res) => controller.buscarPorId(req, res)),
);
router.post(
  "/",
  adminMiddleware,
  validateBody(criarEquipamentoSchema),
  asyncHandler((req, res) => controller.criar(req, res)),
);
router.put(
  "/:id",
  adminMiddleware,
  validateBody(atualizarEquipamentoSchema),
  asyncHandler((req, res) => controller.atualizar(req, res)),
);
router.delete(
  "/:id",
  adminMiddleware,
  asyncHandler((req, res) => controller.deletar(req, res)),
);
export default router;
