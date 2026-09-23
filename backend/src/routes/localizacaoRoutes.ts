import { Router } from "express";

import { localizacaoController } from "../controllers/localizacaoController";
import { authMiddleware } from "../middlewares/authMiddleware";
import { exigirPermissao } from "../middlewares/permissaoMiddleware";

const router = Router();

router.use(authMiddleware);

router.get("/", exigirPermissao("localizacoes.visualizar"), (req, res) =>
  localizacaoController.listar(req, res),
);

router.get(
  "/:id/colaboradores",
  exigirPermissao(
    "localizacoes.visualizar",
    "colaboradores.visualizar",
    "equipamentos.visualizar",
    "zabbix.visualizar",
  ),
  (req, res) => localizacaoController.listarColaboradores(req, res),
);

router.get("/:id", exigirPermissao("localizacoes.visualizar"), (req, res) =>
  localizacaoController.buscarPorId(req, res),
);

router.post(
  "/",
  exigirPermissao("localizacoes.visualizar", "localizacoes.criar"),
  (req, res) => localizacaoController.criar(req, res),
);

router.put(
  "/:id",
  exigirPermissao("localizacoes.visualizar", "localizacoes.editar"),
  (req, res) => localizacaoController.atualizar(req, res),
);

router.delete(
  "/:id",
  exigirPermissao("localizacoes.visualizar", "localizacoes.excluir"),
  (req, res) => localizacaoController.excluir(req, res),
);

export default router;
