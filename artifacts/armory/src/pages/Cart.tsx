import { useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useGetCart, useUpdateCartItem, useRemoveFromCart, useClearCart, useValidateCart, getGetCartQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { ShieldAlert, Trash2, Plus, Minus, ArrowRight, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function Cart() {
  const [, setLocation] = useLocation();
  const { data: cart, isLoading } = useGetCart();

  const validateMutation = useValidateCart();
  const updateMutation = useUpdateCartItem();
  const removeMutation = useRemoveFromCart();
  const clearMutation = useClearCart();

  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Trigger validation whenever cart item count changes
  useEffect(() => {
    if (cart && cart.items.length > 0) {
      validateMutation.mutate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cart?.itemCount]);

  const validation = validateMutation.data;

  const handleUpdate = (productId: number, quantity: number) => {
    if (quantity < 1) return;
    updateMutation.mutate({ productId, data: { quantity } }, {
      onSuccess: () => queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() })
    });
  };

  const handleRemove = (productId: number) => {
    removeMutation.mutate({ productId }, {
      onSuccess: () => queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() })
    });
  };

  const handleClear = () => {
    clearMutation.mutate(undefined, {
      onSuccess: () => queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() })
    });
  };

  if (isLoading) return <div className="p-10 font-mono text-primary animate-pulse text-center">Scanning payload...</div>;

  if (!cart || cart.items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
        <div className="w-24 h-24 rounded-full border-2 border-dashed border-primary/30 flex items-center justify-center bg-primary/5">
          <ShoppingCart className="w-10 h-10 text-primary/50" />
        </div>
        <h2 className="text-2xl font-mono uppercase tracking-widest text-primary">Payload Empty</h2>
        <p className="text-muted-foreground font-mono text-sm uppercase">No assets currently designated for requisition.</p>
        <Link href="/products">
          <Button className="font-mono uppercase tracking-wider bg-primary/20 text-primary border border-primary/50 hover:bg-primary hover:text-primary-foreground">
            Return to Arsenal
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-mono font-bold uppercase tracking-widest text-primary">Requisition Payload</h1>
        <p className="text-muted-foreground font-mono text-sm tracking-wider uppercase mt-1">Review items before checkout</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex justify-end">
            <Button variant="ghost" size="sm" onClick={handleClear} className="text-muted-foreground hover:text-destructive font-mono text-xs uppercase tracking-wider">
              <Trash2 className="w-3 h-3 mr-2" /> Clear Payload
            </Button>
          </div>

          {cart.items.map(item => (
            <Card key={item.productId} className="bg-card/40 backdrop-blur-sm border-primary/20 rounded-none">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="w-20 h-20 bg-background/80 border border-primary/10 flex items-center justify-center flex-shrink-0">
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.productName} className="max-w-full max-h-full p-2 object-contain" />
                  ) : (
                    <ShoppingCart className="w-6 h-6 text-muted-foreground/30" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    {item.requiresLicense && (
                      <span className="bg-destructive/20 text-destructive border border-destructive/30 text-[9px] font-mono uppercase px-1.5 py-0.5">Lic Req</span>
                    )}
                    <span className="text-[10px] text-muted-foreground font-mono uppercase tracking-wider">{item.type}</span>
                  </div>
                  <h3 className="font-mono text-lg uppercase tracking-wide truncate">{item.productName}</h3>
                  <div className="font-mono text-primary font-bold mt-1">${Number(item.price).toFixed(2)}</div>
                </div>

                <div className="flex items-center gap-3 bg-background/50 border border-primary/20 p-1 flex-shrink-0">
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-none hover:bg-primary/20 hover:text-primary" onClick={() => handleUpdate(item.productId, item.quantity - 1)}>
                    <Minus className="w-3 h-3" />
                  </Button>
                  <span className="font-mono text-sm w-4 text-center">{item.quantity}</span>
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-none hover:bg-primary/20 hover:text-primary" onClick={() => handleUpdate(item.productId, item.quantity + 1)}>
                    <Plus className="w-3 h-3" />
                  </Button>
                </div>

                <Button variant="ghost" size="icon" className="h-10 w-10 text-muted-foreground hover:text-destructive hover:bg-destructive/10 ml-2 flex-shrink-0" onClick={() => handleRemove(item.productId)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="space-y-6">
          <Card className="bg-card/60 backdrop-blur-md border-primary/30 rounded-none">
            <CardContent className="p-6">
              <h2 className="font-mono text-xl uppercase tracking-widest border-b border-primary/20 pb-4 mb-4">Summary</h2>

              <div className="space-y-3 mb-6 font-mono text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>Items ({cart.itemCount})</span>
                  <span>${Number(cart.subtotal).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Compliance Fee</span>
                  <span>$25.00</span>
                </div>
                <div className="flex justify-between text-muted-foreground border-b border-primary/10 pb-4">
                  <span>Secure Shipping</span>
                  <span>Calculated at checkout</span>
                </div>
                <div className="flex justify-between text-lg text-primary pt-2">
                  <span>Estimated Total</span>
                  <span>${(Number(cart.subtotal) + 25).toFixed(2)}</span>
                </div>
              </div>

              {validation && !validation.isEligible && (
                <Alert variant="destructive" className="mb-6 bg-destructive/10 border-destructive/50">
                  <ShieldAlert className="h-4 w-4" />
                  <AlertTitle className="font-mono uppercase tracking-wider text-xs">Compliance Hold</AlertTitle>
                  <AlertDescription className="font-sans text-xs mt-2">
                    <ul className="list-disc pl-4 space-y-1">
                      {validation.issues.map((issue, idx) => <li key={idx}>{issue}</li>)}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}

              <Button
                className="w-full h-12 font-mono uppercase tracking-widest bg-primary/20 text-primary border border-primary hover:bg-primary hover:text-primary-foreground shadow-[0_0_15px_rgba(0,212,255,0.2)]"
                onClick={() => setLocation("/checkout")}
              >
                Proceed to Checkout <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
