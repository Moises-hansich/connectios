import express from "express";
import cors from "cors";

import routes from "./routes";
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

// Todas as rotas da API
app.use("/api", routes);

// Middleware de erro deve ficar por último
app.use(errorHandler);

export default app;
