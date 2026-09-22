import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth";
import { createUserHandler, listUsersHandler, updateUserHandler } from "../controllers/user.controller";

export const userRouter = Router();

userRouter.use(requireAuth);

userRouter.get("/", listUsersHandler);
userRouter.post("/", requireRole("ADMIN"), createUserHandler);
userRouter.patch("/:id", requireRole("ADMIN"), updateUserHandler);
