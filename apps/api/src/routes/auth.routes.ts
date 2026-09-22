import { Router } from "express";
import { loginHandler, registerHandler,changePasswordHandler } from "../controllers/auth.controller";
import { requireAuth } from "../middleware/auth";

export const authRouter = Router();

authRouter.post("/register", registerHandler);
authRouter.post("/login", loginHandler);
authRouter.post("/change-password", requireAuth, changePasswordHandler);