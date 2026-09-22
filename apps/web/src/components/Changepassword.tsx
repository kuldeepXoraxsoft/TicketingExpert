import { useState } from "react";
import { Eye, EyeOff, KeyRound } from "lucide-react";

import Modal from "../components/ui/Modal";
import Button from "../components/ui/Button";
import Input from "../components/ui/input";
import { authApi } from "../api/authApi";

type ChangePasswordModalProps = {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
};

export default function ChangePasswordModal({
  open,
  onClose,
  onSuccess,
}: ChangePasswordModalProps) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Single toggle controls visibility for all three fields.
  const [showPasswords, setShowPasswords] = useState(false);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const resetForm = () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setShowPasswords(false);
    setError("");
  };

  const handleClose = () => {
    if (saving) return;
    resetForm();
    onClose();
  };

  const handleSubmit = async () => {
    setError("");

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError("Please fill in all password fields.");
      return;
    }

    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters.");
      return;
    }

    // Match check happens only here, on submit — not live while typing.
    if (newPassword !== confirmPassword) {
      setError("New password and confirmation do not match.");
      return;
    }

    if (currentPassword === newPassword) {
      setError("New password must be different from your current password.");
      return;
    }

    setSaving(true);

    try {
      await authApi.changePassword({ currentPassword, newPassword });

      resetForm();
      onClose();
      onSuccess?.();
    } catch (error: any) {
      setError(
        error?.response?.data?.error ||
          error?.response?.data?.message ||
          "Failed to change password."
      );
    } finally {
      setSaving(false);
    }
  };

  const passwordType = showPasswords ? "text" : "password";

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Change password"
      description="Update your account password."
      maxWidth="max-w-md"
      loading={saving}
      closeOnOverlayClick={!saving}
      closeOnEscape={!saving}
      footer={
        <>
          <Button type="button" variant="secondary" onClick={handleClose} disabled={saving}>
            Cancel
          </Button>

          <Button
            type="button"
            variant="primary"
            loading={saving}
            loadingText="Updating..."
            onClick={handleSubmit}
            disabled={!currentPassword || !newPassword || !confirmPassword}
          >
            <KeyRound size={15} />
            Change password
          </Button>
        </>
      }
    >
      <div className="space-y-5">
        {/* Error */}
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5">
            <p className="text-xs leading-5 text-red-700">{error}</p>
          </div>
        )}

        {/* Current password */}
        <Input
          id="current-password"
          label="Current password"
          type={passwordType}
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          placeholder="Enter current password"
          autoFocus
          disabled={saving}
          icon={<KeyRound size={16} />}
        />

        {/* New password — single toggle for all three fields lives here */}
        <div className="relative">
        <Input
          id="new-password"
          label="New password"
          type={passwordType}
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder="Enter new password"
          disabled={saving}
          icon={<KeyRound size={16} />}
        />
         <button
            type="button"
            onClick={() => setShowPasswords((prev) => !prev)}
            disabled={saving}
            aria-label={showPasswords ? "Hide passwords" : "Show passwords"}
            className="absolute right-2 bottom-1.5 rounded-md p-1.5 text-slate-400 transition hover:bg-slate-50 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {showPasswords ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>

        {/* Confirm password */}
          <Input
            id="confirm-password"
            label="Confirm new password"
            type={passwordType}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm new password"
            disabled={saving}
            icon={<KeyRound size={16} />}
            className="pr-10"
          />

         
      </div>
    </Modal>
  );
}