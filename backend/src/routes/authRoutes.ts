import { Router } from "express";

import { authController } from "../controllers/authController";
import { usuarioController } from "../controllers/usuarioController";
import { authMiddleware } from "../middlewares/authMiddleware";
import { adminMiddleware } from "../middlewares/adminMiddleware";

const authRoutes = Router();

authRoutes.post("/login", authController.login);

authRoutes.get("/me", authMiddleware, authController.me);

// Mantém a rota existente, usando as mesmas validações
// do cadastro administrativo de usuários.
authRoutes.post(
  "/registrar",
  authMiddleware,
  adminMiddleware,
  usuarioController.criar,
);

export default authRoutes;
