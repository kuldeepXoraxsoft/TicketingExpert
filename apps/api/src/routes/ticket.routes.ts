import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import {
  addMessageHandler,
  createTicketHandler,
  getTicketHandler,
  listTicketsHandler,
  updateTicketHandler,
} from "../controllers/ticket.controller";

export const ticketRouter = Router();

ticketRouter.use(requireAuth);

ticketRouter.get("/", listTicketsHandler);
ticketRouter.post("/", createTicketHandler);
ticketRouter.get("/:id", getTicketHandler);
ticketRouter.patch("/:id", updateTicketHandler);
ticketRouter.post("/:id/messages", addMessageHandler);
