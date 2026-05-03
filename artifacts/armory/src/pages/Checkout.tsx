import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useGetCart, useValidateCart, useListLicenses, useCreateOrder, getGetCartQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { ShieldCheck, ArrowRight, ArrowLeft, CheckCircle2, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

export default function Checkout() {
  const [, setLocation] = useLocation();
  const [step, setStep] = useState(1);
  const [shippingAddress, setShippingAddress] = useState("");
  const [selectedLicenses, setSelectedLicenses] = useState<number[]>([]);
  const [consentGiven, setConsentGiven] = useState(false);

  const { data: cart, isLoading: cartLoading } = useGetCart();
  const { data: validation } = useValidateCart({ query: { enabled: !!cart && cart.items.length > 0 } });
  const { data: licenses } = useListLicenses({ query: { enabled: !!validation?.requiresLicense } });
  
  const createOrderMutation = useCreateOrder();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  if (cartLoading) return <div className="p-10 font-mono text-primary animate-pulse text-center">Processing...</div>;
  if (!cart || cart.items.length === 0) {
    setLocation("/cart");
    return null;
  }

  const handleNextStep = () => {
    if (step === 1 && !shippingAddress.trim()) {
      toast({ title: "Incomplete Data", description: "Provide a delivery destination.", variant: "destructive" });
      return;
    }
    if (step === 2 && validation?.requiresLicense && selectedLicenses.length === 0) {
      toast({ title: "License Required", description: "Select an approved license for restricted assets.", variant: "destructive" });
      return;
    }
    if (step === 3 && !consentGiven) {
      toast({ title: "Consent Required", description: "You must authorize the transaction and background checks.", variant: "destructive" });
      return;
    }
    
    if (step === 3) {
      // Submit order
      createOrderMutation.mutate({
        data: {
          shippingAddress,
          licenseIds: selectedLicenses.length > 0 ? selectedLicenses : undefined,
          consentGiven
        }
      }, {
        onSuccess: (order) => {
          queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() });
          toast({ title: "Order Transmitted", description: `Order #${order.id} submitted for compliance review.` });
          setLocation(`/orders/${order.id}`);
        },
        onError: (err) => {
          toast({ title: "Transmission Failed", description: err.error || "Failed to create order.", variant: "destructive" });
        }
      });
    } else {
      setStep(s => s + 1);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-mono font-bold uppercase tracking-widest text-primary">Checkout Protocol</h1>
        <div className="flex gap-2 mt-4">
          {[1, 2, 3].map(i => (
            <div key={i} className={`h-2 flex-1 ${step >= i ? 'bg-primary' : 'bg-primary/20'}`} />
          ))}
        </div>
      </div>

      <Card className="bg-card/60 backdrop-blur-md border-primary/30 rounded-none">
        <CardContent className="p-6 md:p-10 space-y-6">
          
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in">
              <h2 className="font-mono text-xl uppercase tracking-widest text-primary border-b border-primary/20 pb-4">Step 1: Logistics</h2>
              <div className="space-y-4">
                <div>
                  <label className="font-mono text-xs uppercase tracking-wider text-muted-foreground block mb-2">Secure Delivery Destination</label>
                  <Input 
                    value={shippingAddress} 
                    onChange={e => setShippingAddress(e.target.value)} 
                    placeholder="Enter full address..." 
                    className="bg-background/50 border-primary/30 font-mono text-sm"
                  />
                  <p className="text-[10px] font-mono text-muted-foreground uppercase mt-2">Delivery to FFL dealers required for firearms. Address will be cross-referenced with license registry.</p>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
              <h2 className="font-mono text-xl uppercase tracking-widest text-primary border-b border-primary/20 pb-4">Step 2: Compliance</h2>
              
              {validation?.requiresLicense ? (
                <div className="space-y-4">
                  <div className="bg-destructive/10 border border-destructive/30 p-4 mb-6">
                    <div className="flex items-center text-destructive font-mono uppercase text-sm mb-2">
                      <ShieldAlert className="w-4 h-4 mr-2" /> Restricted Assets Detected
                    </div>
                    <p className="text-xs text-foreground/80 font-sans">
                      Your payload contains items requiring valid licenses. Select applicable licenses from your file.
                    </p>
                  </div>

                  {(licenses as any[])?.filter((l: any) => l.status === "approved").length === 0 ? (
                    <div className="text-center p-6 border border-dashed border-primary/20">
                      <p className="text-sm font-mono text-muted-foreground uppercase">No approved licenses found.</p>
                      <Link href="/licenses">
                        <Button variant="link" className="text-primary mt-2">Upload License Data</Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {(licenses as any[])?.filter((l: any) => l.status === "approved").map((license: any) => (
                        <div key={license.id} className={`flex items-center space-x-3 border p-4 ${selectedLicenses.includes(license.id) ? 'border-primary bg-primary/10' : 'border-primary/20 bg-background/50'} cursor-pointer`} onClick={() => {
                          setSelectedLicenses(prev => prev.includes(license.id) ? prev.filter(id => id !== license.id) : [...prev, license.id])
                        }}>
                          <Checkbox checked={selectedLicenses.includes(license.id)} />
                          <div>
                            <div className="font-mono text-sm uppercase text-primary">{license.licenseType.replace('_', ' ')}</div>
                            <div className="font-mono text-xs text-muted-foreground">ID: {license.licenseNumber} | Exp: {new Date(license.expiryDate).toLocaleDateString()}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-10 bg-primary/5 border border-primary/20">
                  <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-4" />
                  <p className="font-mono text-sm uppercase text-green-500">No Restricted Assets in Payload</p>
                  <p className="text-xs text-muted-foreground mt-2 font-mono uppercase">Proceed to final authorization.</p>
                </div>
              )}
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
              <h2 className="font-mono text-xl uppercase tracking-widest text-primary border-b border-primary/20 pb-4">Step 3: Authorization</h2>
              
              <div className="bg-background/50 border border-primary/20 p-4 space-y-4">
                <div className="flex justify-between border-b border-primary/10 pb-2">
                  <span className="font-mono text-sm text-muted-foreground uppercase">Payload Total</span>
                  <span className="font-mono text-sm text-foreground">${Number(cart.subtotal).toFixed(2)}</span>
                </div>
                <div className="flex justify-between border-b border-primary/10 pb-2">
                  <span className="font-mono text-sm text-muted-foreground uppercase">Compliance Fee</span>
                  <span className="font-mono text-sm text-foreground">$25.00</span>
                </div>
                <div className="flex justify-between pt-2">
                  <span className="font-mono text-lg text-primary uppercase">Total Requisition</span>
                  <span className="font-mono text-lg text-primary font-bold">${(Number(cart.subtotal) + 25).toFixed(2)}</span>
                </div>
              </div>

              <div className="flex items-start space-x-3 bg-primary/5 p-4 border border-primary/30">
                <Checkbox id="consent" checked={consentGiven} onCheckedChange={(checked) => setConsentGiven(checked as boolean)} className="mt-1" />
                <label htmlFor="consent" className="text-xs font-sans text-muted-foreground leading-relaxed cursor-pointer">
                  I hereby authorize ArmorX to process this transaction. I understand that restricted items will undergo a mandatory compliance review and background check prior to shipping. I certify all provided information is accurate under penalty of law.
                </label>
              </div>
            </div>
          )}

          <div className="flex justify-between pt-6 border-t border-primary/20">
            {step > 1 ? (
              <Button variant="ghost" onClick={() => setStep(s => s - 1)} className="font-mono uppercase text-muted-foreground hover:text-foreground">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back
              </Button>
            ) : <div />}
            
            <Button onClick={handleNextStep} disabled={createOrderMutation.isPending} className="font-mono uppercase tracking-wider bg-primary/20 text-primary border border-primary/50 hover:bg-primary hover:text-primary-foreground shadow-[0_0_15px_rgba(0,212,255,0.2)] min-w-[150px]">
              {createOrderMutation.isPending ? "Transmitting..." : step === 3 ? "Authorize" : "Proceed"} 
              {step !== 3 && <ArrowRight className="w-4 h-4 ml-2" />}
            </Button>
          </div>

        </CardContent>
      </Card>
    </div>
  );
}
