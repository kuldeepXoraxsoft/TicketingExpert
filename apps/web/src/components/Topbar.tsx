import { useState } from "react";
import { Menu, Search } from "lucide-react";
import NotificationBell from "./NotificationBell";
import UserMenu from "./UserMenu";

type TopbarProps = {
  onMenuClick?: () => void;
};

export default function Topbar({ onMenuClick }: TopbarProps) {
  const [changePasswordOpen, setChangePasswordOpen] = useState(false); 

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-3 sm:px-4 md:px-6">
      {/* Left */}
      <div className="flex min-w-0 items-center gap-2">
        {/* Mobile Menu */}
        <button
          type="button"
          onClick={onMenuClick}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 md:hidden"
          aria-label="Open navigation"
        >
          <Menu size={20} />
        </button>

        {/* Search */}
        <div className="flex min-w-0 items-center gap-2 text-slate-400">
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
      </div>

      {/* Right */}
      <div className="ml-2 flex shrink-0 items-center gap-1.5 sm:gap-3">
        <NotificationBell />
        <UserMenu />
      </div>
    </header>
  );
}