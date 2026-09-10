import { LogOut } from "lucide-react";

export default function Sidebar({ navItems, activePage, onSelect, official, onLogout, backendOnline }) {
  return (
    <aside className="w-64 shrink-0 bg-navy-950 text-navy-100 flex flex-col h-screen sticky top-0">
      <div className="px-5 py-6 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gold-500 text-navy-950 font-heading font-bold text-sm flex items-center justify-center shrink-0">
            SI
          </div>
          <div className="min-w-0">
            <p className="text-sm font-heading font-bold text-white leading-tight truncate">
              Skill Intelligence
            </p>
            <p className="text-xs text-navy-100/70 truncate">MoSPI · iGOT Karmayogi</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.key;
          return (
            <button
              key={item.key}
              onClick={() => onSelect(item.key)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors ${
                isActive
                  ? "bg-white/10 text-white font-medium border-l-2 border-gold-500"
                  : "text-navy-100/80 hover:bg-white/5 hover:text-white border-l-2 border-transparent"
              }`}
            >
              <Icon size={17} strokeWidth={2} />
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="px-3 py-4 border-t border-white/10 space-y-3">
        <div className="flex items-center gap-2 px-3 text-xs text-navy-100/70">
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              backendOnline ? "bg-teal-400" : "bg-danger-600"
            }`}
          />
          {backendOnline ? "Backend connected" : "Backend unreachable"}
        </div>

        <div className="flex items-center justify-between px-3 py-2 rounded-md bg-white/5">
          <div className="min-w-0">
            <p className="text-xs font-medium text-white truncate">{official.name}</p>
            <p className="text-[11px] text-navy-100/60 capitalize">{official.role}</p>
          </div>
          <button
            onClick={onLogout}
            className="text-navy-100/60 hover:text-white transition-colors shrink-0 ml-2"
            title="Sign out"
          >
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </aside>
  );
}
