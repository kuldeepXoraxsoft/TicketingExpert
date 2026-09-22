import { FormEvent, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Clock3,
  Mail,
  MessageSquare,
  Paperclip,
  Send,
  User,
} from "lucide-react";
import { api, TicketDetail as TicketDetailType } from "../lib/api";
import AssignTicketModal from "../components/tickets/AssignTicketModal";

const STATUS_CONFIG: Record<string, string> = {
  NEW: "bg-blue-50 text-blue-700 border-blue-100",
  OPEN: "bg-amber-50 text-amber-700 border-amber-100",
  IN_PROGRESS: "bg-purple-50 text-purple-700 border-purple-100",
  AWAITING: "bg-slate-50 text-slate-600 border-slate-200",
  RESOLVED: "bg-emerald-50 text-emerald-700 border-emerald-100",
  CLOSED: "bg-slate-100 text-slate-500 border-slate-200",
};

const PRIORITY_CONFIG: Record<string, string> = {
  CRITICAL: "text-red-600",
  HIGH: "text-orange-600",
  MEDIUM: "text-amber-600",
  LOW: "text-slate-500",
};

export default function TicketDetail() {
  const { id } = useParams();

  const [ticket, setTicket] = useState<TicketDetailType | null>(null);
  const [reply, setReply] = useState("");
  const [isInternal, setIsInternal] = useState(false);
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [assignOpen, setAssignOpen] = useState(false);

  async function load() {
    if (!id) return;

    setLoading(true);

    try {
      const res = await api.get(`/tickets/${id}`);
      setTicket(res.data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [id]);

  async function handleSend(e: FormEvent) {
    e.preventDefault();

    if (!reply.trim() || !id) return;

    setSending(true);

    try {
      await api.post(`/tickets/${id}/messages`, {
        bodyText: reply,
        isInternal,
      });

      setReply("");
      await load();
    } finally {
      setSending(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="mx-auto h-6 w-6 animate-spin rounded-full border-2 border-slate-200 border-t-slate-900" />
          <p className="mt-3 text-sm text-slate-500">
            Loading ticket...
          </p>
        </div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="p-8 text-center">
        <p className="text-sm text-slate-500">
          Ticket could not be found.
        </p>

        <Link
          to="/intickets"
          className="mt-3 inline-block text-sm font-medium text-slate-900 hover:underline"
        >
          Back to tickets
        </Link>
      </div>
    );
  }

  const statusClass =
    STATUS_CONFIG[ticket.status] ??
    "bg-slate-50 text-slate-600 border-slate-200";

  const priorityClass =
    PRIORITY_CONFIG[ticket.priority] ?? "text-slate-500";

  return (
    <div className="min-h-full bg-slate-50">
      <div className="mx-auto max-w-7xl p-5 sm:p-6 lg:p-8">
        {/* Top navigation */}
        <div className="mb-5">
          <Link
            to="/intickets"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-900"
          >
            <ArrowLeft size={16} />
            Back to tickets
          </Link>
        </div>

        {/* Header */}
        <div className="mb-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-semibold text-slate-500">
                  {ticket.ticketNumber}
                </span>

                <span
                  className={`rounded-full border px-2.5 py-1 text-xs font-medium ${statusClass}`}
                >
                  {ticket.status.replace(/_/g, " ")}
                </span>

                <span
                  className={`text-xs font-semibold ${priorityClass}`}
                >
                  {ticket.priority}
                </span>
              </div>

              <h1 className="mt-3 text-xl font-semibold tracking-tight text-slate-900">
                {ticket.subject}
              </h1>

              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-500">
                <span className="inline-flex items-center gap-1.5">
                  <User size={14} />
                  {ticket.requesterName ?? "Customer"}
                </span>

                <span className="inline-flex items-center gap-1.5">
                  <Mail size={14} />
                  {ticket.requesterEmail}
                </span>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <button type="button" onClick={() => setAssignOpen(true)} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50" > Assign </button>

              <button className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-slate-800">
                Resolve
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
          {/* Conversation */}
          <div className="min-w-0">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="font-semibold text-slate-900">
                  Conversation
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  {ticket.messages.length} messages
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {ticket.messages.map((message) => {
                const internal = message.isInternal;

                return (
                  <div
                    key={message.id}
                    className={`rounded-xl border shadow-sm ${
                      internal
                        ? "border-amber-200 bg-amber-50/60"
                        : "border-slate-200 bg-white"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-4">
                      <div className="flex min-w-0 items-center gap-3">
                        <div
                          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                            internal
                              ? "bg-amber-100 text-amber-700"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {internal ? (
                            <MessageSquare size={16} />
                          ) : (
                            <User size={16} />
                          )}
                        </div>

                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-slate-800">
                            {message.fromName ??
                              message.fromEmail ??
                              "Unknown"}
                          </p>

                          <p className="mt-0.5 text-xs text-slate-400">
                            {internal
                              ? "Internal note"
                              : message.fromEmail}
                          </p>
                        </div>
                      </div>

                      <div className="flex shrink-0 items-center gap-1.5 text-xs text-slate-400">
                        <Clock3 size={13} />

                        {new Date(
                          message.createdAt
                        ).toLocaleString()}
                      </div>
                    </div>

                    <div className="px-5 py-5">
                      <p className="whitespace-pre-wrap text-sm leading-6 text-slate-700">
                        {message.bodyText}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Composer */}
            <form
              onSubmit={handleSend}
              className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
            >
              <div className="border-b border-slate-100 px-5 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900">
                      {isInternal ? "Internal note" : "Reply to customer"}
                    </h3>

                    <p className="mt-1 text-xs text-slate-500">
                      {isInternal
                        ? "Only your support team will see this message."
                        : "Your message will be sent to the customer by email."}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsInternal((value) => !value)}
                    className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
                      isInternal
                        ? "border-amber-200 bg-amber-50 text-amber-700"
                        : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {isInternal
                      ? "Internal note"
                      : "Switch to internal note"}
                  </button>
                </div>
              </div>

              <textarea
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                rows={6}
                placeholder={
                  isInternal
                    ? "Write an internal note for your team..."
                    : "Write your reply to the customer..."
                }
                className="w-full resize-none border-0 px-5 py-4 text-sm leading-6 text-slate-800 outline-none placeholder:text-slate-400 focus:ring-0"
              />

              <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/50 px-5 py-3">
                <button
                  type="button"
                  className="inline-flex items-center gap-2 text-sm text-slate-500 transition hover:text-slate-800"
                >
                  <Paperclip size={16} />
                  Attach file
                </button>

                <button
                  type="submit"
                  disabled={sending || !reply.trim()}
                  className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Send size={15} />

                  {sending
                    ? "Sending..."
                    : isInternal
                    ? "Add note"
                    : "Send reply"}
                </button>
              </div>
            </form>
          </div>

          {/* Sidebar */}
          <aside className="space-y-4">
            {/* Customer */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-slate-900">
                Customer
              </h3>

              <div className="mt-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-slate-600">
                  {(ticket.requesterName ??
                    ticket.requesterEmail ??
                    "C")[0].toUpperCase()}
                </div>

                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-slate-800">
                    {ticket.requesterName ?? "Customer"}
                  </p>

                  <p className="truncate text-xs text-slate-500">
                    {ticket.requesterEmail}
                  </p>
                </div>
              </div>
            </div>

            {/* Ticket info */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-slate-900">
                Ticket details
              </h3>

              <div className="mt-4 space-y-4">
                <div>
                  <p className="text-xs text-slate-400">Status</p>

                  <p className="mt-1 text-sm font-medium text-slate-700">
                    {ticket.status.replace(/_/g, " ")}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-400">Priority</p>

                  <p
                    className={`mt-1 text-sm font-semibold ${priorityClass}`}
                  >
                    {ticket.priority}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-400">Assigned to</p>

                  <p className="mt-1 text-sm font-medium text-slate-700">
                    {ticket.assignedTo?.name ?? "Unassigned"}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-400">Created</p>

                  <p className="mt-1 text-sm font-medium text-slate-700">
                    {new Date(ticket.createdAt).toLocaleString()}
                  </p>
                </div>
                 <div>
                  <p className="text-xs text-slate-400">Resolved</p>

                  <p className="mt-1 text-sm font-medium text-slate-700">
                    {new Date(ticket.resolvedAt).toLocaleString()}
                  </p>
                </div>
                 <div>
                  <p className="text-xs text-slate-400">Closed</p>

                  <p className="mt-1 text-sm font-medium text-slate-700">
                    {new Date(ticket.closedAt).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Quick info */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-slate-900">
                Quick info
              </h3>

              <div className="mt-4 space-y-3 text-xs text-slate-500">
                <div className="flex justify-between">
                  <span>Messages</span>
                  <span className="font-medium text-slate-700">
                    {ticket.messages.length}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span>Source</span>
                  <span className="font-medium text-slate-700">
                    Email
                  </span>
                </div>

                <div className="flex justify-between">
                  <span>Ticket ID</span>
                  <span className="max-w-[120px] truncate font-medium text-slate-700">
                    {ticket.id}
                  </span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
      <AssignTicketModal
  open={assignOpen}
  ticketId={ticket.id}
  currentAssignedToId={ticket.assignedTo?.id ?? null}
  onClose={() => setAssignOpen(false)}
  onSuccess={() => {
    load();
  }}
/>
    </div>
  );
}
