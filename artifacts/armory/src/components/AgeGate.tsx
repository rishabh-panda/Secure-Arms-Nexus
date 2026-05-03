import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export function AgeGate() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const hasConsented = localStorage.getItem("armorx-age-consent");
    if (!hasConsented) {
      setIsOpen(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("armorx-age-consent", "true");
    setIsOpen(false);
  };

  const handleDecline = () => {
    window.location.href = "https://www.google.com";
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md bg-background/90 backdrop-blur-xl border-primary/20 p-8 rounded-none border shadow-[0_0_50px_rgba(0,212,255,0.1)] [&>button]:hidden">
        <DialogHeader className="text-center space-y-4">
          <DialogTitle className="text-3xl font-mono text-primary uppercase tracking-widest">Restricted Access</DialogTitle>
          <DialogDescription className="text-muted-foreground font-mono text-xs uppercase tracking-wider">
            WARNING: You are entering a secure, legally compliant arms and ammunition platform.
          </DialogDescription>
        </DialogHeader>
        <div className="py-6 space-y-4 text-center text-sm text-foreground/80">
          <p>
            By entering this site, you certify that you are at least 18 years of age (or 21 years of age for certain jurisdictions/products) and that it is legal for you to view and purchase firearms or ammunition in your jurisdiction.
          </p>
          <p className="text-destructive font-semibold">
            All purchases require rigorous background checks and KYC/License verification.
          </p>
        </div>
        <div className="flex flex-col gap-3">
          <Button onClick={handleAccept} className="w-full bg-primary/10 text-primary border border-primary/50 hover:bg-primary hover:text-primary-foreground uppercase font-mono tracking-wider transition-all duration-300 shadow-[0_0_15px_rgba(0,212,255,0.2)]">
            I Certify I Am Of Legal Age
          </Button>
          <Button variant="outline" onClick={handleDecline} className="w-full border-muted/50 text-muted-foreground hover:bg-muted/20 uppercase font-mono tracking-wider">
            Exit Immediately
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
