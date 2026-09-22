import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth";
import { createDepartmentHandler, listDepartmentsHandler } from "../controllers/department.controller";

export const departmentRouter = Router();

departmentRouter.use(requireAuth);

departmentRouter.get("/", listDepartmentsHandler);
departmentRouter.post("/", requireRole("SUPER_ADMIN"), createDepartmentHandler);
