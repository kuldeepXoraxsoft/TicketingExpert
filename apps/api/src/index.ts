import "express-async-errors"; 
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import http from "http";
import { Server as SocketIOServer } from "socket.io";

import { env } from "./config/env";
import { authRouter } from "./routes/auth.routes";
import { ticketRouter } from "./routes/ticket.routes";
import { userRouter } from "./routes/user.routes";
import { departmentRouter } from "./routes/department.routes";
import { errorHandler } from "./middleware/errorHandler";
import { emailTemplateRouter } from "./routes/emailTemplate.routes"
const app = express();

app.use(helmet());
app.use(cors({ origin: env.corsOrigin, credentials: true }));
app.use(express.json({ limit: "2mb" }));
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

app.get("/health", (_req, res) => res.json({ status: "ok" }));

app.use("/api/auth", authRouter);
app.use("/api/tickets", ticketRouter);
app.use("/api/users", userRouter);
app.use("/api/departments", departmentRouter);
app.use("/api/email-templates", emailTemplateRouter);

// TODO (Phase 5+): app.use("/api/mailboxes", mailboxRouter)
// TODO (Phase 9): app.post("/api/email/webhook", webhookHandler) — Graph change notifications

app.use(errorHandler);

const httpServer = http.createServer(app);

export const io = new SocketIOServer(httpServer, {
  cors: { origin: env.corsOrigin },
});

io.on("connection", (socket) => {
  const organizationId = socket.handshake.auth?.organizationId;
  if (organizationId) {
    socket.join(`org:${organizationId}`);
  }
});

httpServer.listen(env.apiPort, () => {
  console.log(`API listening on http://localhost:${env.apiPort}`);
});
