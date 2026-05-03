import { Link } from "wouter";
import { useAuth } from "@/components/AuthContext";
import { useGetKycStatus } from "@workspace/api-client-react";
import { User as UserIcon, Shield, FileText, Activity, ShieldCheck, Mail, Calendar, LogOut } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function Profile() {
  const { user, logout } = useAuth();
  const { data: kycStatus } = useGetKycStatus();

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-end border-b border-primary/20 pb-6 mb-8">
        <div>
          <h1 className="text-3xl font-mono font-bold uppercase tracking-widest text-primary flex items-center">
            <UserIcon className="mr-3 w-8 h-8" /> Operative Dossier
          </h1>
          <p className="text-muted-foreground font-mono text-sm tracking-wider uppercase mt-1">ID: #{user.id.toString().padStart(6, '0')}</p>
        </div>
        <Button variant="outline" onClick={logout} className="font-mono uppercase text-xs border-destructive/30 text-destructive hover:bg-destructive/10">
          <LogOut className="w-4 h-4 mr-2" /> Disconnect
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Core Identity */}
        <Card className="bg-card/40 backdrop-blur-sm border-primary/20 rounded-none md:col-span-2">
          <CardContent className="p-8">
            <h3 className="font-mono text-sm uppercase tracking-widest text-muted-foreground border-b border-primary/20 pb-2 mb-6">Core Identity</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              <div>
                <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Designation</div>
                <div className="font-mono text-2xl uppercase tracking-wider text-foreground">{user.firstName} {user.lastName}</div>
              </div>
              
              <div>
                <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider mb-1 flex items-center">
                  <Mail className="w-3 h-3 mr-1" /> Comm Link
                </div>
                <div className="font-mono text-sm text-foreground/80">{user.email}</div>
              </div>

              <div>
                <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider mb-1 flex items-center">
                  <Shield className="w-3 h-3 mr-1" /> Access Level
                </div>
                <Badge variant="outline" className="font-mono text-xs uppercase border-primary/50 text-primary bg-primary/10 mt-1">
                  {user.role.replace('_', ' ')}
                </Badge>
              </div>

              <div>
                <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider mb-1 flex items-center">
                  <Calendar className="w-3 h-3 mr-1" /> Initialization Date
                </div>
                <div className="font-mono text-sm text-foreground/80">{new Date(user.createdAt).toLocaleDateString()}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Clearance Status */}
        <div className="space-y-6">
          <Card className="bg-card/40 backdrop-blur-sm border-primary/20 rounded-none">
            <CardContent className="p-6">
              <h3 className="font-mono text-sm uppercase tracking-widest text-muted-foreground border-b border-primary/20 pb-2 mb-4 flex items-center">
                <ShieldCheck className="w-4 h-4 mr-2" /> Clearance Status
              </h3>
              
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-mono text-xs uppercase text-foreground/80">Age Verification</span>
                    {user.isAgeVerified ? (
                      <span className="font-mono text-[10px] uppercase text-green-500">Verified</span>
                    ) : (
                      <span className="font-mono text-[10px] uppercase text-destructive">Pending</span>
                    )}
                  </div>
                  <div className="w-full h-1 bg-background border border-primary/10">
                    <div className={`h-full ${user.isAgeVerified ? 'bg-green-500/50 w-full' : 'bg-destructive/50 w-1/4'}`}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-mono text-xs uppercase text-foreground/80">Identity (KYC)</span>
                    <span className={`font-mono text-[10px] uppercase ${
                      kycStatus?.status === 'approved' ? 'text-green-500' : 
                      kycStatus?.status === 'pending' ? 'text-amber-500' : 
                      kycStatus?.status === 'rejected' ? 'text-destructive' : 'text-muted-foreground'
                    }`}>
                      {kycStatus?.status ? kycStatus.status.replace('_', ' ') : 'Not Submitted'}
                    </span>
                  </div>
                  <div className="w-full h-1 bg-background border border-primary/10">
                    <div className={`h-full ${
                      kycStatus?.status === 'approved' ? 'bg-green-500/50 w-full' : 
                      kycStatus?.status === 'pending' ? 'bg-amber-500/50 w-1/2' : 
                      kycStatus?.status === 'rejected' ? 'bg-destructive/50 w-full' : 'bg-primary/20 w-0'
                    }`}></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/40 backdrop-blur-sm border-primary/20 rounded-none">
            <CardContent className="p-6">
              <h3 className="font-mono text-sm uppercase tracking-widest text-muted-foreground border-b border-primary/20 pb-2 mb-4 flex items-center">
                <Activity className="w-4 h-4 mr-2" /> Quick Actions
              </h3>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start font-mono text-xs uppercase border-primary/20 hover:bg-primary/10 hover:text-primary" asChild>
                  <Link href="/orders">View Logistics History</Link>
                </Button>
                <Button variant="outline" className="w-full justify-start font-mono text-xs uppercase border-primary/20 hover:bg-primary/10 hover:text-primary" asChild>
                  <Link href="/licenses">Manage Licenses</Link>
                </Button>
                <Button variant="outline" className="w-full justify-start font-mono text-xs uppercase border-primary/20 hover:bg-primary/10 hover:text-primary" asChild>
                  <Link href="/kyc">Update Clearance Data</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
