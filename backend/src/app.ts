import express from "express";
import cors from "cors";

import routes from "./routes";
import { errorHandler } from "./middlewares/errorHandler";
import { diretorioFotosEquipamentos } from "./config/upload";

const app = express();

app.use(cors());
app.use(express.json());

// Disponibiliza as imagens armazenadas na pasta externa.
// Exemplo:
// http://localhost:3000/uploads/equipamentos/nome-da-foto.jpg
app.use("/uploads/equipamentos", express.static(diretorioFotosEquipamentos));

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
