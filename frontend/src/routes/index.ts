import { Router } from "express";

import { authMiddleware } from "../middlewares/authMiddleware";
import authRoutes from "./authRoutes";
import dashboardRoutes from "./dashboardRoutes";
import equipamentoRoutes from "./equipamentoRoutes";

const routes = Router();

routes.use("/auth", authRoutes);

routes.use("/dashboard", authMiddleware, dashboardRoutes);
routes.use("/equipamentos", authMiddleware, equipamentoRoutes);

export default routes;
