import express from "express";
import cors from "cors";

import equipamentoRoutes from "./routes/equipamentoRoutes";
import dashboardRoutes from "./routes/dashboardRoutes";

import { errorHandler } from "./middlewares/errorHandler";

const app = express();

app.use(cors());
app.use(express.json());

// Rota inicial
app.get("/", (_req, res) => {
  res.json({
    message: "API funcionando!",
  });
});

// Rotas da API
app.use("/api/equipamentos", equipamentoRoutes);
app.use("/api/dashboard", dashboardRoutes);

// Middleware de erro deve ficar por último
app.use(errorHandler);

export default app;
