import { useEffect, useState } from "react";
import {
  ArrowUpRight,
  Building2,
  ChevronRight,
  Mail,
  PenIcon,
  Plus,
  Search,

  Ticket,
  Users,
  X,
} from "lucide-react";

import { api, Department } from "../lib/api";
import { useAuth } from "../context/AuthContext";

import Badge from "../components/ui/Badge";
import Modal from "../components/ui/Modal";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import DataTable, {
  DataTableColumn,
} from "../components/ui/Datatable";

import useDebounce from "../hooks/useDebounce";

const PAGE_SIZE = 25;

function EmailStatus({
  active = true,
}: {
  active?: boolean;
}) {
  return (
    <Badge
      variant={active ? "success" : "default"}
    >
      {active ? "Active" : "Inactive"}
    </Badge>
  );
}

export default function Departments() {
  const { user } = useAuth();

  const isAdmin = user?.role === "ADMIN";

  const [departments, setDepartments] =
    useState<Department[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [search, setSearch] =
    useState("");

  const debouncedSearch =
    useDebounce(search, 500);

  const [page, setPage] =
    useState(1);

  const [totalDepartments, setTotalDepartments] =
    useState(0);

  const [error, setError] =
    useState("");

  const [showCreateModal, setShowCreateModal] =
    useState(false);

  const [name, setName] =
    useState("");

  const [creating, setCreating] =
    useState(false);

  async function loadDepartments(
    requestedPage: number,
    requestedSearch: string
  ) {
    try {
      setLoading(true);
      setError("");

      const params: Record<
        string,
        string | number
      > = {
        page: requestedPage,
        pageSize: PAGE_SIZE,
      };

      if (requestedSearch.trim()) {
        params.search =
          requestedSearch.trim();
      }

      const response = await api.get(
        "/departments",
        {
          params,
        }
      );

      setDepartments(
        response.data.items ?? []
      );

      setTotalDepartments(
        response.data.total ?? 0
      );
    } catch (err: any) {
      console.error(
        "Failed to load departments:",
        err
      );

      setError(
        err?.response?.data?.error ??
          err?.response?.data?.message ??
          "Failed to load departments."
      );

      setDepartments([]);
      setTotalDepartments(0);
    } finally {
      setLoading(false);
    }
  }

  /*
   * Initial load + search change.
   *
   * Whenever search changes, go back to page 1.
   */
  useEffect(() => {
    setPage(1);

    loadDepartments(
      1,
      debouncedSearch
    );
  }, [debouncedSearch]);

  /*
   * Pagination.
   */
  useEffect(() => {
    if (page === 1) return;

    loadDepartments(
      page,
      debouncedSearch
    );
  }, [page]);

  function openCreateModal() {
    setError("");
    setName("");
    setShowCreateModal(true);
  }

  function closeCreateModal() {
    if (creating) return;

    setShowCreateModal(false);
    setName("");
    setError("");
  }

  async function handleCreate(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const departmentName =
      name.trim();

    if (!departmentName) {
      setError(
        "Department name is required."
      );
      return;
    }

    try {
      setCreating(true);
      setError("");

      await api.post("/departments", {
        name: departmentName,
      });

      setShowCreateModal(false);
      setName("");

      /*
       * Reload current filtered page.
       */
      await loadDepartments(
        page,
        debouncedSearch
      );
    } catch (err: any) {
      console.error(
        "Failed to create department:",
        err
      );

      setError(
        err?.response?.data?.error ??
          err?.response?.data?.message ??
          "Failed to create department."
      );
    } finally {
      setCreating(false);
    }
  }

  const columns: DataTableColumn<Department>[] =
    [
      {
        key: "department",

        header: "Department",

        render: (department) => (
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100">
              <Building2
                size={15}
                className="text-slate-600"
              />
            </div>

            <div className="min-w-0">
              <p className="truncate font-semibold text-slate-900">
                {department.name}
              </p>
            </div>
          </div>
        ),
      },

      {
        key: "email",

        header: "Email",

        render: (department) => (
          <div className="flex items-center gap-2 text-slate-600">
            <Mail
              size={15}
              className="shrink-0 text-slate-400"
            />

            <span className="max-w-[240px] truncate font-medium">
              {department.email ??
                "organization@gmail.com"}
            </span>
          </div>
        ),
      },

      {
        key: "smtp",

        header: "SMTP Status",

        render: () => (
          <EmailStatus active />
        ),
      },

      {
        key: "imap",

        header: "IMAP Status",

        render: () => (
          <EmailStatus active />
        ),
      },

      {
        key: "users",

        header: "Users",

        render: (department) => (
          <div className="flex items-center gap-2 text-slate-600">
            <Users
              size={15}
              className="text-slate-400"
            />

            <span className="font-medium">
              {department._count?.users ??
                0}
            </span>
          </div>
        ),
      },

      {
        key: "tickets",

        header: "Tickets",

        render: (department) => (
          <div className="flex items-center gap-2 text-slate-600">
            <Ticket
              size={15}
              className="text-slate-400"
            />

            <span className="font-medium">
              {department._count?.tickets ??
                0}
            </span>
          </div>
        ),
      },

      {
        key: "actions",

        header: "Actions",

        headerClassName: "text-right",

        className: "text-right",

        render: () => (
          <div className="flex items-center justify-end gap-1">
            <button
              type="button"
              className="inline-flex rounded-md p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              title="Edit department"
            >
              <PenIcon size={14} />
            </button>

            <button
              type="button"
              className="inline-flex rounded-md p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              title="View department"
            >
              <ArrowUpRight size={17} />
            </button>
          </div>
        ),
      },
    ];

  return (
    <div className="min-h-full bg-slate-50">
      <div className="mx-auto max-w-7xl p-5 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm text-slate-500">
              <span>Workspace</span>

              <ChevronRight size={14} />

              <span className="text-slate-700">
                Departments
              </span>
            </div>

            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
              Departments
            </h1>

            <p className="mt-1 text-xs text-slate-500">
              Manage departments and ticket routing.
            </p>
          </div>

          {isAdmin && (
            <Button
              type="button"
              onClick={openCreateModal}
            >
              <Plus size={16} />
              Add department
            </Button>
          )}
        </div>

        {/* Error */}
        {error &&
          !showCreateModal && (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

        {/* Search */}
        <div className="mb-4 flex items-center justify-between gap-4">
           <div className="relative w-full max-w-xs">
            <Search
              size={15}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
              placeholder="Search departments..."
              className="h-9 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-8 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
            />

            {search && (
              <button
                type="button"
                onClick={() =>
                  setSearch("")
                }
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                aria-label="Clear search"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Table */}
        <DataTable
          columns={columns}
          data={departments}
          rowKey={(department) =>
            department.id
          }
          loading={loading}
          loadingText="Loading departments..."
          emptyIcon={
            <Building2 size={20} />
          }
          emptyTitle="No departments found"
          emptyDescription={
            search.trim()
              ? "Try changing your search query."
              : isAdmin
              ? "Create your first department to start routing tickets."
              : "Ask an admin to create a department."
          }
          minWidth="950px"
          page={page}
          pageSize={PAGE_SIZE}
          total={totalDepartments}
          onPageChange={setPage}
        />
      </div>

      {/* Create Department Modal */}
      <Modal
        open={showCreateModal}
        onClose={closeCreateModal}
        title="Add department"
        description="Users assigned here will only see this department's tickets."
        loading={creating}
        maxWidth="max-w-md"
        closeOnOverlayClick={false}
      >
        <form onSubmit={handleCreate}>
          <div className="space-y-4">
            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700">
                {error}
              </div>
            )}

            <Input
              id="department-name"
              label="Department name"
              value={name}
              onChange={(event) =>
                setName(event.target.value)
              }
              placeholder="e.g. IT Support"
              disabled={creating}
              autoFocus
            />
          </div>

          <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-end">
            <Button
              type="button"
              variant="secondary"
              onClick={closeCreateModal}
              disabled={creating}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              loading={creating}
              loadingText="Creating..."
            >
              Create department
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

function SearchIcon() {
  return (
    <Search
      size={15}
      className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
    />
  );
}