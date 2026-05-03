import { Link, useLocation } from "wouter";
import { useAuth } from "./AuthContext";
import { ShieldAlert, Crosshair, Package, ShoppingCart, User, LogOut, Settings, History, FileText, Activity, ShieldCheck, Box, ChevronRight } from "lucide-react";
import { useGetCart } from "@workspace/api-client-react";
import { Button } from "./ui/button";

export function MainLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { data: cart } = useGetCart({ query: { enabled: isAuthenticated } });

  const navItems = [
    { href: "/products", label: "Arsenal", icon: Crosshair },
  ];

  if (isAuthenticated) {
    navItems.push({ href: "/orders", label: "Orders", icon: History });
    navItems.push({ href: "/kyc", label: "Clearance", icon: ShieldCheck });
    navItems.push({ href: "/licenses", label: "Licenses", icon: FileText });
  }

  const adminItems = [
    { href: "/admin", label: "Command Center", icon: Activity },
    { href: "/admin/orders", label: "Logistics", icon: Package },
    { href: "/admin/products", label: "Inventory", icon: Box },
    { href: "/admin/kyc", label: "Clearance Queue", icon: ShieldAlert },
    { href: "/admin/users", label: "Operatives", icon: User },
  ];

  return (
    <div className="min-h-screen flex bg-background text-foreground selection:bg-primary/30">
      {/* Sidebar */}
      <aside className="w-64 border-r border-primary/20 bg-card/50 backdrop-blur-md flex flex-col fixed inset-y-0 left-0 z-50">
        <div className="p-6 border-b border-primary/20">
          <Link href="/" className="flex items-center gap-3 text-primary hover:text-primary/80 transition-colors">
            <ShieldAlert className="w-8 h-8" />
            <span className="font-mono font-bold text-xl tracking-widest uppercase">ArmorX</span>
          </Link>
        </div>

        <div className="flex-1 py-6 overflow-y-auto custom-scrollbar">
          <nav className="space-y-1 px-3">
            <div className="px-3 mb-2 text-xs font-mono text-muted-foreground uppercase tracking-widest">Operations</div>
            {navItems.map((item) => {
              const active = location === item.href;
              return (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant="ghost"
                    className={`w-full justify-start font-mono uppercase text-sm tracking-wider ${active ? 'bg-primary/15 text-primary border border-primary/30 shadow-[0_0_10px_rgba(0,212,255,0.1)]' : 'text-muted-foreground hover:text-foreground hover:bg-muted/20 border border-transparent'}`}
                  >
                    <item.icon className="mr-3 h-4 w-4" />
                    {item.label}
                    {active && <ChevronRight className="ml-auto h-4 w-4 opacity-50" />}
                  </Button>
                </Link>
              );
            })}

            {isAdmin && (
              <>
                <div className="px-3 mt-8 mb-2 text-xs font-mono text-destructive uppercase tracking-widest">Admin Override</div>
                {adminItems.map((item) => {
                  const active = location === item.href;
                  return (
                    <Link key={item.href} href={item.href}>
                      <Button
                        variant="ghost"
                        className={`w-full justify-start font-mono uppercase text-sm tracking-wider ${active ? 'bg-destructive/15 text-destructive border border-destructive/30 shadow-[0_0_10px_rgba(255,0,0,0.1)]' : 'text-muted-foreground hover:text-destructive hover:bg-destructive/10 border border-transparent'}`}
                      >
                        <item.icon className="mr-3 h-4 w-4" />
                        {item.label}
                        {active && <ChevronRight className="ml-auto h-4 w-4 opacity-50" />}
                      </Button>
                    </Link>
                  );
                })}
              </>
            )}
          </nav>
        </div>

        <div className="p-4 border-t border-primary/20 space-y-2">
          {isAuthenticated ? (
            <>
              <Link href="/cart">
                <Button variant="outline" className="w-full justify-start border-primary/30 text-primary hover:bg-primary/10 font-mono uppercase text-sm tracking-wider relative group">
                  <ShoppingCart className="mr-3 h-4 w-4" />
                  Cart
                  {cart && cart.itemCount > 0 && (
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 bg-primary text-primary-foreground text-[10px] px-2 py-0.5 rounded-sm">
                      {cart.itemCount}
                    </span>
                  )}
                  <div className="absolute inset-0 bg-primary/5 blur-md opacity-0 group-hover:opacity-100 transition-opacity" />
                </Button>
              </Link>
              <Link href="/profile">
                <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-foreground font-mono uppercase text-sm tracking-wider">
                  <Settings className="mr-3 h-4 w-4" />
                  Profile
                </Button>
              </Link>
              <Button variant="ghost" onClick={logout} className="w-full justify-start text-muted-foreground hover:text-destructive font-mono uppercase text-sm tracking-wider">
                <LogOut className="mr-3 h-4 w-4" />
                Disconnect
              </Button>
            </>
          ) : (
            <Link href="/login">
              <Button className="w-full bg-primary/20 text-primary border border-primary/50 hover:bg-primary hover:text-primary-foreground font-mono uppercase text-sm tracking-wider shadow-[0_0_15px_rgba(0,212,255,0.2)]">
                Authenticate
              </Button>
            </Link>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 min-h-screen relative">
        <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
        <div className="relative z-10 p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
