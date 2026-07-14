import { Router } from "express";
import { EquipamentoController } from "../controllers/equipamentoController";
import { asyncHandler } from "../utils/asyncHandler";
import { validateBody } from "../middlewares/validationMiddleware";
import {
  criarEquipamentoSchema,
  atualizarEquipamentoSchema,
} from "../validators/equipamentoValidator";
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
  validateBody(criarEquipamentoSchema),
  asyncHandler((req, res) => controller.criar(req, res)),
);
router.put(
  "/:id",
  validateBody(atualizarEquipamentoSchema),
  asyncHandler((req, res) => controller.atualizar(req, res)),
);
router.delete(
  "/:id",
  asyncHandler((req, res) => controller.deletar(req, res)),
);
export default router;
