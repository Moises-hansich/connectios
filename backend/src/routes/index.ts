import { Router } from "express";

import authRoutes from "./authRoutes";
import dashboardRoutes from "./dashboardRoutes";
import equipamentoRoutes from "./equipamentoRoutes";
import usuarioRoutes from "./usuarioRoutes";
import localizacaoRoutes from "./localizacaoRoutes";
import colaboradorRoutes from "./colaboradorRoutes";
import tipoHardwareRoutes from "./tipoHardwareRoutes";

const routes = Router();

routes.use("/auth", authRoutes);
routes.use("/dashboard", dashboardRoutes);
routes.use("/equipamentos", equipamentoRoutes);
routes.use("/usuarios", usuarioRoutes);
routes.use("/localizacoes", localizacaoRoutes);
routes.use("/colaboradores", colaboradorRoutes);
routes.use("/tipos-hardware", tipoHardwareRoutes);

export default routes;
