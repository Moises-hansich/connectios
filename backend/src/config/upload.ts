import fs from "node:fs";
import path from "node:path";

const caminhoConfigurado = process.env.UPLOAD_EQUIPAMENTOS_DIR?.trim();

export const diretorioFotosEquipamentos = caminhoConfigurado
  ? path.resolve(caminhoConfigurado)
  : path.resolve(process.cwd(), "uploads", "equipamentos");

// Cria a pasta automaticamente caso ainda não exista
fs.mkdirSync(diretorioFotosEquipamentos, {
  recursive: true,
});
