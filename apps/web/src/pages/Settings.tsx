import { useState } from "react";
import {
  Bell,
  Building2,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  Mail,
  RefreshCw,
  Save,
  Server,
  Shield,
  User,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";
import Tabs from "../components/ui/Tabs";
import { authApi } from "../api/authApi";
import ChangePasswordModal from "../components/Changepassword";

type SettingsTab = "general" | "notifications" | "email";

export default function Settings() {
  const { user } = useAuth();

  const isAdmin = user?.role === "ADMIN";

  const [activeTab, setActiveTab] =
    useState<SettingsTab>("general");

  const tabs = [
    {
      value: "general",
      label: "General",
      icon: <User size={16} />,
    },
    {
      value: "notifications",
      label: "Notifications",
      icon: <Bell size={16} />,
    },

    ...(isAdmin
      ? [
          {
            value: "email",
            label: "Email",
            icon: <Mail size={16} />,
          },
        ]
      : []),
  ];

  return (
    <div className="min-h-full bg-slate-50">
      <div className="mx-auto max-w-7xl p-6 lg:p-8">
        {/* Header */}
        <div className="mb-6">
          <p className="mb-2 text-sm text-slate-500">
            Account & Workspace
          </p>

          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Settings
          </h1>

          <p className="mt-1 text-xs text-slate-500">
            Manage your account, notifications and department email
            configuration.
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-6 rounded-xl border border-slate-200 bg-white px-2 shadow-sm">
          <Tabs
            items={tabs}
            value={activeTab}
            onChange={(value) =>
              setActiveTab(value as SettingsTab)
            }
          />
        </div>

        {/* Content */}
        <main className="min-w-0">
          {activeTab === "general" && (
            <GeneralSettings user={user} />
          )}

          {activeTab === "notifications" && (
            <NotificationSettings />
          )}

          {activeTab === "email" && isAdmin && (
            <EmailSettings user={user} />
          )}
        </main>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* General                                                                     */
/* -------------------------------------------------------------------------- */

function GeneralSettings({ user }: { user: any }) { const [changePasswordOpen, setChangePasswordOpen] = useState(false); const initials = user?.name ?.split(" ") .map((part: string) => part[0]) .join("") .slice(0, 2) .toUpperCase() || "U"; return ( <> <div className="space-y-6"> {/* Personal Information */} <SettingsCard title="Personal information" description="Your account information and department details." > <div className="flex flex-col gap-6 sm:flex-row sm:items-center"> <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-slate-900 text-xl font-semibold text-white"> {initials} </div> <div> <h2 className="text-lg font-semibold text-slate-900"> {user?.name || "User"} </h2> <p className="mt-1 text-sm text-slate-500"> {user?.email || "No email available"} </p> <div className="mt-3 inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium capitalize text-slate-600"> {user?.role || "User"} </div> </div> </div> </SettingsCard> {/* Account details */} <SettingsCard title="Account details" description="Information associated with your account." > <div className="grid gap-5 sm:grid-cols-2"> <InfoField icon={User} label="Full name" value={user?.name || "Not available"} /> <InfoField icon={Mail} label="Email address" value={user?.email || "Not available"} /> <InfoField icon={Shield} label="Role" value={user?.role || "Not available"} capitalize /> <InfoField icon={Building2} label="Department" value={user?.department?.name || "Not assigned"} /> </div> </SettingsCard> {/* Security */} <SettingsCard title="Security" description="Manage your account security settings." > <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"> <div> <p className="text-sm font-medium text-slate-800"> Password </p> <p className="mt-1 text-xs text-slate-500"> Change your account password. </p> </div> <button type="button" onClick={() => setChangePasswordOpen(true)} className="inline-flex w-fit items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50" > <KeyRound size={16} /> Change password </button> </div> </SettingsCard> </div> <ChangePasswordModal open={changePasswordOpen} onClose={() => setChangePasswordOpen(false)} /> </> ); }

/* -------------------------------------------------------------------------- */
/* Notifications                                                               */
/* -------------------------------------------------------------------------- */

function NotificationSettings() {
  const [emailNotifications, setEmailNotifications] =
    useState(true);

  const [ticketNotifications, setTicketNotifications] =
    useState(true);

  const [assignmentNotifications, setAssignmentNotifications] =
    useState(true);

  const [commentNotifications, setCommentNotifications] =
    useState(true);

  const [mentionNotifications, setMentionNotifications] =
    useState(true);

  return (
    <div className="space-y-6">
      <SettingsCard
        title="Notification preferences"
        description="Choose which notifications you want to receive."
      >
        <div className="divide-y divide-slate-100">
          <SettingToggle
            title="Email notifications"
            description="Receive important ticket and system updates by email."
            enabled={emailNotifications}
            onChange={setEmailNotifications}
          />

          <SettingToggle
            title="New ticket notifications"
            description="Get notified when a new ticket is created."
            enabled={ticketNotifications}
            onChange={setTicketNotifications}
          />

          <SettingToggle
            title="Assignment notifications"
            description="Get notified when a ticket is assigned to you."
            enabled={assignmentNotifications}
            onChange={setAssignmentNotifications}
          />

          <SettingToggle
            title="Comment notifications"
            description="Get notified when someone adds a comment to a ticket."
            enabled={commentNotifications}
            onChange={setCommentNotifications}
          />

          <SettingToggle
            title="Mention notifications"
            description="Get notified when you are mentioned in a ticket conversation."
            enabled={mentionNotifications}
            onChange={setMentionNotifications}
          />
        </div>
      </SettingsCard>

    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Email Configuration                                                         */
/* -------------------------------------------------------------------------- */

function EmailSettings({ user }: { user: any }) {
  const [showSmtpPassword, setShowSmtpPassword] =
    useState(false);

  const [showImapPassword, setShowImapPassword] =
    useState(false);

  const [smtp, setSmtp] = useState({
    host: "",
    port: "587",
    username: "",
    password: "",
    fromName: "",
    fromEmail: "",
    replyTo: "",
    tls: true,
    ssl: false,
  });

  const [imap, setImap] = useState({
    host: "",
    port: "993",
    username: "",
    password: "",
    mailbox: "INBOX",
    ssl: true,
    tls: false,
    enabled: true,
    markAsRead: true,
    deleteAfterImport: false,
  });

  const [saving, setSaving] = useState(false);
  const [testingSmtp, setTestingSmtp] =
    useState(false);
  const [testingImap, setTestingImap] =
    useState(false);

  const updateSmtp = (
    field: string,
    value: string | boolean
  ) => {
    setSmtp((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const updateImap = (
    field: string,
    value: string | boolean
  ) => {
    setImap((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async () => {
    setSaving(true);

    try {
      // Connect with API:
      //
      // await settingsApi.updateDepartmentEmailConfig({
      //   departmentId: user?.departmentId,
      //   smtp,
      //   imap,
      // });

      await new Promise((resolve) =>
        setTimeout(resolve, 500)
      );
    } finally {
      setSaving(false);
    }
  };

  const handleTestSmtp = async () => {
    setTestingSmtp(true);

    try {
      // await settingsApi.testSmtp({
      //   departmentId: user?.departmentId,
      //   smtp,
      // });

      await new Promise((resolve) =>
        setTimeout(resolve, 700)
      );
    } finally {
      setTestingSmtp(false);
    }
  };

  const handleTestImap = async () => {
    setTestingImap(true);

    try {
      // await settingsApi.testImap({
      //   departmentId: user?.departmentId,
      //   imap,
      // });

      await new Promise((resolve) =>
        setTimeout(resolve, 700)
      );
    } finally {
      setTestingImap(false);
    }
  };

  return (
    <div className="space-y-6">
   

      {/* SMTP */}
      <SettingsCard
        title="Outgoing mail (SMTP)"
        description="Configure the mailbox used to send ticket notifications, replies and system emails."
      >
        <div className="space-y-5">
          <div className="grid gap-5 md:grid-cols-2">
            <FormField
              label="SMTP host"
              placeholder="smtp.gmail.com"
              value={smtp.host}
              onChange={(value) =>
                updateSmtp("host", value)
              }
              icon={Server}
            />

            <FormField
              label="SMTP port"
              placeholder="587"
              value={smtp.port}
              onChange={(value) =>
                updateSmtp("port", value)
              }
            />

            <FormField
              label="SMTP username / email"
              placeholder="support@example.com"
              value={smtp.username}
              onChange={(value) =>
                updateSmtp("username", value)
              }
              icon={Mail}
            />

            <PasswordField
              label="SMTP app password"
              placeholder="Enter app password"
              value={smtp.password}
              visible={showSmtpPassword}
              onChange={(value) =>
                updateSmtp("password", value)
              }
              onToggle={() =>
                setShowSmtpPassword(
                  (prev) => !prev
                )
              }
            />

            <FormField
              label="From name"
              placeholder="Support Team"
              value={smtp.fromName}
              onChange={(value) =>
                updateSmtp("fromName", value)
              }
              icon={User}
            />

            <FormField
              label="From email"
              placeholder="support@example.com"
              value={smtp.fromEmail}
              onChange={(value) =>
                updateSmtp("fromEmail", value)
              }
              icon={Mail}
            />

            <FormField
              label="Reply-To email"
              placeholder="support@example.com"
              value={smtp.replyTo}
              onChange={(value) =>
                updateSmtp("replyTo", value)
              }
              icon={Mail}
            />
          </div>

          <div className="grid gap-3 border-t border-slate-100 pt-5 sm:grid-cols-2">
            <ToggleRow
              title="Use TLS"
              description="Recommended for SMTP port 587."
              enabled={smtp.tls}
              onChange={(value) => {
                updateSmtp("tls", value);

                if (value) {
                  updateSmtp("ssl", false);
                  updateSmtp("port", "587");
                }
              }}
            />

            <ToggleRow
              title="Use SSL"
              description="Use for providers requiring implicit SSL."
              enabled={smtp.ssl}
              onChange={(value) => {
                updateSmtp("ssl", value);

                if (value) {
                  updateSmtp("tls", false);
                  updateSmtp("port", "465");
                }
              }}
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-5">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Shield size={14} />
              <span>
                SMTP credentials are stored securely.
              </span>
            </div>

            <button
              type="button"
              onClick={handleTestSmtp}
              disabled={testingSmtp}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw
                size={15}
                className={
                  testingSmtp
                    ? "animate-spin"
                    : ""
                }
              />

              {testingSmtp
                ? "Testing..."
                : "Test SMTP"}
            </button>
          </div>
        </div>
      </SettingsCard>

      {/* IMAP */}
      <SettingsCard
        title="Incoming mail (IMAP)"
        description="Configure the mailbox from which incoming emails will be imported as tickets."
      >
        <div className="space-y-5">
          <ToggleRow
            title="Enable email import"
            description="Automatically check the configured mailbox for new emails."
            enabled={imap.enabled}
            onChange={(value) =>
              updateImap("enabled", value)
            }
          />

          <div className="border-t border-slate-100 pt-5">
            <div className="grid gap-5 md:grid-cols-2">
              <FormField
                label="IMAP host"
                placeholder="imap.gmail.com"
                value={imap.host}
                onChange={(value) =>
                  updateImap("host", value)
                }
                icon={Server}
              />

              <FormField
                label="IMAP port"
                placeholder="993"
                value={imap.port}
                onChange={(value) =>
                  updateImap("port", value)
                }
              />

              <FormField
                label="IMAP username / email"
                placeholder="support@example.com"
                value={imap.username}
                onChange={(value) =>
                  updateImap("username", value)
                }
                icon={Mail}
              />

              <PasswordField
                label="IMAP app password"
                placeholder="Enter app password"
                value={imap.password}
                visible={showImapPassword}
                onChange={(value) =>
                  updateImap("password", value)
                }
                onToggle={() =>
                  setShowImapPassword(
                    (prev) => !prev
                  )
                }
              />

              <FormField
                label="Mailbox folder"
                placeholder="INBOX"
                value={imap.mailbox}
                onChange={(value) =>
                  updateImap("mailbox", value)
                }
              />
            </div>
          </div>

          <div className="grid gap-3 border-t border-slate-100 pt-5 sm:grid-cols-2">
            <ToggleRow
              title="Use SSL"
              description="Recommended for IMAP port 993."
              enabled={imap.ssl}
              onChange={(value) => {
                updateImap("ssl", value);

                if (value) {
                  updateImap("tls", false);
                  updateImap("port", "993");
                }
              }}
            />

            <ToggleRow
              title="Use TLS"
              description="Use when the mail server requires STARTTLS."
              enabled={imap.tls}
              onChange={(value) => {
                updateImap("tls", value);

                if (value) {
                  updateImap("ssl", false);
                  updateImap("port", "143");
                }
              }}
            />

            <ToggleRow
              title="Mark imported emails as read"
              description="Mark successfully imported emails as read."
              enabled={imap.markAsRead}
              onChange={(value) =>
                updateImap(
                  "markAsRead",
                  value
                )
              }
            />

            <ToggleRow
              title="Delete after import"
              description="Delete emails after successful import."
              enabled={imap.deleteAfterImport}
              onChange={(value) =>
                updateImap(
                  "deleteAfterImport",
                  value
                )
              }
            />
          </div>

          <div className="flex justify-end border-t border-slate-100 pt-5">
            <button
              type="button"
              onClick={handleTestImap}
              disabled={
                testingImap || !imap.enabled
              }
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw
                size={15}
                className={
                  testingImap
                    ? "animate-spin"
                    : ""
                }
              />

              {testingImap
                ? "Testing..."
                : "Test IMAP"}
            </button>
          </div>
        </div>
      </SettingsCard>


      {/* Save */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Save size={16} />

          {saving
            ? "Saving..."
            : "Save email configuration"}
        </button>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Reusable components                                                         */
/* -------------------------------------------------------------------------- */

function SettingsCard({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-5 py-4">
        <h2 className="text-sm font-semibold text-slate-900">
          {title}
        </h2>

        <p className="mt-1 text-xs text-slate-500">
          {description}
        </p>
      </div>

      <div className="p-5">{children}</div>
    </section>
  );
}

function InfoField({
  icon: Icon,
  label,
  value,
  capitalize = false,
}: {
  icon: typeof User;
  label: string;
  value: string;
  capitalize?: boolean;
}) {
  return (
    <div className="rounded-lg border border-slate-200 p-4">
      <div className="flex items-center gap-2 text-xs text-slate-400">
        <Icon size={14} />
        <span>{label}</span>
      </div>

      <p
        className={`mt-2 text-sm font-medium text-slate-800 ${
          capitalize ? "capitalize" : ""
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function PasswordInput({
  label,
  value,
  visible,
  onChange,
  onToggle,
}: {
  label: string;
  value: string;
  visible: boolean;
  onChange: (value: string) => void;
  onToggle: () => void;
}) {
  return (
    <div>
      <label className="mb-2 block text-xs font-medium text-slate-700">
        {label}
      </label>

      <div className="relative">
        <KeyRound
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
        />

        <input
          type={visible ? "text" : "password"}
          value={value}
          onChange={(e) =>
            onChange(e.target.value)
          }
          className="h-10 w-full rounded-lg border border-slate-300 bg-white pl-9 pr-10 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-slate-500 focus:ring-2 focus:ring-slate-100"
        />

        <button
          type="button"
          onClick={onToggle}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-slate-400 transition hover:bg-slate-50 hover:text-slate-700"
          aria-label={
            visible
              ? "Hide password"
              : "Show password"
          }
        >
          {visible ? (
            <EyeOff size={16} />
          ) : (
            <Eye size={16} />
          )}
        </button>
      </div>
    </div>
  );
}

function FormField({
  label,
  placeholder,
  value,
  onChange,
  icon: Icon,
}: {
  label: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  icon?: typeof Mail;
}) {
  return (
    <div>
      <label className="mb-2 block text-xs font-medium text-slate-700">
        {label}
      </label>

      <div className="relative">
        {Icon && (
          <Icon
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
        )}

        <input
          type="text"
          value={value}
          placeholder={placeholder}
          onChange={(e) =>
            onChange(e.target.value)
          }
          className={`h-10 w-full rounded-lg border border-slate-300 bg-white text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-slate-500 focus:ring-2 focus:ring-slate-100 ${
            Icon ? "pl-9 pr-3" : "px-3"
          }`}
        />
      </div>
    </div>
  );
}

function PasswordField({
  label,
  placeholder,
  value,
  visible,
  onChange,
  onToggle,
}: {
  label: string;
  placeholder?: string;
  value: string;
  visible: boolean;
  onChange: (value: string) => void;
  onToggle: () => void;
}) {
  return (
    <div>
      <label className="mb-2 block text-xs font-medium text-slate-700">
        {label}
      </label>

      <div className="relative">
        <KeyRound
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
        />

        <input
          type={visible ? "text" : "password"}
          value={value}
          placeholder={placeholder}
          onChange={(e) =>
            onChange(e.target.value)
          }
          className="h-10 w-full rounded-lg border border-slate-300 bg-white pl-9 pr-10 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-slate-500 focus:ring-2 focus:ring-slate-100"
        />

        <button
          type="button"
          onClick={onToggle}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-slate-400 transition hover:bg-slate-50 hover:text-slate-700"
        >
          {visible ? (
            <EyeOff size={16} />
          ) : (
            <Eye size={16} />
          )}
        </button>
      </div>
    </div>
  );
}

function ToggleRow({
  title,
  description,
  enabled,
  onChange,
}: {
  title: string;
  description: string;
  enabled: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-5 rounded-lg border border-slate-200 p-4">
      <div>
        <p className="text-sm font-medium text-slate-800">
          {title}
        </p>

        <p className="mt-1 text-xs leading-5 text-slate-500">
          {description}
        </p>
      </div>

      <button
        type="button"
        onClick={() => onChange(!enabled)}
        aria-pressed={enabled}
        className={`relative h-6 w-11 shrink-0 rounded-full transition ${
          enabled
            ? "bg-slate-900"
            : "bg-slate-200"
        }`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition ${
            enabled
              ? "left-[22px]"
              : "left-0.5"
          }`}
        />
      </button>
    </div>
  );
}

function SettingToggle({
  title,
  description,
  enabled,
  onChange,
}: {
  title: string;
  description: string;
  enabled: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-5 py-4 first:pt-0 last:pb-0">
      <div>
        <p className="text-sm font-medium text-slate-800">
          {title}
        </p>

        <p className="mt-1 text-xs text-slate-500">
          {description}
        </p>
      </div>

      <button
        type="button"
        onClick={() => onChange(!enabled)}
        aria-pressed={enabled}
        className={`relative h-6 w-11 shrink-0 rounded-full transition ${
          enabled
            ? "bg-slate-900"
            : "bg-slate-200"
        }`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition ${
            enabled
              ? "left-[22px]"
              : "left-0.5"
          }`}
        />
      </button>
    </div>
  );
}

function InfoRow({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-3 border-b border-slate-100 py-4 last:border-b-0 last:pb-0">
      <CheckCircle2
        size={17}
        className="mt-0.5 shrink-0 text-slate-400"
      />

      <div>
        <p className="text-sm font-medium text-slate-800">
          {title}
        </p>

        <p className="mt-1 text-xs leading-5 text-slate-500">
          {description}
        </p>
      </div>
    </div>
  );
}
