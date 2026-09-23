import { Router } from "express";

import { empresaController } from "../controllers/empresaController";
import { authMiddleware } from "../middlewares/authMiddleware";
import { exigirPermissao } from "../middlewares/permissaoMiddleware";

const router = Router();

router.use(authMiddleware);

// Usada nos formulários de equipamento e manutenção.
// Deve ficar antes da rota "/:id".
router.get("/ativas", exigirPermissao("empresas.visualizar"), (req, res) =>
  empresaController.listarAtivas(req, res),
);

router.get("/", exigirPermissao("empresas.visualizar"), (req, res) =>
  empresaController.listar(req, res),
);

router.get("/:id", exigirPermissao("empresas.visualizar"), (req, res) =>
  empresaController.buscarPorId(req, res),
);

router.post(
  "/",
  exigirPermissao("empresas.visualizar", "empresas.criar"),
  (req, res) => empresaController.criar(req, res),
);

router.put(
  "/:id",
  exigirPermissao("empresas.visualizar", "empresas.editar"),
  (req, res) => empresaController.atualizar(req, res),
);

router.delete(
  "/:id",
  exigirPermissao("empresas.visualizar", "empresas.excluir"),
  (req, res) => empresaController.excluir(req, res),
);

export default router;
