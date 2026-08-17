import "dotenv/config";

import app from "./app";

const PORT = Number(process.env.PORT) || 3100;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
