import { Router } from "express";

import authRoutes from "./authRoutes";
import dashboardRoutes from "./dashboardRoutes";
import equipamentoRoutes from "./equipamentoRoutes";
import usuarioRoutes from "./usuarioRoutes";
import localizacaoRoutes from "./localizacaoRoutes";
import colaboradorRoutes from "./colaboradorRoutes";
const routes = Router();

routes.use("/auth", authRoutes);
routes.use("/dashboard", dashboardRoutes);
routes.use("/equipamentos", equipamentoRoutes);
routes.use("/usuarios", usuarioRoutes);
routes.use("/localizacoes", localizacaoRoutes);
routes.use("/colaboradores", colaboradorRoutes);
export default routes;
