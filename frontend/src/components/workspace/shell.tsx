import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState, type ReactNode } from "react";
import {
  LayoutDashboard,
  History,
  FileText,
  PanelsTopLeft,
  FolderOpen,
  Settings,
  ArrowUpRight,
  Bell,
  ChevronDown,
  Menu,
  X,
  LogOut,
  Sparkles,
  CircleHelp,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Toaster, toast } from "sonner";
import { ThemeToggle } from "./theme";
import { clearSession, getCurrentUser, getStoredUser, getToken, health } from "@/lib/api";
const navigation = [
  { name: "Overview", to: "/", icon: LayoutDashboard },
  { name: "Validation history", to: "/history", icon: History },
  { name: "Saved reports", to: "/reports", icon: FileText },
  // { name: "Website builder", to: "/builder", icon: PanelsTopLeft },
  // { name: "My projects", to: "/projects", icon: FolderOpen },
] as const;
export function Brand() {
  return (
    <Link to="/" className="brand">
      <span className="brand-symbol">
        <Sparkles size={21} strokeWidth={2.4} />
      </span>
      Validora<span className="brand-dot">.</span>
    </Link>
  );
}
export function Workspace({
  children,
  title = "Overview",
}: {
  children: ReactNode;
  title?: string;
}) {
  const pathname = useLocation().pathname;
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [account, setAccount] = useState(false);
  const [user, setUser] = useState(getStoredUser);
  const [apiOnline, setApiOnline] = useState<boolean | null>(null);
  useEffect(() => {
    const update = () => setUser(getStoredUser());
    window.addEventListener("validora-auth-change", update);
    health().then(() => setApiOnline(true)).catch(() => setApiOnline(false));
    if (getToken()) getCurrentUser().catch(() => { clearSession(); setUser(null); });
    return () => window.removeEventListener("validora-auth-change", update);
  }, []);
  return (
    <div className="workspace">
      <Toaster position="bottom-right" richColors />
      <aside className={`sidebar ${open ? "sidebar-open" : ""}`}>
        <div className="sidebar-brand">
          <Brand />
          <Button
            variant="ghost"
            size="icon"
            className="mobile-close"
            aria-label="Close navigation"
            onClick={() => setOpen(false)}
          >
            <X />
          </Button>
        </div>
        <div className="workspace-switch">
          <span className="workspace-monogram">{user?.name?.[0] ?? "P"}</span>
          <div>
            <strong>{user?.name ? `${user.name.split(" ")[0]}’s workspace` : "Personal workspace"}</strong>
            <span>Free plan</span>
          </div>
          <ChevronDown size={15} />
        </div>
        <div className="nav-label">WORKSPACE</div>
        <nav>
          {navigation.map((n) => (
            <Button
              key={n.to}
              asChild
              variant="ghost"
              className={`nav-item ${pathname === n.to ? "nav-active" : ""}`}
            >
              <Link to={n.to} onClick={() => setOpen(false)}>
                <n.icon size={19} />
                <span>{n.name}</span>
                {n.to === "/builder" && <span className="new-badge">NEW</span>}
              </Link>
            </Button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="upgrade-block">
            <span className="upgrade-icon">
              <Sparkles size={19} />
            </span>
            <h3>Your next big idea starts here.</h3>
            <p>More research. More possibilities.</p>
            <Button
              variant="outline"
              onClick={() =>
                toast.info(
                  "Plan upgrades are not connected in this UI preview.",
                )
              }
            >
              Explore Pro <ArrowUpRight size={15} />
            </Button>
          </div>
          <Button
            asChild
            variant="ghost"
            className={`nav-item ${pathname === "/account" ? "nav-active" : ""}`}
          >
            <Link to="/account">
              <Settings size={19} />
              Settings
            </Link>
          </Button>
          <Button
            variant="ghost"
            className="nav-item"
            onClick={() =>
              toast.info(
                "For this preview, explore a sample report or create a website concept.",
              )
            }
          >
            <CircleHelp size={19} />
            Help & resources
            <ArrowUpRight className="ml-auto" size={14} />
          </Button>
          <div className="sidebar-footer">
            <span className={`status-dot ${apiOnline === false ? "status-offline" : ""}`} />
            {apiOnline === false ? "API offline" : apiOnline ? "API connected" : "Connecting…"} <span>v1.0</span>
          </div>
        </div>
      </aside>
      {open && (
        <div className="mobile-overlay" onClick={() => setOpen(false)} />
      )}
      <div className="workspace-body">
        <header className="topbar">
          <div className="topbar-title">
            <Button
              variant="ghost"
              size="icon"
              className="mobile-menu"
              aria-label="Open navigation"
              onClick={() => setOpen(true)}
            >
              <Menu />
            </Button>
            <span>Workspace</span>
            <span className="breadcrumb-slash">/</span>
            <strong>{title}</strong>
          </div>
          <div className="topbar-actions">
            <span className="preview-label">{user ? "Connected workspace" : "Sign in to validate"}</span>
            <ThemeToggle />
            <Button
              variant="ghost"
              size="icon"
              aria-label="Notifications"
              onClick={() =>
                toast.info("You’re all caught up. No new notifications.")
              }
            >
              <Bell size={19} />
            </Button>
            <span className="header-divider" />
            <div className="account-menu">
              <Button
                variant="ghost"
                onClick={() => setAccount(!account)}
                className="avatar-button"
              >
                <span className="avatar">{user?.name?.split(" ").map((part) => part[0]).join("").slice(0, 2) ?? "JD"}</span>
                <span className="account-name">{user?.name ?? "Guest"}</span>
                <ChevronDown size={14} />
              </Button>
              {account && (
                <div className="account-dropdown">
                  <Button asChild variant="ghost">
                    <Link to="/account">
                      <Settings />
                      Account settings
                    </Link>
                  </Button>
                  {user ? <Button variant="ghost" onClick={() => { clearSession(); setAccount(false); toast.success("Signed out."); navigate("/login"); }}><LogOut />Sign out</Button> : <Button asChild variant="ghost"><Link to="/login"><LogOut />Sign in</Link></Button>}
                </div>
              )}
            </div>
          </div>
        </header>
        <main className="main-content">{children}</main>
        <footer className="main-footer">
          <span>Built for ideas worth pursuing.</span>
          <span>
            Validora <span className="footer-dot">·</span> A little clarity. A
            big difference.
          </span>
        </footer>
      </div>
    </div>
  );
}
export function PageHeading({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="page-heading">
      <div>
        {eyebrow && <div className="eyebrow">{eyebrow}</div>}
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {action}
    </div>
  );
}
export function EmptyState({
  title,
  text,
  action,
}: {
  title: string;
  text: string;
  action?: ReactNode;
}) {
  return (
    <div className="empty-state">
      <FolderOpen size={32} />
      <h3>{title}</h3>
      <p>{text}</p>
      {action}
    </div>
  );
}
export function NewIdeaLink() {
  return (
    <Button asChild>
      <Link to="/">
        <Sparkles size={16} />
        New validation
        <ArrowRight size={15} />
      </Link>
    </Button>
  );
}
