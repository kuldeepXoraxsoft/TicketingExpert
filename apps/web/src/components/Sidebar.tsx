import { NavLink } from "react-router-dom";
import {
  Inbox,
  LayoutDashboard,
  Settings,
  Ticket,
  Users,
  Building2,
  Network,
  Mail,
  Tags,
  MessageSquareText,
  Bug,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const NAV_ITEMS = [
  {
    to: "/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    roles:["ADMIN", "USER"],
  },
  {
    to: "/intickets",
    label: "Inbound Tickets",
    icon: Ticket,
    roles:["ADMIN", "USER"],
  },
  {
    to: "/outtickets",
    label: "Outbound Tickets",
    icon: Ticket,
    roles:["ADMIN", "USER"],
  },
  {
    to: "/mytickets",
    label: "My Tickets",
    icon: Inbox,
    roles:["ADMIN", "USER"],
  },
  {
    to: "/users",
    label: "Users",
    icon: Users,
    roles: ["ADMIN"],
  },
  {
    to: "/client-groups",
    label: "Client Groups",
    icon: Building2,
    roles: ["ADMIN"],

  },
  {
    to: "/departments",
    label: "Departments",
    icon: Network,
    roles: ["ADMIN"],
  },
  {
    to: "/email-templates",
    label: "Email Templates",
    icon: Mail,
    roles:["ADMIN", "USER"],
  },
  {
    to: "/tags",
    label: "Tags",
    icon: Tags,
    roles:["ADMIN", "USER"],
  },
  {
    to: "/canned-responses",
    label: "Canned Responses",
    icon: MessageSquareText,
    roles:["ADMIN", "USER"],
  },
  {
    to: "/error-logs",
    label: "Error Logs",
    icon: Bug,
    roles: ["ADMIN", "SUPER_ADMIN"],
  },
  {
    to: "/settings",
    label: "Settings",
    icon: Settings,
  },
  {
    to: "/management",
    label:"Management",
    icon: Users,
    roles:["SUPER_ADMIN"]
  }
];

export default function Sidebar({ onNavigate }) {
  const { user } = useAuth();

  const visibleItems = NAV_ITEMS.filter(
    (item) => !item.roles || item.roles.includes(user?.role)
  );

  return (
    <aside className="flex h-screen w-60 shrink-0 flex-col border-r border-slate-200 bg-white">
      {/* Logo */}
      <div className="flex h-14 shrink-0 items-center border-b border-slate-200 px-5">
        <div className="flex items-center gap-2.5">
          <div className="flex flex-col">
            <div className="flex items-center gap-1 leading-none">
              <span className="text-[13px] font-extrabold tracking-[0.12em] text-slate-900">
                TICKETING
              </span>

              <span className="mx-0.5 text-[15px] font-bold text-slate-300">
                ×
              </span>

              <span className="text-[13px] font-bold tracking-[0.08em] text-slate-500">
                EXPERT
              </span>
            </div>

            <span className="mt-1 text-[8px] font-medium uppercase tracking-[0.22em] text-slate-400">
              Support • Service • Resolve
            </span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="min-h-0 flex-1 overflow-y-auto px-3 py-5">
        <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
          Workspace
        </p>

        <div className="space-y-1">
          {visibleItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/tickets"}
              onClick={onNavigate}
              className={({ isActive }) =>
                `group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                  isActive
                    ? "bg-slate-100 text-slate-900"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    className={`absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-r-full transition-all ${
                      isActive
                        ? "bg-slate-700 opacity-100"
                        : "bg-transparent opacity-0"
                    }`}
                  />

                  <Icon
                    size={18}
                    strokeWidth={isActive ? 2.2 : 1.8}
                    className={
                      isActive
                        ? "text-slate-800"
                        : "text-slate-400 group-hover:text-slate-600"
                    }
                  />

                  <span>{label}</span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>

      {/* Footer */}
      {/* <div className="shrink-0 border-t border-slate-200 px-4 py-3">
        <p className="text-xs font-medium text-slate-500">
          Helpdesk Platform
        </p>

        <p className="mt-0.5 text-[11px] text-slate-400">
          Version 0.1
        </p>
      </div> */}
    </aside>
  );
}