import { Router } from "express";
import { empresaController } from "../controllers/empresaController";
import { authMiddleware } from "../middlewares/authMiddleware";
import { adminMiddleware } from "../middlewares/adminMiddleware";

const router = Router();

router.use(authMiddleware);

// Usada nos formulários de equipamento e manutenção
router.get("/ativas", (req, res) => empresaController.listarAtivas(req, res));

// Gerenciamento disponível somente para administrador
router.get("/", adminMiddleware, (req, res) =>
  empresaController.listar(req, res),
);

router.get("/:id", adminMiddleware, (req, res) =>
  empresaController.buscarPorId(req, res),
);

router.post("/", adminMiddleware, (req, res) =>
  empresaController.criar(req, res),
);

router.put("/:id", adminMiddleware, (req, res) =>
  empresaController.atualizar(req, res),
);

router.delete("/:id", adminMiddleware, (req, res) =>
  empresaController.excluir(req, res),
);

export default router;
