import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      sessionStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

export interface Department {
  id: string;
  name: string;
  _count?: { users: number; tickets: number };
}

export interface OrgUser {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "USER";
  status: "ACTIVE" | "DISABLED";
  departmentId: string | null;
  department?: { id: string; name: string } | null;
  createdAt: string;
}

export interface Ticket {
  id: string;
  ticketNumber: string;
  subject: string;
  status: string;
  priority: string;
  requesterEmail: string;
  requesterName?: string;
  direction?: string;
  createdAt: string;
  updatedAt: string;
  closedAt: string;
  resolvedAt: string;
  assignedTo?: { id: string; name: string } | null;
  department?: { id: string; name: string } | null;
}

export interface TicketMessage {
  id: string;
  bodyText?: string;
  bodyHtml?: string;
  isInternal: boolean;
  direction: "INBOUND" | "OUTBOUND";
  senderType: "CUSTOMER" | "AGENT" | "SYSTEM";
  fromEmail: string;
  fromName?: string;
  createdAt: string;
}

export interface TicketDetail extends Ticket {
  messages: TicketMessage[];
}