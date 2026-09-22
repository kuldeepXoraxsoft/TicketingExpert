import { useEffect, useMemo, useState } from "react";
import {
  Check,
  Search,
  User,
  UserRoundX,
  X,
} from "lucide-react";

import Modal from "../ui/Modal";
import Button from "../ui/Button";
import { api, OrgUser } from "../../lib/api";

type AssignTicketModalProps = {
  open: boolean;
  ticketId: string;
  currentAssignedToId?: string | null;
  onClose: () => void;
  onSuccess?: (user: OrgUser | null) => void;
};

export default function AssignTicketModal({
  open,
  ticketId,
  currentAssignedToId,
  onClose,
  onSuccess,
}: AssignTicketModalProps) {
  const [users, setUsers] = useState<OrgUser[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(
    currentAssignedToId ?? null,
  );

  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;

    setSelectedUserId(currentAssignedToId ?? null);
    setSearch("");
    setError("");

    loadUsers();
  }, [open, currentAssignedToId]);

  async function loadUsers() {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/users", {
        params: {
          page: 1,
          pageSize: 100,
        },
      });

      setUsers(response.data.items ?? response.data.users ?? []);
    } catch (err: any) {
      setUsers([]);

      setError(
        err?.response?.data?.error ??
          err?.response?.data?.message ??
          "Failed to load users.",
      );
    } finally {
      setLoading(false);
    }
  }

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return users;
    }

    return users.filter((user) => {
      return (
        user.name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query) ||
        user.department?.name
          ?.toLowerCase()
          .includes(query)
      );
    });
  }, [users, search]);

  const selectedUser =
    users.find((user) => user.id === selectedUserId) ?? null;

  const hasChanged =
    (selectedUserId ?? null) !==
    (currentAssignedToId ?? null);

  async function handleAssign() {
    if (!ticketId || !hasChanged) return;

    setSaving(true);
    setError("");

    try {
      await api.patch(`/tickets/${ticketId}`, {
        assignedToId: selectedUserId,
      });

      onSuccess?.(selectedUser);

      onClose();
    } catch (err: any) {
      setError(
        err?.response?.data?.error ??
          err?.response?.data?.message ??
          "Failed to assign ticket.",
      );
    } finally {
      setSaving(false);
    }
  }

  function handleClose() {
    if (saving) return;

    setSearch("");
    setError("");
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Assign ticket"
      description="Select a support user to assign this ticket to."
      maxWidth="max-w-lg"
      loading={saving}
      closeOnOverlayClick={!saving}
      closeOnEscape={!saving}
      footer={
        <>
          <Button
            type="button"
            variant="secondary"
            onClick={handleClose}
            disabled={saving}
          >
            Cancel
          </Button>

          <Button
            type="button"
            variant="primary"
            onClick={handleAssign}
            disabled={!hasChanged || loading}
            loading={saving}
            loadingText="Assigning..."
          >
            Assign ticket
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {/* Search */}
        <div className="relative">
          <Search
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            type="text"
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder="Search users..."
            disabled={loading || saving}
            className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-9 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-100 disabled:cursor-not-allowed disabled:bg-slate-50"
          />

          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              disabled={saving}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              aria-label="Clear search"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5">
            <p className="text-xs leading-5 text-red-700">
              {error}
            </p>
          </div>
        )}

        {/* Current assignment */}
        {selectedUser && (
          <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-200 text-slate-600">
                <User size={16} />
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-slate-800">
                  {selectedUser.name}
                </p>

                <p className="truncate text-xs text-slate-500">
                  {selectedUser.email}
                </p>
              </div>

              <span className="text-xs font-medium text-slate-500">
                Selected
              </span>
            </div>
          </div>
        )}

        {/* Users */}
        <div className="overflow-hidden rounded-lg border border-slate-200">
          <div className="max-h-72 overflow-y-auto">
            {loading ? (
              <div className="flex flex-col items-center justify-center px-4 py-10">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-200 border-t-slate-900" />

                <p className="mt-3 text-xs text-slate-500">
                  Loading users...
                </p>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="flex flex-col items-center justify-center px-4 py-10 text-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                  <User size={18} />
                </div>

                <p className="mt-3 text-sm font-medium text-slate-700">
                  No users found
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Try a different search.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {filteredUsers.map((user) => {
                  const selected =
                    selectedUserId === user.id;

                  return (
                    <button
                      key={user.id}
                      type="button"
                      onClick={() =>
                        setSelectedUserId(user.id)
                      }
                      disabled={saving}
                      className={`flex w-full items-center gap-3 px-4 py-3 text-left transition ${
                        selected
                          ? "bg-slate-50"
                          : "bg-white hover:bg-slate-50"
                      } disabled:cursor-not-allowed`}
                    >
                      <div
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                          selected
                            ? "bg-slate-900 text-white"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {user.name
                          .split(" ")
                          .map((part) => part[0])
                          .join("")
                          .slice(0, 2)
                          .toUpperCase()}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-slate-800">
                          {user.name}
                        </p>

                        <p className="truncate text-xs text-slate-500">
                          {user.email}
                        </p>

                        {user.department?.name && (
                          <p className="mt-0.5 truncate text-[11px] text-slate-400">
                            {user.department.name}
                          </p>
                        )}
                      </div>

                      {selected && (
                        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-900 text-white">
                          <Check size={14} />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Unassign */}
        {currentAssignedToId && (
          <button
            type="button"
            onClick={() => setSelectedUserId(null)}
            disabled={saving}
            className={`flex w-full items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition ${
              selectedUserId === null
                ? "border-red-200 bg-red-50 text-red-700"
                : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
            } disabled:cursor-not-allowed disabled:opacity-60`}
          >
            <UserRoundX size={15} />
            Unassign ticket
          </button>
        )}
      </div>
    </Modal>
  );
}
