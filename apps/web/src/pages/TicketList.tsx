import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  PenIcon,
  Plus,
  Ticket as TicketIcon,
  User,
} from "lucide-react";

import { api, Ticket } from "../lib/api";
import Tabs from "../components/ui/Tabs";
import { formatDateTime } from "../utils/formatDateTime";
import DataTable, { DataTableColumn } from "../components/ui/Datatable";
import useDebounce from "../hooks/useDebounce";
import SearchInput from "../components/ui/SearchInput";
import AssignTicketModal from "../components/tickets/AssignTicketModal";

const PAGE_SIZE = 25;

const STATUS_CONFIG: Record<
  string,
  {
    label: string;
    className: string;
  }
> = {
  OPEN: {
    label: "Open",
    className: "bg-blue-50 text-blue-700 border-blue-100",
  },

  ON_HOLD: {
    label: "On hold",
    className: "bg-amber-50 text-amber-700 border-amber-100",
  },

  FOLLOWING_UP: {
    label: "Following up",
    className: "bg-violet-50 text-violet-700 border-violet-100",
  },

  IN_PROGRESS: {
    label: "In progress",
    className: "bg-purple-50 text-purple-700 border-purple-100",
  },

  ANSWERED: {
    label: "Answered",
    className: "bg-cyan-50 text-cyan-700 border-cyan-100",
  },

  AWAITING: {
    label: "Awaiting",
    className: "bg-slate-50 text-slate-600 border-slate-200",
  },

  RESOLVED: {
    label: "Resolved",
    className: "bg-emerald-50 text-emerald-700 border-emerald-100",
  },

  CLOSED: {
    label: "Closed",
    className: "bg-slate-100 text-slate-500 border-slate-200",
  },
};

const PRIORITY_CONFIG: Record<string, string> = {
  CRITICAL: "text-red-600",
  HIGH: "text-orange-600",
  MEDIUM: "text-amber-600",
  LOW: "text-slate-500",
};

function StatusBadge({ status }: { status: string }) {
  const config = STATUS_CONFIG[status] ?? {
    label: status.replace(/_/g, " "),
    className: "bg-slate-50 text-slate-600 border-slate-200",
  };

  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${config.className}`}
    >
      {config.label}
    </span>
  );
}

function Priority({ priority }: { priority: string }) {
  return (
    <span
      className={`text-xs font-medium ${
        PRIORITY_CONFIG[priority] ?? "text-slate-500"
      }`}
    >
      {priority.replace(/_/g, " ")}
    </span>
  );
}

export default function TicketList() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);

  const [page, setPage] = useState(1);
  const [totalTickets, setTotalTickets] = useState(0);
  const [error, setError] = useState("");

  const [assignOpen, setAssignOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] =
    useState<Ticket | null>(null);

  async function loadTickets(
    requestedPage: number,
    requestedStatus: string,
    requestedSearch: string,
  ) {
    try {
      setLoading(true);
      setError("");

      const params: Record<string, string | number> = {
        page: requestedPage,
        pageSize: PAGE_SIZE,
      };

      if (requestedStatus) {
        params.status = requestedStatus;
      }

      if (requestedSearch.trim()) {
        params.search = requestedSearch.trim();
      }

      const response = await api.get("/tickets", { params });

      setTickets(response.data.items ?? []);
      setTotalTickets(response.data.total ?? 0);
    } catch (err: any) {
      setError(
        err?.response?.data?.error ??
          err?.response?.data?.message ??
          "Failed to load tickets.",
      );

      setTickets([]);
      setTotalTickets(0);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    setPage(1);

    loadTickets(1, statusFilter, debouncedSearch);
  }, [statusFilter, debouncedSearch]);

  useEffect(() => {
    if (page === 1) return;

    loadTickets(page, statusFilter, debouncedSearch);
  }, [page]);

  const statusTabs = [
    {
      value: "",
      label: "All",
    },
    {
      value: "OPEN",
      label: "Open",
    },
    {
      value: "ON_HOLD",
      label: "On hold",
    },
    {
      value: "FOLLOWING_UP",
      label: "Following up",
    },
    {
      value: "IN_PROGRESS",
      label: "In progress",
    },
    {
      value: "ANSWERED",
      label: "Answered",
    },
    {
      value: "AWAITING",
      label: "Awaiting",
    },
    {
      value: "RESOLVED",
      label: "Resolved",
    },
    {
      value: "CLOSED",
      label: "Closed",
    },
  ];

const columns: DataTableColumn<Ticket>[] = [
  {
    key: "ticket",
    header: "Ticket",
    className: "whitespace-nowrap",
    render: (ticket) => (
      <Link
        to={`/tickets/${ticket.id}`}
        onClick={(event) => event.stopPropagation()}
        className="font-semibold text-blue-800 transition hover:text-blue-600"
      >
        {ticket.ticketNumber}
      </Link>
    ),
  },

  {
    key: "subject",
    header: "Subject",
    className: "max-w-[280px]",
    render: (ticket) => (
      <p
        className="truncate font-medium text-slate-800"
        title={ticket.subject}
      >
        {ticket.subject}
      </p>
    ),
  },

  {
    key: "requester",
    header: "Requester",
    className: "text-slate-500",
    render: (ticket) => ticket.requesterEmail,
  },

  {
    key: "status",
    header: "Status",
    render: (ticket) => (
      <StatusBadge status={ticket.status} />
    ),
  },

  {
    key: "priority",
    header: "Priority",
    render: (ticket) => (
      <Priority priority={ticket.priority} />
    ),
  },

  {
    key: "department",
    header: "Department",
    className: "whitespace-nowrap text-slate-700",
    render: (ticket) => (
        <span>
          {ticket.department?.name ?? "Unassigned"}
        </span>
    ),
  },

  {
    key: "assigned",
    header: "Assigned",
    className:
      "min-w-[140px] whitespace-nowrap font-medium text-slate-600",
    render: (ticket) => (
      <div className="flex items-center gap-2">

      <span>
        {ticket.assignedTo?.name ?? "Unassigned"}
      </span>
      {/* Assign */}
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();

            setSelectedTicket(ticket);
            setAssignOpen(true);
          }}
          className="inline-flex shrink-0 rounded-md p-1.5 text-blue-500 transition hover:bg-slate-100 hover:text-blue-600"
          title="Assign ticket"
          aria-label={`Assign ${ticket.ticketNumber}`}
        >
          <PenIcon size={14}/>
        </button>
      </div>
    ),
  },

  {
    key: "updatedAt",
    header: "Last Action",
    className: "whitespace-nowrap text-slate-500",
    render: (ticket) =>
      formatDateTime(ticket.updatedAt),
  },

  {
    key: "actions",
    header: "Actions",
    headerClassName: "text-right",
    className: "whitespace-nowrap text-right",
    render: (ticket) => (
      <div className="flex items-center justify-end gap-1">
        {/* Open ticket */}
        <Link
          to={`/tickets/${ticket.id}`}
          onClick={(event) => event.stopPropagation()}
          className="inline-flex rounded-md p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          aria-label={`Open ${ticket.ticketNumber}`}
          title="Open ticket"
        >
          <ArrowUpRight size={17} />
        </Link>
      </div>
    ),
  },
];


  return (
    <div className="min-h-full bg-slate-50">
      <div className="mx-auto max-w-7xl p-5 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          {/* Left */}
          <div>
            <p className="text-sm text-slate-500">
              Support workspace
            </p>

            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">
              Tickets
            </h1>

            <p className="mt-1 text-xs text-slate-500">
              Manage customer conversations and support requests.
            </p>
          </div>

          {/* Right */}
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
            {/* Search */}
            <SearchInput
              value={search}
              onValueChange={setSearch}
              placeholder="Search tickets..."
              className="w-full sm:w-64"
            />

            {/* New ticket */}
            <Link
              to="/tickets/new"
              className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-slate-900 px-3 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800"
            >
              <Plus size={16} />
              New ticket
            </Link>
          </div>
        </div>

        {/* Status Tabs */}
        <div className="mb-4 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <Tabs
            items={statusTabs}
            value={statusFilter}
            onChange={setStatusFilter}
          />
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Table */}
        <DataTable
          columns={columns}
          data={tickets}
          rowKey={(ticket) => ticket.id}
          loading={loading}
          loadingText="Loading tickets..."
          emptyIcon={<TicketIcon size={20} />}
          emptyTitle="No tickets found"
          emptyDescription={
            search.trim() || statusFilter
              ? "Try changing your filters or search query."
              : "There are no tickets to display."
          }
          minWidth="1100px"
          page={page}
          pageSize={PAGE_SIZE}
          total={totalTickets}
          onPageChange={setPage}
        />

        {/* Assign Ticket Modal */}
        <AssignTicketModal
          open={assignOpen}
          ticketId={selectedTicket?.id ?? ""}
          currentAssignedToId={
            selectedTicket?.assignedTo?.id ?? null
          }
          onClose={() => {
            setAssignOpen(false);
            setSelectedTicket(null);
          }}
          onSuccess={() => {
            /*
             * Modal closes itself.
             * We only need to refresh the current page.
             */
            loadTickets(
              page,
              statusFilter,
              debouncedSearch,
            );
          }}
        />
      </div>
    </div>
  );
}
