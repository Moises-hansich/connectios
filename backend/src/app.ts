import express from "express";
import cors from "cors";
import path from "node:path";
import fs from "node:fs";

import routes from "./routes";
import { errorHandler } from "./middlewares/errorHandler";
import { diretorioFotosEquipamentos } from "./config/upload";

const app = express();

app.use(cors());
app.use(express.json());

// Imagens dos equipamentos
app.use("/uploads/equipamentos", express.static(diretorioFotosEquipamentos));

// Rotas da API
app.use("/api", routes);

// Caminho da compilação do frontend:
// Connectionjs/frontend/dist
const diretorioFrontend = path.resolve(__dirname, "../../frontend/dist");

if (fs.existsSync(diretorioFrontend)) {
  // CSS, JavaScript e demais arquivos do frontend
  app.use(express.static(diretorioFrontend));

  // Permite atualizar diretamente páginas do React Router
  app.use((req, res, next) => {
    if (req.method !== "GET" || req.path.startsWith("/api")) {
      return next();
    }

    return res.sendFile(path.join(diretorioFrontend, "index.html"));
  });
} else {
  console.warn(`Frontend não encontrado em: ${diretorioFrontend}`);
}

// Middleware de erros deve permanecer no final
app.use(errorHandler);

export default app;
