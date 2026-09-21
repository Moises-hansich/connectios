import { Router } from "express";

import { EquipamentoController } from "../controllers/equipamentoController";
import { asyncHandler } from "../utils/asyncHandler";
import { authMiddleware } from "../middlewares/authMiddleware";
import { exigirPermissao } from "../middlewares/permissaoMiddleware";
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
  exigirPermissao("equipamentos.visualizar"),
  asyncHandler((req, res) => controller.listarTodos(req, res)),
);

// Esta resposta também contém os hardwares do equipamento.
// Por isso, exige as duas permissões.
router.get(
  "/:id/completo",
  exigirPermissao("equipamentos.visualizar", "hardware.visualizar"),
  asyncHandler((req, res) => controller.buscarCompleto(req, res)),
);

router.get(
  "/:id",
  exigirPermissao("equipamentos.visualizar"),
  asyncHandler((req, res) => controller.buscarPorId(req, res)),
);

router.post(
  "/",
  exigirPermissao("equipamentos.visualizar", "equipamentos.criar"),
  validateBody(criarEquipamentoSchema),
  asyncHandler((req, res) => controller.criar(req, res)),
);

router.put(
  "/:id",
  exigirPermissao("equipamentos.visualizar", "equipamentos.editar"),
  validateBody(atualizarEquipamentoSchema),
  asyncHandler((req, res) => controller.atualizar(req, res)),
);

router.delete(
  "/:id",
  exigirPermissao("equipamentos.visualizar", "equipamentos.excluir"),
  asyncHandler((req, res) => controller.deletar(req, res)),
);

export default router;
