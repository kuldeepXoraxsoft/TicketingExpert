import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth";
import { createDepartmentHandler, listDepartmentsHandler } from "../controllers/department.controller";

export const departmentRouter = Router();

departmentRouter.use(requireAuth);

// Any logged-in user can see the department list (needed for e.g. a create-ticket form).
departmentRouter.get("/", listDepartmentsHandler);
// Only admins can create departments.
departmentRouter.post("/", requireRole("ADMIN"), createDepartmentHandler);
