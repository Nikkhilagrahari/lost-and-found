import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { Bell, MessageSquare, User, LogOut, Search, PlusCircle, ShieldCheck, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { api } from "../../lib/api";
import { Button } from "../ui/button";
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator,
} from "../ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Badge } from "../ui/badge";

export default function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [unread, setUnread] = useState(0);
  const [notifs, setNotifs] = useState([]);
  const [open, setOpen] = useState(false);

  const loadNotifs = async () => {
    try {
      const r = await api.get("notifications");
      setNotifs(r.data);
      setUnread(r.data.filter((n) => !n.read).length);
    } catch (e) { /* ignore */ }
  };

  useEffect(() => {
    if (!user) return;
    loadNotifs();
    const id = setInterval(loadNotifs, 30000);
    return () => clearInterval(id);
  }, [user]);

  const handleLogout = async () => { await logout(); navigate("/"); };

  const initials = user?.name ? user.name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase() : "U";
  const navClass = ({ isActive }) =>
    `text-sm font-medium px-3 py-2 rounded-md transition-colors ${isActive ? "bg-[#1E3A8A] text-white" : "text-slate-700 hover:bg-slate-100"}`;

  return (
    <header className="sticky top-0 z-40 glass-nav border-b border-border" data-testid="app-header">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        <Link to={user ? "/browse" : "/"} className="flex items-center gap-2.5 min-w-0" data-testid="brand-link">
          <div className="w-9 h-9 rounded-md bg-[#1E3A8A] text-white grid place-items-center font-display font-bold flex-shrink-0">IET</div>
          <div className="flex flex-col leading-tight min-w-0">
            <span className="font-display font-bold text-[14px] sm:text-[15px] text-slate-900 truncate">Lost &amp; Found</span>
            <span className="text-[9px] sm:text-[10px] uppercase tracking-[0.16em] text-[#1E3A8A] font-semibold truncate">IET Gorakhpur</span>
          </div>
        </Link>

        {user && (
          <nav className="hidden md:flex items-center gap-1">
            <NavLink to="/browse" className={navClass} data-testid="nav-browse">Browse</NavLink>
            <NavLink to="/report/lost" className={navClass} data-testid="nav-report-lost">Report Lost</NavLink>
            <NavLink to="/report/found" className={navClass} data-testid="nav-report-found">Report Found</NavLink>
            <NavLink to="/messages" className={navClass} data-testid="nav-messages">Messages</NavLink>
            {user.role === "admin" && <NavLink to="/admin" className={navClass} data-testid="nav-admin">Admin</NavLink>}
          </nav>
        )}

        <div className="flex items-center gap-2">
          {user ? (
            <>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="relative p-2 rounded-md hover:bg-slate-100" data-testid="notif-trigger" aria-label="Notifications">
                    <Bell className="w-5 h-5 text-slate-700" />
                    {unread > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 bg-[#EF4444] text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] grid place-items-center px-1" data-testid="notif-badge">{unread}</span>
                    )}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80">
                  <DropdownMenuLabel className="flex items-center justify-between">
                    <span>Notifications</span>
                    {unread > 0 && (
                      <button
                        className="text-xs text-[#1E3A8A] hover:underline"
                        onClick={async () => { await api.post("/notifications/read-all"); loadNotifs(); }}
                        data-testid="mark-all-read"
                      >Mark all read</button>
                    )}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {notifs.length === 0 && <div className="text-sm text-muted-foreground px-3 py-6 text-center">No notifications yet</div>}
                  {notifs.slice(0, 8).map((n) => (
                    <DropdownMenuItem
                      key={n.notif_id}
                      onClick={async () => {
                        await api.post(`/notifications/${n.notif_id}/read`);
                        loadNotifs();
                        if (n.conv_id) navigate("/messages");
                        else if (n.item_id) navigate(`/items/${n.item_id}`);
                      }}
                      className="flex flex-col items-start gap-0.5 cursor-pointer"
                      data-testid={`notif-${n.notif_id}`}
                    >
                      <div className="flex items-center gap-2 w-full">
                        {!n.read && <span className="w-1.5 h-1.5 rounded-full bg-[#1E3A8A]" />}
                        <span className="font-semibold text-sm">{n.title}</span>
                      </div>
                      <span className="text-xs text-muted-foreground line-clamp-2">{n.message}</span>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 p-1 rounded-md hover:bg-slate-100" data-testid="user-menu-trigger">
                    <Avatar className="w-8 h-8">
                      {user.picture && <AvatarImage src={user.picture} alt={user.name} />}
                      <AvatarFallback className="bg-[#1E3A8A] text-white text-xs">{initials}</AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col">
                      <span className="font-semibold">{user.name}</span>
                      <span className="text-xs text-muted-foreground truncate">{user.email}</span>
                      {user.role === "admin" && <Badge className="w-fit mt-1 bg-[#F59E0B] text-slate-900 hover:bg-[#F59E0B]"><ShieldCheck className="w-3 h-3 mr-1" />Admin</Badge>}
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate("/profile")} data-testid="menu-profile"><User className="w-4 h-4 mr-2" />Profile</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/messages")} data-testid="menu-messages"><MessageSquare className="w-4 h-4 mr-2" />Messages</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-red-600" data-testid="menu-logout"><LogOut className="w-4 h-4 mr-2" />Logout</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <button className="md:hidden p-2 rounded-md hover:bg-slate-100" onClick={() => setOpen(!open)} data-testid="mobile-menu-toggle" aria-label="Menu">
                {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </>
          ) : (
            <>
              <Button variant="ghost" onClick={() => navigate("/login")} data-testid="header-login-btn">Sign in</Button>
              <Button className="bg-[#1E3A8A] hover:bg-[#1E40AF]" onClick={() => navigate("/login")} data-testid="header-getstarted-btn">Get started</Button>
            </>
          )}
        </div>
      </div>

      {user && open && (
        <div className="md:hidden border-t border-border bg-white px-4 py-3 flex flex-col gap-1" data-testid="mobile-nav">
          <NavLink to="/browse" onClick={() => setOpen(false)} className={navClass}><Search className="inline w-4 h-4 mr-2" />Browse</NavLink>
          <NavLink to="/report/lost" onClick={() => setOpen(false)} className={navClass}><PlusCircle className="inline w-4 h-4 mr-2" />Report Lost</NavLink>
          <NavLink to="/report/found" onClick={() => setOpen(false)} className={navClass}><PlusCircle className="inline w-4 h-4 mr-2" />Report Found</NavLink>
          <NavLink to="/messages" onClick={() => setOpen(false)} className={navClass}><MessageSquare className="inline w-4 h-4 mr-2" />Messages</NavLink>
          <NavLink to="/profile" onClick={() => setOpen(false)} className={navClass}><User className="inline w-4 h-4 mr-2" />Profile</NavLink>
          {user.role === "admin" && <NavLink to="/admin" onClick={() => setOpen(false)} className={navClass}><ShieldCheck className="inline w-4 h-4 mr-2" />Admin</NavLink>}
        </div>
      )}
    </header>
  );
}
