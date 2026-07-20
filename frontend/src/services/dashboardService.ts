import { api } from "./api";

export async function buscarDashboard() {
  const response = await api.get("/dashboard");

  return response.data.data;
}
