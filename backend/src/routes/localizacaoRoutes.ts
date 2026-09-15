import { Router } from "express";
import { localizacaoController } from "../controllers/localizacaoController";
import { authMiddleware } from "../middlewares/authMiddleware";
import { adminMiddleware } from "../middlewares/adminMiddleware";

const router = Router();

router.use(authMiddleware);

router.get("/", (req, res) => localizacaoController.listar(req, res));

router.get("/:id/colaboradores", (req, res) =>
  localizacaoController.listarColaboradores(req, res),
);

router.get("/:id", (req, res) => localizacaoController.buscarPorId(req, res));

router.post("/", adminMiddleware, (req, res) =>
  localizacaoController.criar(req, res),
);

router.put("/:id", adminMiddleware, (req, res) =>
  localizacaoController.atualizar(req, res),
);

router.delete("/:id", adminMiddleware, (req, res) =>
  localizacaoController.excluir(req, res),
);

export default router;
