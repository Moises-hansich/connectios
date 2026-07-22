import { Router } from "express";
import { ColaboradorController } from "../controllers/colaboradorController";
import { asyncHandler } from "../utils/asyncHandler";
import { validateBody } from "../middlewares/validationMiddleware";

import {
  criarColaboradorSchema,
  atualizarColaboradorSchema,
} from "../validators/colaboradorValidator";

const router = Router();
const controller = new ColaboradorController();

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
  validateBody(criarColaboradorSchema),
  asyncHandler((req, res) => controller.criar(req, res)),
);

router.put(
  "/:id",
  validateBody(atualizarColaboradorSchema),
  asyncHandler((req, res) => controller.atualizar(req, res)),
);

router.delete(
  "/:id",
  asyncHandler((req, res) => controller.deletar(req, res)),
);

export default router;
