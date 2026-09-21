-- CreateTable
CREATE TABLE "UsuarioPermissao" (
    "usuarioId" INTEGER NOT NULL,
    "chave" TEXT NOT NULL,

    PRIMARY KEY ("usuarioId", "chave"),
    CONSTRAINT "UsuarioPermissao_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
