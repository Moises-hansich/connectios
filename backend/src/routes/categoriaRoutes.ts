import { Router } from "express";
import { categoriaController } from "../controllers/categoriaController";
import { authMiddleware } from "../middlewares/authMiddleware";
import { adminMiddleware } from "../middlewares/adminMiddleware";

const router = Router();

router.use(authMiddleware);

// Usada no formulário de equipamento
router.get("/ativas", (req, res) => categoriaController.listarAtivas(req, res));

// Gerenciamento disponível somente para administrador
router.get("/", adminMiddleware, (req, res) =>
  categoriaController.listar(req, res),
);

router.get("/:id", adminMiddleware, (req, res) =>
  categoriaController.buscarPorId(req, res),
);

router.post("/", adminMiddleware, (req, res) =>
  categoriaController.criar(req, res),
);

router.put("/:id", adminMiddleware, (req, res) =>
  categoriaController.atualizar(req, res),
);

router.delete("/:id", adminMiddleware, (req, res) =>
  categoriaController.excluir(req, res),
);

export default router;
