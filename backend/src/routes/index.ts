import { Router } from "express";

import authRoutes from "./authRoutes";
import dashboardRoutes from "./dashboardRoutes";
import equipamentoRoutes from "./equipamentoRoutes";
import usuarioRoutes from "./usuarioRoutes";

const routes = Router();

routes.use("/auth", authRoutes);
routes.use("/dashboard", dashboardRoutes);
routes.use("/equipamentos", equipamentoRoutes);
routes.use("/usuarios", usuarioRoutes);

export default routes;
