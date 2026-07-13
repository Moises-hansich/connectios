import Express from "express";
const app = Express();
app.use(Express.json());
app.get("/", (req, res) => {
  res.json({ message: "Api esta funcionando!" });
});
app.listen(3000, () => {
  console.log("Servidor rodando na porta 3000");
});

app.get("/teste", (req, res) => {
  res.json({ status: "Api esta funcionando!", server: "connectionjs" });
});
