import { Router } from "express";
import { ColaboradorController } from "../controllers/colaboradorController";
import { asyncHandler } from "../utils/asyncHandler";
import { authMiddleware } from "../middlewares/authMiddleware";
import { adminMiddleware } from "../middlewares/adminMiddleware";
import { validateBody } from "../middlewares/validationMiddleware";

import {
  criarColaboradorSchema,
  atualizarColaboradorSchema,
} from "../validators/colaboradorValidator";

const router = Router();
const controller = new ColaboradorController();

router.use(authMiddleware);

router.get(
  "/",
  asyncHandler((req, res) => controller.listarTodos(req, res)),
);

// Retorna o colaborador com equipamentos e hardwares
router.get(
  "/:id/completo",
  asyncHandler((req, res) => controller.buscarCompleto(req, res)),
);

// Retorna somente os dados básicos do colaborador
router.get(
  "/:id",
  asyncHandler((req, res) => controller.buscarPorId(req, res)),
);

router.post(
  "/",
  adminMiddleware,
  validateBody(criarColaboradorSchema),
  asyncHandler((req, res) => controller.criar(req, res)),
);

router.put(
  "/:id",
  adminMiddleware,
  validateBody(atualizarColaboradorSchema),
  asyncHandler((req, res) => controller.atualizar(req, res)),
);

router.delete(
  "/:id",
  adminMiddleware,
  asyncHandler((req, res) => controller.deletar(req, res)),
);

export default router;
