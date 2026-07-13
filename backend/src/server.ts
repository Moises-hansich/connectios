import express from "express";
import { prisma } from "./prisma";

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    mensagem: "API Connectionjs funcionando!",
  });
});

app.get("/equipamentos", async (req, res) => {
  const equipamentos = await prisma.equipamento.findMany();

  res.json(equipamentos);
});

app.listen(3000, () => {
  console.log("Servidor rodando na porta 3000");
});
