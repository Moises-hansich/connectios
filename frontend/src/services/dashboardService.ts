import { api } from "./api";

import type { DashboardData, DashboardResponse } from "../types/dashboard";

export const dashboardService = {
  async buscar(): Promise<DashboardData> {
    const response = await api.get<DashboardResponse>("/dashboard");

    return response.data.data;
  },
};
