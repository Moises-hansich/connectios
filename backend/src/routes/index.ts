import { Router } from "express";

import authRoutes from "./authRoutes";
import dashboardRoutes from "./dashboardRoutes";
import equipamentoRoutes from "./equipamentoRoutes";
import usuarioRoutes from "./usuarioRoutes";
import localizacaoRoutes from "./localizacaoRoutes";
import colaboradorRoutes from "./colaboradorRoutes";
import tipoHardwareRoutes from "./tipoHardwareRoutes";
import campoHardwareRoutes from "./campoHardwareRoutes";
import hardwareRoutes from "./hardwareRoutes";
import hardwareValorRoutes from "./hardwareValorRoutes";
import categoriaRoutes from "./categoriaRoutes";
import { fotoEquipamentoRoutes } from "./fotoEquipamentoRoutes";
import { movimentacaoRoutes } from "./movimentacaoRoutes";
import { manutencaoRoutes } from "./manutencaoRoutes";
import empresaRoutes from "./empresaRoutes";

const routes = Router();

routes.use("/auth", authRoutes);
routes.use("/dashboard", dashboardRoutes);
routes.use("/equipamentos", equipamentoRoutes);
routes.use("/equipamentos", fotoEquipamentoRoutes);
routes.use("/empresas", empresaRoutes);
routes.use("/categorias", categoriaRoutes);
routes.use("/usuarios", usuarioRoutes);
routes.use("/localizacoes", localizacaoRoutes);
routes.use("/colaboradores", colaboradorRoutes);
routes.use("/tipos-hardware", tipoHardwareRoutes);
routes.use("/campos-hardware", campoHardwareRoutes);
routes.use("/hardwares", hardwareRoutes);
routes.use("/hardware-valores", hardwareValorRoutes);
routes.use("/movimentacoes", movimentacaoRoutes);
routes.use("/manutencoes", manutencaoRoutes);

export default routes;
