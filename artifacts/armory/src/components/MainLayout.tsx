import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "./AuthContext";
import { ShieldAlert, Crosshair, Package, ShoppingCart, User, LogOut, Settings, History, FileText, Activity, ShieldCheck, Box, ChevronRight, Menu, X } from "lucide-react";
import { useGetCart, getGetCartQueryKey } from "@workspace/api-client-react";
import { Badge } from "./ui/badge";

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
  isAdmin?: boolean;
}

export function MainLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { data: cart } = useGetCart({
    query: {
      queryKey: getGetCartQueryKey(),
      enabled: isAuthenticated,
    }
  });
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems: NavItem[] = [
    { href: "/products", label: "Arsenal", icon: Crosshair },
  ];

  if (isAuthenticated) {
    navItems.push({ href: "/cart", label: "Cart", icon: ShoppingCart, badge: cart?.itemCount });
    navItems.push({ href: "/orders", label: "Orders", icon: History });
    navItems.push({ href: "/kyc", label: "Clearance", icon: ShieldCheck });
    navItems.push({ href: "/licenses", label: "Licenses", icon: FileText });
  }

  const adminItems: NavItem[] = [
    { href: "/admin", label: "Command Center", icon: Activity },
    { href: "/admin/orders", label: "Logistics", icon: Package },
    { href: "/admin/products", label: "Inventory", icon: Box },
    { href: "/admin/kyc", label: "Clearance Queue", icon: ShieldAlert },
    { href: "/admin/users", label: "Operatives", icon: User },
  ];

  const NavLink = ({ item }: { item: NavItem }) => {
    const active = location === item.href || (item.href !== "/" && item.href !== "/admin" && location.startsWith(item.href));
    const Icon = item.icon;
    return (
      <Link
        href={item.href as `/${string}`}
        onClick={() => setSidebarOpen(false)}
        className={`w-full flex items-center px-3 py-2.5 font-mono uppercase text-sm tracking-wider border transition-colors relative
          ${active
            ? 'bg-primary/15 text-primary border-primary/30 shadow-[0_0_10px_rgba(0,212,255,0.1)]'
            : 'text-muted-foreground hover:text-foreground hover:bg-muted/20 border-transparent'
          }`}
      >
        <Icon className="mr-3 h-4 w-4 flex-shrink-0" />
        <span className="flex-1">{item.label}</span>
        {item.badge !== undefined && item.badge > 0 && (
          <span className="bg-primary text-primary-foreground text-[10px] px-1.5 py-0.5 rounded-sm font-bold">
            {item.badge}
          </span>
        )}
        {active && <ChevronRight className="ml-2 h-4 w-4 opacity-50 flex-shrink-0" />}
      </Link>
    );
  };

  const AdminNavLink = ({ item }: { item: NavItem }) => {
    const active = location === item.href;
    const Icon = item.icon;
    return (
      <Link
        href={item.href as `/${string}`}
        onClick={() => setSidebarOpen(false)}
        className={`w-full flex items-center px-3 py-2.5 font-mono uppercase text-sm tracking-wider border transition-colors
          ${active
            ? 'bg-destructive/15 text-destructive border-destructive/30 shadow-[0_0_10px_rgba(255,0,0,0.1)]'
            : 'text-muted-foreground hover:text-destructive hover:bg-destructive/10 border-transparent'
          }`}
      >
        <Icon className="mr-3 h-4 w-4 flex-shrink-0" />
        <span className="flex-1">{item.label}</span>
        {active && <ChevronRight className="ml-2 h-4 w-4 opacity-50 flex-shrink-0" />}
      </Link>
    );
  };

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className="p-6 border-b border-primary/20 flex items-center justify-between">
        <Link href="/" onClick={() => setSidebarOpen(false)} className="flex items-center gap-3 text-primary hover:text-primary/80 transition-colors">
          <ShieldAlert className="w-8 h-8 flex-shrink-0" />
          <span className="font-mono font-bold text-xl tracking-widest uppercase">ArmorX</span>
        </Link>
        <button
          onClick={() => setSidebarOpen(false)}
          className="lg:hidden text-muted-foreground hover:text-foreground p-1"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Nav */}
      <div className="flex-1 py-6 overflow-y-auto custom-scrollbar">
        <nav className="space-y-1 px-3">
          <div className="px-3 mb-2 text-xs font-mono text-muted-foreground uppercase tracking-widest">Operations</div>
          {navItems.map((item) => (
            <NavLink key={item.href} item={item} />
          ))}

          {isAdmin && (
            <>
              <div className="px-3 mt-8 mb-2 text-xs font-mono text-destructive uppercase tracking-widest">Admin Override</div>
              {adminItems.map((item) => (
                <AdminNavLink key={item.href} item={item} />
              ))}
            </>
          )}
        </nav>
      </div>

      {/* Bottom — user identity + actions */}
      <div className="border-t border-primary/20">
        {isAuthenticated && user && (
          <div className="px-4 py-3 border-b border-primary/10 bg-primary/5">
            <div className="font-mono text-xs text-primary uppercase tracking-widest truncate">{user.firstName} {user.lastName}</div>
            <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider truncate mt-0.5">{user.email}</div>
            <Badge variant="outline" className="mt-1.5 font-mono text-[9px] uppercase border-primary/30 text-primary bg-primary/10 px-1.5 py-0">
              {user.role.replace('_', ' ')}
            </Badge>
          </div>
        )}
        <div className="p-3 space-y-2">
          {isAuthenticated ? (
            <>
              <Link href="/profile" onClick={() => setSidebarOpen(false)}>
                <button className="w-full flex items-center px-3 py-2 font-mono uppercase text-sm tracking-wider text-muted-foreground hover:text-foreground hover:bg-muted/20 border border-transparent transition-colors">
                  <Settings className="mr-3 h-4 w-4" />
                  Profile
                </button>
              </Link>
              <button
                onClick={() => { logout(); setSidebarOpen(false); }}
                className="w-full flex items-center px-3 py-2 font-mono uppercase text-sm tracking-wider text-muted-foreground hover:text-destructive hover:bg-destructive/10 border border-transparent transition-colors"
              >
                <LogOut className="mr-3 h-4 w-4" />
                Disconnect
              </button>
            </>
          ) : (
            <Link href="/login" onClick={() => setSidebarOpen(false)}>
              <button className="w-full flex items-center justify-center px-3 py-2.5 font-mono uppercase text-sm tracking-wider bg-primary/20 text-primary border border-primary/50 hover:bg-primary hover:text-primary-foreground shadow-[0_0_15px_rgba(0,212,255,0.2)] transition-colors">
                Authenticate
              </button>
            </Link>
          )}
        </div>
      </div>
    </>
  );

  return (
    <div className="min-h-screen flex bg-background text-foreground selection:bg-primary/30">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar — fixed desktop, drawer mobile */}
      <aside
        className={`w-64 border-r border-primary/20 bg-card/95 backdrop-blur-md flex flex-col fixed inset-y-0 left-0 z-50 transition-transform duration-300
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        <SidebarContent />
      </aside>

      {/* Main Content */}
      <main className="flex-1 lg:ml-64 min-h-screen relative">
        {/* Mobile top bar */}
        <div className="lg:hidden sticky top-0 z-30 bg-background/95 backdrop-blur-md border-b border-primary/20 px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-primary hover:text-primary/80 p-1"
            aria-label="Open menu"
          >
            <Menu className="w-6 h-6" />
          </button>
          <Link href="/" className="flex items-center gap-2 text-primary">
            <ShieldAlert className="w-6 h-6" />
            <span className="font-mono font-bold text-lg tracking-widest uppercase">ArmorX</span>
          </Link>
          <Link href="/cart" className="relative text-primary p-1">
            <ShoppingCart className="w-6 h-6" />
            {isAuthenticated && cart && cart.itemCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                {cart.itemCount}
              </span>
            )}
          </Link>
        </div>

        <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
        <div className="relative z-10 p-4 md:p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
