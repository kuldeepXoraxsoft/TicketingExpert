import { useState } from "react";
import {
  Bell,
  CheckCircle2,
  MessageSquare,
  UserPlus,
  AlertCircle,
} from "lucide-react";

type Notification = {
  id: number;
  title: string;
  message: string;
  time: string;
  read: boolean;
  icon: typeof Bell;
};

const SAMPLE_NOTIFICATIONS: Notification[] = [
  {
    id: 1,
    title: "New ticket assigned",
    message: "Ticket #TK-1042 has been assigned to you.",
    time: "5 min ago",
    read: false,
    icon: UserPlus,
  },
  {
    id: 2,
    title: "New customer reply",
    message: "A customer replied to ticket #TK-1038.",
    time: "18 min ago",
    read: false,
    icon: MessageSquare,
  },
  {
    id: 3,
    title: "Ticket resolved",
    message: "Ticket #TK-1031 was marked as resolved.",
    time: "1 hour ago",
    read: true,
    icon: CheckCircle2,
  },
  {
    id: 4,
    title: "SLA reminder",
    message: "Ticket #TK-1027 is approaching its SLA deadline.",
    time: "2 hours ago",
    read: true,
    icon: AlertCircle,
  },
];

export default function NotificationBell() {
  const [open, setOpen] = useState(false);

  const unreadCount = SAMPLE_NOTIFICATIONS.filter(
    (notification) => !notification.read
  ).length;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="relative rounded-full p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-900"
        aria-label="Notifications"
      >
        <Bell size={19} />

        {unreadCount > 0 && (
          <span className="absolute right-1 top-1 flex h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
        )}
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setOpen(false)}
          />

          <div className="absolute right-[-40px] z-20 mt-2 w-[calc(100vw-1rem)] max-w-80 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg sm:right-0 sm:w-80">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
              <div>
                <h3 className="text-sm font-semibold text-slate-900">
                  Notifications
                </h3>

                {unreadCount > 0 && (
                  <p className="mt-0.5 text-xs text-slate-500">
                    {unreadCount} unread notification
                    {unreadCount > 1 ? "s" : ""}
                  </p>
                )}
              </div>

              {unreadCount > 0 && (
                <button
                  type="button"
                  className="text-xs font-medium text-slate-600 hover:text-slate-900"
                >
                  Mark all as read
                </button>
              )}
            </div>

            {/* Notifications */}
            <div className="max-h-[360px] overflow-y-auto">
              {SAMPLE_NOTIFICATIONS.map((notification) => {
                const Icon = notification.icon;

                return (
                  <button
                    key={notification.id}
                    type="button"
                    className={`flex w-full gap-3 border-b border-slate-100 px-4 py-3 text-left transition hover:bg-slate-50 ${
                      !notification.read ? "bg-slate-50/70" : "bg-white"
                    }`}
                  >
                    {/* Icon */}
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500">
                      <Icon size={14} />
                    </div>

                    {/* Content */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start gap-2">
                        <p
                          className={`flex-1 text-sm ${
                            notification.read
                              ? "font-medium text-slate-700"
                              : "font-semibold text-slate-900"
                          }`}
                        >
                          {notification.title}
                        </p>

                        {!notification.read && (
                          <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-slate-900" />
                        )}
                      </div>

                      <p className="mt-0.5 text-xs leading-5 text-slate-500">
                        {notification.message}
                      </p>

                      <p className="mt-1 text-[11px] text-slate-400">
                        {notification.time}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Footer */}
            <div className="border-t border-slate-200 bg-slate-50/50 px-4 py-2.5">
              <button
                type="button"
                className="w-full text-center text-xs font-medium text-slate-600 transition hover:text-slate-900"
              >
                View all notifications
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
