import { randomUUID } from "node:crypto";
import multer from "multer";

import { diretorioFotosEquipamentos } from "../config/upload";

const TAMANHO_MAXIMO_POR_FOTO = 5 * 1024 * 1024;

const extensoesPorTipoMime: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
};

const armazenamento = multer.diskStorage({
  destination: (_req, _file, callback) => {
    callback(null, diretorioFotosEquipamentos);
  },

  filename: (_req, file, callback) => {
    const extensao = extensoesPorTipoMime[file.mimetype];
    callback(null, `${randomUUID()}${extensao}`);
  },
});

export const uploadFotosEquipamento = multer({
  storage: armazenamento,

  fileFilter: (_req, file, callback) => {
    if (!extensoesPorTipoMime[file.mimetype]) {
      callback(
        new Error("Formato de imagem inválido. Envie JPG, PNG ou WebP."),
      );
      return;
    }

    callback(null, true);
  },

  limits: {
    fileSize: TAMANHO_MAXIMO_POR_FOTO,
    files: 5,
  },
});
