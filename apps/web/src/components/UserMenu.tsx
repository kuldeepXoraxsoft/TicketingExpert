import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown, Key, LogOut, User as UserIcon } from "lucide-react";

import { useAuth } from "../context/AuthContext";
import ChangePasswordModal from "./Changepassword";
import ConfirmModal from "./confirmModal";
import Badge from "./ui/Badge";

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function UserMenu() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  if (!user) return null;

  function handleLogoutClick() {
    setOpen(false);
    setLogoutOpen(true);
  }

  async function handleConfirmLogout() {
    setLoggingOut(true);

    try {
      logout();
      navigate("/login");
    } finally {
      setLoggingOut(false);
      setLogoutOpen(false);
    }
  }

  return (
    <div className="relative">
      {/* User button */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-lg px-2 py-1.5 transition hover:bg-slate-100"
      >
        {/* Avatar */}
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-900 text-xs font-semibold text-white">
          {initials(user.name)}
        </div>

        {/* User info */}
        <div className="hidden min-w-0 text-left sm:block">
          <p className="max-w-[140px] truncate text-sm font-medium text-slate-800">
            {user.name}
          </p>
        </div>

        {/* Role */}
        <Badge variant="success" className="hidden sm:inline-flex">
          {user.role}
        </Badge>

        {/* Chevron */}
        <ChevronDown
          size={15}
          className={`shrink-0 text-slate-400 transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>
      {/* Dropdown */}
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />

          <div className="absolute right-0 z-20 mt-2 w-56 rounded-lg border border-slate-200 bg-white py-1 shadow-lg">
            {/* User info */}
            <div className="border-b border-slate-200 px-4 py-3">
              <p className="text-sm font-medium text-gray-900">{user.name}</p>

              <p className="truncate text-xs text-gray-500">{user.email}</p>
            </div>

            {/* Settings */}
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                navigate("/settings");
              }}
              className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
            >
              <UserIcon size={16} />
              Profile & settings
            </button>

            {/* Change password */}
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                setChangePasswordOpen(true);
              }}
              className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
            >
              <Key size={16} />
              Change Password
            </button>

            {/* Logout */}
            <button
              type="button"
              onClick={handleLogoutClick}
              className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50"
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </>
      )}

      {/* Change password modal */}
      <ChangePasswordModal
        open={changePasswordOpen}
        onClose={() => setChangePasswordOpen(false)}
      />

      {/* Logout confirmation */}
      <ConfirmModal
        open={logoutOpen}
        onClose={() => {
          if (!loggingOut) {
            setLogoutOpen(false);
          }
        }}
        onConfirm={handleConfirmLogout}
        title="Logout?"
        description="Are you sure you want to logout from your account?"
        confirmText="Logout"
        cancelText="Cancel"
        variant="warning"
        loading={loggingOut}
        loadingText="Logging out..."
      />
    </div>
  );
}
