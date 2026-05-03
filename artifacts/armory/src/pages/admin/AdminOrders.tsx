import { useState } from "react";
import { useAdminListOrders, useAdminUpdateOrderStatus, getAdminListOrdersQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Package, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function AdminOrders() {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const { data: ordersData, isLoading } = useAdminListOrders({ status: statusFilter !== 'all' ? statusFilter : undefined });
  const updateMutation = useAdminUpdateOrderStatus();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleStatusChange = (id: number, newStatus: any) => {
    updateMutation.mutate({ id, data: { status: newStatus } }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getAdminListOrdersQueryKey() });
        toast({ title: "Status Updated", description: `Order #${id} status changed to ${newStatus}.` });
      }
    });
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'approved': case 'shipped': case 'delivered': return 'text-green-500 border-green-500/30';
      case 'rejected': case 'cancelled': return 'text-destructive border-destructive/30';
      case 'compliance_review': return 'text-amber-500 border-amber-500/30';
      default: return 'text-primary border-primary/30';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-mono font-bold uppercase tracking-widest text-primary">Logistics Management</h2>
      </div>

      <Card className="bg-card/40 backdrop-blur-sm border-primary/20 rounded-none">
        <CardContent className="p-4 flex gap-4">
          <div className="relative w-64">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
             <Input placeholder="Search orders..." className="pl-9 bg-background/50 border-primary/30 font-mono text-sm" />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48 bg-background/50 border-primary/30 font-mono text-sm uppercase">
              <SelectValue placeholder="Filter Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="compliance_review">Compliance Review</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="shipped">Shipped</SelectItem>
              <SelectItem value="delivered">Delivered</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card className="bg-card/40 backdrop-blur-sm border-primary/20 rounded-none overflow-hidden">
        <Table>
          <TableHeader className="bg-primary/5">
            <TableRow className="border-primary/20 hover:bg-transparent">
              <TableHead className="font-mono text-xs uppercase text-primary">ID</TableHead>
              <TableHead className="font-mono text-xs uppercase text-primary">Date</TableHead>
              <TableHead className="font-mono text-xs uppercase text-primary">User ID</TableHead>
              <TableHead className="font-mono text-xs uppercase text-primary text-right">Value</TableHead>
              <TableHead className="font-mono text-xs uppercase text-primary">Status</TableHead>
              <TableHead className="font-mono text-xs uppercase text-primary">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
               <TableRow><TableCell colSpan={6} className="text-center font-mono text-sm py-8 text-primary animate-pulse">Loading data...</TableCell></TableRow>
            ) : ordersData?.items.length === 0 ? (
               <TableRow><TableCell colSpan={6} className="text-center font-mono text-sm py-8 text-muted-foreground uppercase">No orders found</TableCell></TableRow>
            ) : (
              ordersData?.items.map(order => (
                <TableRow key={order.id} className="border-primary/10 hover:bg-primary/5">
                  <TableCell className="font-mono text-sm text-foreground">#{order.id}</TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">{format(new Date(order.createdAt), "yyyy-MM-dd HH:mm")}</TableCell>
                  <TableCell className="font-mono text-sm">User {order.userId}</TableCell>
                  <TableCell className="font-mono text-sm text-right text-primary font-bold">${Number(order.total).toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`font-mono text-[10px] uppercase bg-transparent ${getStatusColor(order.status)}`}>
                      {order.status.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Select defaultValue={order.status} onValueChange={(v) => handleStatusChange(order.id, v)}>
                      <SelectTrigger className="w-[140px] h-8 bg-background/50 border-primary/30 font-mono text-[10px] uppercase">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="compliance_review">Compliance</SelectItem>
                        <SelectItem value="approved">Approve</SelectItem>
                        <SelectItem value="processing">Process</SelectItem>
                        <SelectItem value="shipped">Ship</SelectItem>
                        <SelectItem value="delivered">Deliver</SelectItem>
                        <SelectItem value="rejected">Reject</SelectItem>
                        <SelectItem value="cancelled">Cancel</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
