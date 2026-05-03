import { useAdminListKyc, useAdminApproveKyc, useAdminRejectKyc, getAdminListKycQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { ShieldCheck, XCircle } from "lucide-react";

export default function AdminKyc() {
  const { data: kycData, isLoading } = useAdminListKyc({ status: "pending" });
  const approveMutation = useAdminApproveKyc();
  const rejectMutation = useAdminRejectKyc();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleApprove = (id: number) => {
    approveMutation.mutate({ id }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getAdminListKycQueryKey() });
        toast({ title: "Clearance Granted", description: "Identity verified successfully." });
      }
    });
  };

  const handleReject = (id: number) => {
    const reason = prompt("Enter rejection reason:");
    if (!reason) return;
    
    rejectMutation.mutate({ id, data: { reason } }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getAdminListKycQueryKey() });
        toast({ title: "Clearance Denied", description: "Identity verification rejected." });
      }
    });
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-mono font-bold uppercase tracking-widest text-primary">Clearance Queue</h2>

      <Card className="bg-card/40 backdrop-blur-sm border-primary/20 rounded-none overflow-hidden">
        <Table>
          <TableHeader className="bg-primary/5">
            <TableRow className="border-primary/20 hover:bg-transparent">
              <TableHead className="font-mono text-xs uppercase text-primary">User</TableHead>
              <TableHead className="font-mono text-xs uppercase text-primary">Document Type</TableHead>
              <TableHead className="font-mono text-xs uppercase text-primary">Document ID</TableHead>
              <TableHead className="font-mono text-xs uppercase text-primary">Address</TableHead>
              <TableHead className="font-mono text-xs uppercase text-primary text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
               <TableRow><TableCell colSpan={5} className="text-center font-mono text-sm py-8 text-primary animate-pulse">Loading queue...</TableCell></TableRow>
            ) : (kycData as any[])?.length === 0 ? (
               <TableRow><TableCell colSpan={5} className="text-center font-mono text-sm py-8 text-muted-foreground uppercase">Queue is empty</TableCell></TableRow>
            ) : (kycData as any[])?.map((kyc: any) => (
                <TableRow key={kyc.id} className="border-primary/10 hover:bg-primary/5">
                  <TableCell>
                    <div className="font-mono text-sm uppercase text-foreground">{kyc.userFullName}</div>
                    <div className="font-mono text-xs text-muted-foreground">{kyc.userEmail}</div>
                  </TableCell>
                  <TableCell className="font-mono text-sm uppercase">{kyc.documentType.replace('_', ' ')}</TableCell>
                  <TableCell className="font-mono text-sm tracking-widest">{kyc.documentNumber}</TableCell>
                  <TableCell className="font-sans text-xs max-w-xs truncate" title={kyc.address}>{kyc.address}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button size="sm" variant="outline" className="border-green-500/30 text-green-500 hover:bg-green-500/10 font-mono text-[10px] uppercase" onClick={() => handleApprove(kyc.id)}>
                        <ShieldCheck className="w-3 h-3 mr-1" /> Approve
                      </Button>
                      <Button size="sm" variant="outline" className="border-destructive/30 text-destructive hover:bg-destructive/10 font-mono text-[10px] uppercase" onClick={() => handleReject(kyc.id)}>
                        <XCircle className="w-3 h-3 mr-1" /> Reject
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            }
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
