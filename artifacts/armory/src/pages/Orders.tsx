import { Link } from "wouter";
import { useListOrders } from "@workspace/api-client-react";
import { format } from "date-fns";
import { Package, ChevronRight, AlertCircle, CheckCircle2, Clock, XCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function Orders() {
  const { data: ordersData, isLoading } = useListOrders();

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

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'approved':
      case 'shipped':
      case 'delivered': return <CheckCircle2 className="w-3 h-3 mr-1" />;
      case 'rejected':
      case 'cancelled': return <XCircle className="w-3 h-3 mr-1" />;
      case 'compliance_review': return <AlertCircle className="w-3 h-3 mr-1" />;
      default: return <Clock className="w-3 h-3 mr-1" />;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-mono font-bold uppercase tracking-widest text-primary">Logistics History</h1>
        <p className="text-muted-foreground font-mono text-sm tracking-wider uppercase mt-1">Track asset requisitions</p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => <div key={i} className="h-24 bg-card border border-border rounded animate-pulse" />)}
        </div>
      ) : ordersData?.items.length === 0 ? (
        <div className="text-center py-20 bg-card/30 border border-primary/10 backdrop-blur-sm">
          <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <h3 className="font-mono text-xl uppercase tracking-widest text-muted-foreground">No Logistics Data</h3>
          <p className="text-sm text-muted-foreground/60 mt-2 font-mono uppercase">You have not initiated any requisitions.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {ordersData?.items.map(order => (
            <Link key={order.id} href={`/orders/${order.id}`}>
              <Card className="bg-card/50 backdrop-blur-md border-primary/20 hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer rounded-none group mb-4 block">
                <CardContent className="p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-lg text-foreground">ORDER #{order.id.toString().padStart(6, '0')}</span>
                      <Badge variant="outline" className={`font-mono text-[10px] uppercase ${getStatusColor(order.status)}`}>
                        {getStatusIcon(order.status)}
                        {order.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    <div className="text-xs font-mono text-muted-foreground uppercase">
                      Initiated: {format(new Date(order.createdAt), "MMM dd, yyyy HH:mm")}
                    </div>
                    <div className="text-sm font-sans text-foreground/80 line-clamp-1 max-w-md">
                      {order.items.map(i => `${i.quantity}x ${i.productName}`).join(", ")}
                    </div>
                  </div>
                  
                  <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-4">
                    <div className="font-mono text-xl text-primary font-bold">
                      ${Number(order.total).toFixed(2)}
                    </div>
                    <Button variant="ghost" className="font-mono text-xs uppercase tracking-wider text-muted-foreground group-hover:text-primary">
                      View Dossier <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
