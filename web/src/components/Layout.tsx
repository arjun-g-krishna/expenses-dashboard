import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  HandCoins,
  Receipt,
  FileSpreadsheet,
  LogOut,
  Moon,
  Sun,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

const navItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/contributions", label: "Contributions", icon: HandCoins, end: false },
  { to: "/expenses", label: "Expenses", icon: Receipt, end: false },
  { to: "/reports", label: "Reports", icon: FileSpreadsheet, end: false },
];

export function Layout() {
  const { claims, isAdmin, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const roleLabel = isAdmin ? "Administrator" : "Viewer";

  return (
    <div className="relative min-h-screen">
      <div className="grain" aria-hidden />
      <div className="relative z-10 mx-auto flex min-h-screen">
        <aside
          className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-border bg-surface-elevated/95 p-5 backdrop-blur-md transition-transform lg:static lg:translate-x-0 ${
            mobileOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="mb-8">
            <p className="font-display text-2xl leading-tight">Contribution</p>
            <p className="font-display text-2xl text-accent">Tracker</p>
          </div>

          <nav className="flex flex-1 flex-col gap-1">
            {navItems.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                    isActive
                      ? "bg-accent text-white shadow-sm"
                      : "text-muted hover:bg-border/40 hover:text-foreground"
                  }`
                }
              >
                <Icon size={18} />
                {label}
              </NavLink>
            ))}
          </nav>

          <div className="mt-auto space-y-3 border-t border-border pt-4">
            <div className="rounded-xl bg-border/30 px-3 py-2">
              <p className="truncate text-sm font-medium">{claims?.username}</p>
              <p className="text-xs text-muted">{roleLabel}</p>
            </div>
            <button
              type="button"
              onClick={toggleTheme}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm text-muted transition hover:bg-border/40 hover:text-foreground"
            >
              {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
              {theme === "dark" ? "Light mode" : "Dark mode"}
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm text-muted transition hover:bg-border/40 hover:text-foreground"
            >
              <LogOut size={18} />
              Sign out
            </button>
          </div>
        </aside>

        {mobileOpen && (
          <button
            type="button"
            className="fixed inset-0 z-30 bg-foreground/30 lg:hidden"
            onClick={() => setMobileOpen(false)}
            aria-label="Close menu"
          />
        )}

        <div className="flex min-w-0 flex-1 flex-col lg:ml-0">
          <header className="sticky top-0 z-20 flex items-center justify-between border-b border-border bg-surface/80 px-4 py-3 backdrop-blur-md lg:px-8">
            <button
              type="button"
              className="rounded-lg p-2 text-muted lg:hidden"
              onClick={() => setMobileOpen((o) => !o)}
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
            {!isAdmin && (
              <span className="ml-auto rounded-full bg-accent-muted px-3 py-1 text-xs font-medium text-accent lg:ml-0">
                Read-only access
              </span>
            )}
          </header>

          <main className="flex-1 px-4 py-6 lg:px-8 lg:py-8">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
