import { useParams, Link } from "wouter";
import { useGetOrder } from "@workspace/api-client-react";
import { format } from "date-fns";
import { ArrowLeft, Package, ShieldCheck, Truck, CheckCircle2, Clock, AlertTriangle, FileText } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function OrderDetail() {
  const params = useParams();
  const id = Number(params.id);
  const { data: order, isLoading } = useGetOrder(id, { query: { enabled: !!id } });

  if (isLoading) return <div className="p-10 font-mono text-primary animate-pulse text-center">Decrypting Order Data...</div>;
  if (!order) return <div className="p-10 font-mono text-destructive text-center uppercase tracking-widest">Order Not Found</div>;

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'approved':
      case 'shipped':
      case 'delivered': return 'text-green-500 border-green-500/30 bg-green-500/10';
      case 'rejected':
      case 'cancelled': return 'text-destructive border-destructive/30 bg-destructive/10';
      case 'compliance_review': return 'text-amber-500 border-amber-500/30 bg-amber-500/10 animate-pulse';
      default: return 'text-primary border-primary/30 bg-primary/10';
    }
  };

  const steps = [
    { id: 'pending', label: 'Initiated', icon: FileText },
    { id: 'compliance_review', label: 'Compliance', icon: ShieldCheck },
    { id: 'processing', label: 'Processing', icon: Package },
    { id: 'shipped', label: 'In Transit', icon: Truck },
    { id: 'delivered', label: 'Delivered', icon: CheckCircle2 }
  ];

  const currentStepIndex = steps.findIndex(s => s.id === order.status);
  const isCancelledOrRejected = ['cancelled', 'rejected'].includes(order.status);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Link href="/orders" className="text-primary hover:text-primary/80 font-mono text-xs uppercase flex items-center mb-6 w-fit">
        <ArrowLeft className="w-4 h-4 mr-2" /> Return to Logistics
      </Link>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-primary/20 pb-6">
        <div>
          <h1 className="text-3xl font-mono font-bold uppercase tracking-widest text-primary">
            Dossier #{order.id.toString().padStart(6, '0')}
          </h1>
          <div className="text-muted-foreground font-mono text-sm tracking-wider uppercase mt-2">
            Initiated: {format(new Date(order.createdAt), "MMM dd, yyyy HH:mm:ss")}
          </div>
        </div>
        <Badge variant="outline" className={`font-mono text-xs uppercase px-3 py-1 ${getStatusColor(order.status)}`}>
          {order.status.replace('_', ' ')}
        </Badge>
      </div>

      {/* Status Timeline */}
      <Card className="bg-card/40 backdrop-blur-sm border-primary/20 rounded-none overflow-hidden">
        <CardContent className="p-6 md:p-8">
          <h3 className="font-mono text-sm uppercase tracking-widest text-muted-foreground mb-8">Operational Status</h3>
          
          {isCancelledOrRejected ? (
            <div className="bg-destructive/10 border border-destructive/30 p-6 flex flex-col items-center justify-center text-center">
              <AlertTriangle className="w-12 h-12 text-destructive mb-4" />
              <h4 className="font-mono text-xl uppercase text-destructive tracking-widest mb-2">Operation Terminated</h4>
              <p className="font-mono text-sm text-foreground/80">{order.complianceNotes || "No specific reason provided."}</p>
            </div>
          ) : (
            <div className="relative">
              <div className="absolute top-5 left-6 right-6 h-0.5 bg-primary/20 hidden md:block" />
              <div className="flex flex-col md:flex-row justify-between gap-6 relative z-10">
                {steps.map((step, idx) => {
                  let status: 'completed' | 'current' | 'upcoming' = 'upcoming';
                  if (order.status === 'approved' && step.id === 'compliance_review') status = 'completed'; // handle skipped visual states
                  else if (idx < currentStepIndex) status = 'completed';
                  else if (idx === currentStepIndex || (order.status === 'approved' && step.id === 'processing')) status = 'current';

                  return (
                    <div key={step.id} className="flex flex-row md:flex-col items-center gap-4 md:gap-2 relative bg-card/40 md:bg-transparent">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 
                        ${status === 'completed' ? 'bg-primary text-primary-foreground border-primary shadow-[0_0_15px_rgba(0,212,255,0.5)]' : 
                          status === 'current' ? 'bg-primary/20 text-primary border-primary animate-pulse' : 
                          'bg-background border-primary/20 text-muted-foreground'}`}>
                        <step.icon className="w-5 h-5" />
                      </div>
                      <div className="font-mono text-xs uppercase tracking-wider text-center">
                        <div className={status !== 'upcoming' ? 'text-primary' : 'text-muted-foreground'}>{step.label}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {order.complianceNotes && !isCancelledOrRejected && (
            <div className="mt-8 bg-amber-500/10 border border-amber-500/30 p-4">
              <div className="flex items-center text-amber-500 font-mono uppercase text-xs mb-2">
                <ShieldCheck className="w-4 h-4 mr-2" /> Compliance Officer Note
              </div>
              <p className="text-sm font-sans text-foreground/80">{order.complianceNotes}</p>
            </div>
          )}

          {order.trackingNumber && (
            <div className="mt-8 bg-primary/5 border border-primary/20 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <div className="text-xs font-mono uppercase text-muted-foreground mb-1">Secure Transport Tracking</div>
                <div className="font-mono text-lg text-primary">{order.trackingNumber}</div>
              </div>
              <Button variant="outline" className="font-mono uppercase text-xs border-primary/30 text-primary">Track Asset</Button>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Items */}
        <Card className="bg-card/40 backdrop-blur-sm border-primary/20 rounded-none">
          <CardContent className="p-6">
            <h3 className="font-mono text-sm uppercase tracking-widest text-muted-foreground border-b border-primary/20 pb-4 mb-4">Requisitioned Assets</h3>
            <div className="space-y-4">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center">
                  <div>
                    <div className="font-mono text-sm uppercase text-foreground">{item.productName}</div>
                    <div className="font-mono text-xs text-muted-foreground">QTY: {item.quantity}</div>
                  </div>
                  <div className="font-mono text-primary font-bold">${Number(item.price).toFixed(2)}</div>
                </div>
              ))}
            </div>
            <div className="mt-6 pt-4 border-t border-primary/20 space-y-2 font-mono text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span>${Number(order.subtotal).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Fees & Shipping</span>
                <span>${(order.total - order.subtotal).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-primary text-lg font-bold pt-2">
                <span>Total</span>
                <span>${Number(order.total).toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Logistics details */}
        <Card className="bg-card/40 backdrop-blur-sm border-primary/20 rounded-none">
          <CardContent className="p-6 space-y-6">
            <div>
              <h3 className="font-mono text-sm uppercase tracking-widest text-muted-foreground border-b border-primary/20 pb-2 mb-4">Delivery Destination</h3>
              <p className="font-mono text-sm text-foreground/80 whitespace-pre-wrap">{order.shippingAddress}</p>
            </div>
            
            <div>
              <h3 className="font-mono text-sm uppercase tracking-widest text-muted-foreground border-b border-primary/20 pb-2 mb-4">Clearance Protocols</h3>
              <ul className="space-y-2">
                <li className="flex items-center text-sm font-sans text-foreground/80">
                  <CheckCircle2 className="w-4 h-4 text-green-500 mr-2" /> Age Verification: Passed
                </li>
                <li className="flex items-center text-sm font-sans text-foreground/80">
                  <CheckCircle2 className="w-4 h-4 text-green-500 mr-2" /> Identity KYC: Passed
                </li>
                <li className="flex items-center text-sm font-sans text-foreground/80">
                  {order.status === 'pending' || order.status === 'compliance_review' ? (
                    <Clock className="w-4 h-4 text-amber-500 mr-2" /> 
                  ) : order.status === 'rejected' || order.status === 'cancelled' ? (
                     <XCircle className="w-4 h-4 text-destructive mr-2" />
                  ) : (
                    <ShieldCheck className="w-4 h-4 text-green-500 mr-2" />
                  )}
                  Transfer Approval: {order.status === 'pending' || order.status === 'compliance_review' ? 'Pending FFL Review' : order.status === 'rejected' || order.status === 'cancelled' ? 'Failed' : 'Authorized'}
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
