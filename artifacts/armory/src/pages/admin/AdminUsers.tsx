import { useAdminListUsers, useAdminUpdateUserRole, getAdminListUsersQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";

export default function AdminUsers() {
  const { data: usersData, isLoading } = useAdminListUsers();
  const updateRoleMutation = useAdminUpdateUserRole();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleRoleChange = (id: number, newRole: any) => {
    updateRoleMutation.mutate({ id, data: { role: newRole } }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getAdminListUsersQueryKey() });
        toast({ title: "Access Level Updated", description: `User #${id} role modified.` });
      }
    });
  };

  const getKycColor = (status: string) => {
    switch(status) {
      case 'approved': return 'text-green-500 border-green-500/30';
      case 'rejected': return 'text-destructive border-destructive/30';
      case 'pending': return 'text-amber-500 border-amber-500/30';
      default: return 'text-muted-foreground border-muted/30';
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-mono font-bold uppercase tracking-widest text-primary">Operative Registry</h2>

      <Card className="bg-card/40 backdrop-blur-sm border-primary/20 rounded-none overflow-hidden">
        <Table>
          <TableHeader className="bg-primary/5">
            <TableRow className="border-primary/20 hover:bg-transparent">
              <TableHead className="font-mono text-xs uppercase text-primary">ID / Comm Link</TableHead>
              <TableHead className="font-mono text-xs uppercase text-primary">Designation</TableHead>
              <TableHead className="font-mono text-xs uppercase text-primary">Age Verified</TableHead>
              <TableHead className="font-mono text-xs uppercase text-primary">KYC Status</TableHead>
              <TableHead className="font-mono text-xs uppercase text-primary">Access Level</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
               <TableRow><TableCell colSpan={5} className="text-center font-mono text-sm py-8 text-primary animate-pulse">Loading data...</TableCell></TableRow>
            ) : usersData?.items.map(user => (
                <TableRow key={user.id} className="border-primary/10 hover:bg-primary/5">
                  <TableCell>
                    <div className="font-mono text-sm text-foreground">#{user.id}</div>
                    <div className="font-mono text-xs text-muted-foreground">{user.email}</div>
                  </TableCell>
                  <TableCell className="font-mono text-sm uppercase">{user.firstName} {user.lastName}</TableCell>
                  <TableCell>
                    {user.isAgeVerified ? (
                      <Badge variant="outline" className="font-mono text-[10px] uppercase border-green-500/30 text-green-500 bg-transparent">Verified</Badge>
                    ) : (
                      <Badge variant="outline" className="font-mono text-[10px] uppercase border-destructive/30 text-destructive bg-transparent">Pending</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`font-mono text-[10px] uppercase bg-transparent ${getKycColor(user.kycStatus)}`}>
                      {user.kycStatus.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Select defaultValue={user.role} onValueChange={(v) => handleRoleChange(user.id, v)}>
                      <SelectTrigger className="w-[140px] h-8 bg-background/50 border-primary/30 font-mono text-[10px] uppercase">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="guest">Guest</SelectItem>
                        <SelectItem value="verified_buyer">Verified Buyer</SelectItem>
                        <SelectItem value="admin">Administrator</SelectItem>
                      </SelectContent>
                    </Select>
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
