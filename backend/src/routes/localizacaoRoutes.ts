import { Router } from "express";
import { localizacaoController } from "../controllers/localizacaoController";

const router = Router();

router.get("/", (req, res) => localizacaoController.listar(req, res));

router.get("/:id", (req, res) => localizacaoController.buscarPorId(req, res));

router.post("/", (req, res) => localizacaoController.criar(req, res));

router.put("/:id", (req, res) => localizacaoController.atualizar(req, res));

router.delete("/:id", (req, res) => localizacaoController.excluir(req, res));

export default router;
