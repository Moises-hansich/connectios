import { Router } from "express";

import { authController } from "../controllers/authController";
import { authMiddleware } from "../middlewares/authMiddleware";

const authRoutes = Router();

authRoutes.post("/registrar", authController.criarUsuario);
authRoutes.post("/login", authController.login);
authRoutes.get("/me", authMiddleware, authController.me);

export default authRoutes;
