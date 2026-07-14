import express from "express";
import cors from "cors";
import equipamentoRoutes from "./routes/equipamentoRoutes";
import { errorHandler } from "./middlewares/errorHandler";

const app = express();

app.use(cors());
app.use(express.json());

// Rota inicial
app.get("/", (req, res) => {
  res.json({
    message: "API funcionando!",
  });
});

// Rotas da API
app.use("/api/equipamentos", equipamentoRoutes);
app.use(errorHandler);
export default app;
