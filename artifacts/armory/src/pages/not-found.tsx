import { Link } from "wouter";
import { ShieldAlert, AlertTriangle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center text-center space-y-8">
      <div className="relative">
        <div className="text-[120px] font-mono font-bold text-primary/10 leading-none select-none">404</div>
        <div className="absolute inset-0 flex items-center justify-center">
          <AlertTriangle className="w-16 h-16 text-destructive drop-shadow-[0_0_15px_rgba(255,0,0,0.5)]" />
        </div>
      </div>

      <div className="space-y-3">
        <h1 className="text-3xl font-mono font-bold uppercase tracking-widest text-primary">
          Signal Lost
        </h1>
        <p className="font-mono text-sm text-muted-foreground uppercase tracking-wider max-w-sm mx-auto">
          The requested resource could not be located within the secure network. Access may be restricted or the path does not exist.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link href="/">
          <Button className="font-mono uppercase tracking-wider bg-primary/20 text-primary border border-primary/50 hover:bg-primary hover:text-primary-foreground shadow-[0_0_15px_rgba(0,212,255,0.2)]">
            <ShieldAlert className="w-4 h-4 mr-2" /> Return to Base
          </Button>
        </Link>
        <Link href="/products">
          <Button variant="outline" className="font-mono uppercase tracking-wider border-primary/30 text-muted-foreground hover:text-primary hover:border-primary">
            <ArrowLeft className="w-4 h-4 mr-2" /> Browse Arsenal
          </Button>
        </Link>
      </div>

      <div className="font-mono text-xs text-muted-foreground/40 uppercase tracking-widest">
        Error Code: 404 — Route Unresolved
      </div>
    </div>
  );
}
