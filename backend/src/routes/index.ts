import { Router } from "express";
import equipamentoRoutes from "./equipamentoRoutes";
import dashboardRoutes from "./dashboardRoutes";

const router = Router();

router.use("/equipamentos", equipamentoRoutes);
router.use("/dashboard", dashboardRoutes);

export default router;
