import { Router } from "express";
import { DashboardController } from "../controllers/dashboardController";
import { asyncHandler } from "../utils/asyncHandler";

const dashboardRoutes = Router();
const dashboardController = new DashboardController();

dashboardRoutes.get(
  "/",
  asyncHandler(dashboardController.index.bind(dashboardController)),
);

export default dashboardRoutes;
