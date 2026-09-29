import { Router } from "express";

import { ColaboradorController } from "../controllers/colaboradorController";
import { asyncHandler } from "../utils/asyncHandler";

import { authMiddleware } from "../middlewares/authMiddleware";
import { exigirPermissao } from "../middlewares/permissaoMiddleware";
import { validateBody } from "../middlewares/validationMiddleware";

import {
  criarColaboradorSchema,
  atualizarColaboradorSchema,
} from "../validators/colaboradorValidator";

const router = Router();

const controller = new ColaboradorController();

router.use(authMiddleware);

// Paginado (tela de colaboradores) — NÃO MEXI
router.get(
  "/",
  exigirPermissao("colaboradores.visualizar"),
  asyncHandler((req, res) => controller.listarTodos(req, res)),
);

// ✅ NOVO — retorna TODOS, sem paginação (usado no EquipmentForm)
// Precisa vir ANTES de "/:id" para o Express não confundir "todos" com um id
router.get(
  "/todos",
  exigirPermissao("colaboradores.visualizar"),
  asyncHandler((req, res) => controller.listarTodosSemPaginacao(req, res)),
);

// Retorna o colaborador com equipamentos e hardwares.
router.get(
  "/:id/completo",
  exigirPermissao(
    "colaboradores.visualizar",
    "equipamentos.visualizar",
    "hardware.visualizar",
  ),
  asyncHandler((req, res) => controller.buscarCompleto(req, res)),
);

router.get(
  "/:id",
  exigirPermissao("colaboradores.visualizar"),
  asyncHandler((req, res) => controller.buscarPorId(req, res)),
);

router.post(
  "/",
  exigirPermissao("colaboradores.visualizar", "colaboradores.criar"),
  validateBody(criarColaboradorSchema),
  asyncHandler((req, res) => controller.criar(req, res)),
);

router.put(
  "/:id",
  exigirPermissao("colaboradores.visualizar", "colaboradores.editar"),
  validateBody(atualizarColaboradorSchema),
  asyncHandler((req, res) => controller.atualizar(req, res)),
);

router.delete(
  "/:id",
  exigirPermissao("colaboradores.visualizar", "colaboradores.excluir"),
  asyncHandler((req, res) => controller.deletar(req, res)),
);

export default router;
