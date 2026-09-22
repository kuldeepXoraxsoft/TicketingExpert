import { useEffect, useState } from "react";
import { api } from "../../lib/api";
import Modal from "../ui/Modal";
import Button from "../ui/Button";

interface StatusModalProps {
  open: boolean;
  ticketId: string;
  currentStatus: string;
  currentPriority: string;
  onClose: () => void;
  onSuccess: () => void | Promise<void>;
}

const STATUS_OPTIONS = [
  { value: "OPEN", label: "Open" },
  { value: "ON_HOLD", label: "On hold" },
  { value: "FOLLOWING_UP", label: "Following up" },
  { value: "IN_PROGRESS", label: "In progress" },
  { value: "ANSWERED", label: "Answered" },
  { value: "AWAITING", label: "Awaiting" },
  { value: "RESOLVED", label: "Resolved" },
  { value: "CLOSED", label: "Closed" },
];

const PRIORITY_OPTIONS = [
  { value: "LOW", label: "Low" },
  { value: "MEDIUM", label: "Medium" },
  { value: "HIGH", label: "High" },
  { value: "CRITICAL", label: "Critical" },
];

export default function StatusModal({
  open,
  ticketId,
  currentStatus,
  currentPriority,
  onClose,
  onSuccess,
}: StatusModalProps) {
  const [status, setStatus] = useState(currentStatus);
  const [priority, setPriority] = useState(currentPriority);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setStatus(currentStatus);
      setPriority(currentPriority);
      setError("");
    }
  }, [open, currentStatus, currentPriority]);

  async function handleSubmit() {
    if (!ticketId || !status || !priority) return;

    try {
      setSaving(true);
      setError("");

      await api.patch(`/tickets/${ticketId}`, {
        status,
        priority,
      });

      await onSuccess();
      onClose();
    } catch (err: any) {
      setError(
        err?.response?.data?.error ??
          err?.response?.data?.message ??
          "Failed to update ticket.",
      );
    } finally {
      setSaving(false);
    }
  }

  const hasChanges =
    status !== currentStatus ||
    priority !== currentPriority;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Update Ticket"
    >
      <div className="space-y-4">
        {/* Status */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Status
          </label>

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            disabled={saving}
            className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100 disabled:cursor-not-allowed disabled:bg-slate-50"
          >
            {STATUS_OPTIONS.map((option) => (
              <option
                key={option.value}
                value={option.value}
              >
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Priority */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Priority
          </label>

          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            disabled={saving}
            className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100 disabled:cursor-not-allowed disabled:bg-slate-50"
          >
            {PRIORITY_OPTIONS.map((option) => (
              <option
                key={option.value}
                value={option.value}
              >
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Error */}
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-2">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={saving}
          >
            Cancel
          </Button>

          <Button
            type="button"
            onClick={handleSubmit}
            disabled={saving || !hasChanges}
          >
            {saving ? "Updating..." : "Update"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}