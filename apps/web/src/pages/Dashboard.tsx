import {
  AlertCircle,
  ArrowUpRight,
  CheckCircle2,
  Clock3,
  Inbox,
  MessageSquare,
  Plus,
  Ticket,
  UserCheck,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const stats = [
  {
    label: "Open Tickets",
    value: 9,
    change: "Active",
    description: "currently open",
    icon: Inbox,
  },
  {
    label: "Awaiting Tickets",
    value: 12,
    change: "Waiting",
    description: "customer response",
    icon: Clock3,
  },
  {
    label: "Closed Tickets",
    value: 20,
    change: "Completed",
    description: "closed tickets",
    icon: CheckCircle2,
  },
  {
    label: "Created Today",
    value: 17,
    change: "Today",
    description: "new tickets",
    icon: Ticket,
  },
  {
    label: "Assigned to Me",
    value: 12,
    change: "My queue",
    description: "assigned tickets",
    icon: UserCheck,
  },
];

const recentTickets = [
  {
    id: "TKT-001248",
    subject: "Unable to access company portal",
    customer: "Rahul Sharma",
    status: "Open",
    priority: "High",
    time: "8 min ago",
  },
  {
    id: "TKT-001247",
    subject: "Invoice for September",
    customer: "Acme Solutions",
    status: "Waiting",
    priority: "Medium",
    time: "24 min ago",
  },
  {
    id: "TKT-001246",
    subject: "Password reset request",
    customer: "Neha Verma",
    status: "Resolved",
    priority: "Low",
    time: "42 min ago",
  },
  {
    id: "TKT-001245",
    subject: "Email delivery issue",
    customer: "TechNova Pvt Ltd",
    status: "Open",
    priority: "Critical",
    time: "1 hr ago",
  },
  {
    id: "TKT-001244",
    subject: "Request for account update",
    customer: "Amit Gupta",
    status: "Open",
    priority: "Medium",
    time: "1 hr ago",
  },
];


const ticketOverviewData = [
  {
    day: "Mon, 7 Sep 2026",
    OPEN: 8,
    ON_HOLD: 4,
    FOLLOWING_UP: 3,
    IN_PROGRESS: 6,
    ANSWERED: 5,
    AWAITING: 4,
    RESOLVED: 7,
    CLOSED: 6,
  },
  {
    day: "Tue, 8 Sep 2026",
    OPEN: 10,
    ON_HOLD: 3,
    FOLLOWING_UP: 5,
    IN_PROGRESS: 7,
    ANSWERED: 6,
    AWAITING: 5,
    RESOLVED: 8,
    CLOSED: 7,
  },
  {
    day: "Wed, 9 Sep 2026",
    OPEN: 12,
    ON_HOLD: 5,
    FOLLOWING_UP: 4,
    IN_PROGRESS: 8,
    ANSWERED: 7,
    AWAITING: 6,
    RESOLVED: 9,
    CLOSED: 8,
  },
  {
    day: "Thu, 10 Sep 2026",
    OPEN: 9,
    ON_HOLD: 4,
    FOLLOWING_UP: 6,
    IN_PROGRESS: 9,
    ANSWERED: 8,
    AWAITING: 5,
    RESOLVED: 10,
    CLOSED: 9,
  },
  {
    day: "Fri, 11 Sep 2026",
    OPEN: 14,
    ON_HOLD: 6,
    FOLLOWING_UP: 5,
    IN_PROGRESS: 10,
    ANSWERED: 8,
    AWAITING: 7,
    RESOLVED: 11,
    CLOSED: 10,
  },
  {
    day: "Sat, 12 Sep 2026",
    OPEN: 7,
    ON_HOLD: 3,
    FOLLOWING_UP: 4,
    IN_PROGRESS: 6,
    ANSWERED: 5,
    AWAITING: 4,
    RESOLVED: 8,
    CLOSED: 7,
  },
  {
    day: "Sun, 13 Sep 2026",
    OPEN: 6,
    ON_HOLD: 2,
    FOLLOWING_UP: 3,
    IN_PROGRESS: 5,
    ANSWERED: 4,
    AWAITING: 3,
    RESOLVED: 7,
    CLOSED: 6,
  },
];

const STATUS_CHART_CONFIG = [
  {
    key: "CLOSED",
    label: "Closed",
    className: "bg-slate-500",
  },
  {
    key: "RESOLVED",
    label: "Resolved",
    className: "bg-emerald-600",
  },
  {
    key: "AWAITING",
    label: "Awaiting",
    className: "bg-slate-300",
  },
  {
    key: "ANSWERED",
    label: "Answered",
    className: "bg-sky-600",
  },
  {
    key: "IN_PROGRESS",
    label: "In progress",
    className: "bg-indigo-600",
  },
  {
    key: "FOLLOWING_UP",
    label: "Following up",
    className: "bg-violet-600",
  },
  {
    key: "ON_HOLD",
    label: "On hold",
    className: "bg-amber-500",
  },
  {
    key: "OPEN",
    label: "Open",
    className: "bg-red-600",
  },
] as const;

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    Open: "bg-red-50 text-red-700 border-red-100",
    Waiting: "bg-amber-50 text-amber-700 border-amber-100",
    Resolved: "bg-emerald-50 text-emerald-700 border-emerald-100",
  };

  return (
    <span
      className={`rounded-full border px-2.5 py-1 text-xs font-medium ${
        styles[status] ?? "bg-slate-50 text-slate-600 border-slate-200"
      }`}
    >
      {status}
    </span>
  );
}

function PriorityBadge({ priority }: { priority: string }) {
  const styles: Record<string, string> = {
    Critical: "text-red-600",
    High: "text-orange-600",
    Medium: "text-amber-600",
    Low: "text-slate-500",
  };

  return (
    <span
      className={`text-xs font-medium ${
        styles[priority] ?? "text-slate-500"
      }`}
    >
      {priority}
    </span>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();

  const maxTotal = Math.max(
    ...ticketOverviewData.map((day) =>
      STATUS_CHART_CONFIG.reduce(
        (sum, status) => sum + day[status.key],
        0
      )
    )
  );

  return (
    <div className="min-h-full bg-slate-50">
      <div className="mx-auto max-w-7xl p-5 sm:p-6 lg:p-8">

        {/* Header */}
        <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm font-medium text-slate-500">
              Wednesday, September 16
            </p>

            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">
              Good afternoon
            </h1>

            <p className="mt-1 text-xs text-slate-500">
              Here's what's happening with your support tickets today.
            </p>
          </div>

          <button className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-slate-900 px-3 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800">
            <Plus size={17} />
            New Ticket
          </button>
        </div>

        {/* Stats */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {stats.map((stat) => {
            const Icon = stat.icon;

            return (
              <div
                key={stat.label}
                className="rounded-lg border border-slate-200 bg-white px-4 py-3.5 shadow-sm"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-xs font-medium text-slate-500">
                      {stat.label}
                    </p>

                    <p className="mt-1 text-xl font-semibold tracking-tight text-slate-900">
                      {stat.value}
                    </p>
                  </div>

                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                    <Icon size={16} />
                  </div>
                </div>

                <div className="mt-2 flex items-center gap-1.5 text-[11px]">
                  <span className="font-medium text-emerald-600">
                    {stat.change}
                  </span>

                  <span className="truncate text-slate-400">
                    {stat.description}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Main Grid */}
        <div className="mt-6 grid gap-4 lg:grid-cols-2">

          {/* Ticket Overview */}
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm lg:col-span-1">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3">
              <div>
                <h2 className="font-semibold text-slate-900">
                  Ticket overview
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Ticket activity for the last 7 days
                </p>
              </div>

              <button className="text-sm font-medium text-slate-600 hover:text-slate-900 hover:underline">
                View reports
              </button>
            </div>

            {/* Chart */}
            <div className="px-5 pb-5 pt-6">

              {/* Chart Area */}
              <div className="relative h-80">
                <div className="absolute inset-x-0 bottom-7 top-0 flex items-end gap-3 sm:gap-5">

                  {ticketOverviewData.map((day) => {
                    const total = STATUS_CHART_CONFIG.reduce(
                      (sum, status) => sum + day[status.key],
                      0
                    );

                    const barHeight = Math.max(
                      (total / maxTotal) * 100,
                      18
                    );

                    return (
                      <div
                        key={day.day}
                        className="group relative flex h-full flex-1 items-end justify-center"
                      >
                        {/* Tooltip */}
                       <div className="pointer-events-none absolute left-1/2 top-2 z-30 hidden w-44 -translate-x-1/2 rounded-lg bg-black px-3 py-2.5 text-white shadow-xl group-hover:block">
                          <div className="mb-2 flex items-center justify-between border-b border-white/20 pb-2">
                            <span className="text-xs font-semibold">
                              {day.day}
                            </span>

                            <span className="text-xs font-bold">
                              {total} tickets
                            </span>
                          </div>

                          <div className="space-y-1">
                            {[
                              ...STATUS_CHART_CONFIG,
                            ]
                              .reverse()
                              .map((status) => (
                                <div
                                  key={status.key}
                                  className="flex items-center justify-between gap-3"
                                >
                                  <div className="flex min-w-0 items-center gap-1.5">
                                    <span
                                      className={`h-2 w-2 shrink-0 rounded-full ${status.className}`}
                                    />

                                    <span className="truncate text-[11px] text-white/80">
                                      {status.label}
                                    </span>
                                  </div>

                                  <span className="text-[11px] font-semibold text-white">
                                    {day[status.key]}
                                  </span>
                                </div>
                              ))}
                          </div>
                        </div>

                        {/* Bar */}
                        <div
                          className="w-full max-w-[48px] overflow-hidden rounded-t-md"
                          style={{
                            height: `${barHeight}%`,
                          }}
                        >
                          <div className="flex h-full w-full flex-col">
                            {STATUS_CHART_CONFIG.map((status) => (
                              <div
                                key={status.key}
                                className={`w-full basis-0 transition-all duration-200 group-hover:brightness-95 ${status.className}`}
                                style={{
                                  flexGrow: day[status.key],
                                }}
                              />
                            ))}
                          </div>
                        </div>

                        {/* Day */}
                        <span className="absolute -bottom-9 text-[11px] font-medium text-slate-500">
                          {day.day}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Baseline */}
                <div className="absolute bottom-7 left-0 right-0 border-b border-slate-200" />
              </div>

              {/* Legend */}
              <div className="mt-8 flex flex-wrap justify-center gap-x-5 gap-y-2 border-t border-slate-100 pt-4">
                {[
                  ...STATUS_CHART_CONFIG,
                ]
                  .reverse()
                  .map((status) => (
                    <div
                      key={status.key}
                      className="flex items-center gap-1.5"
                    >
                      <span
                        className={`h-2.5 w-2.5 rounded-sm ${status.className}`}
                      />

                      <span className="text-[11px] text-slate-600">
                        {status.label}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          </div>

          {/* Recent Tickets */}
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm lg:col-span-1">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3">
              <div>
                <h2 className="font-semibold text-slate-900">
                  Recent client tickets
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Latest activity across your workspace
                </p>
              </div>

              <button
                className="text-sm font-medium text-slate-600 hover:text-slate-900 hover:underline"
                onClick={() => navigate("/intickets")}
              >
                View all
              </button>
            </div>

            <div className="max-h-[400px] divide-y divide-slate-100 overflow-y-auto">
              {recentTickets.map((ticket) => (
                <div
                  key={ticket.id}
                  className="flex items-center gap-4 px-5 py-4 transition hover:bg-slate-50"
                >
                  <div className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500 sm:flex">
                    <MessageSquare size={17} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-semibold text-slate-500">
                        {ticket.id}
                      </span>

                      <PriorityBadge priority={ticket.priority} />
                    </div>

                    <p className="mt-1 truncate text-sm font-medium text-slate-900">
                      {ticket.subject}
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      {ticket.customer} · {ticket.time}
                    </p>
                  </div>

                  <div className="hidden sm:block">
                    <StatusBadge status={ticket.status} />
                  </div>

                  <button className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700">
                    <ArrowUpRight size={17} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}