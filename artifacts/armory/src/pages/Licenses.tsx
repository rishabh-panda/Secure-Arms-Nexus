import { useListLicenses, useSubmitLicense, getListLicensesQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FileText, Plus, CheckCircle2, Clock, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useState } from "react";

const licenseSchema = z.object({
  licenseType: z.enum(["firearms_dealer", "concealed_carry", "hunting", "collector"]),
  licenseNumber: z.string().min(3),
  issuingAuthority: z.string().min(2),
  issuedDate: z.string().min(10),
  expiryDate: z.string().min(10),
});

export default function Licenses() {
  const { data: licensesData, isLoading } = useListLicenses();
  const submitMutation = useSubmitLicense();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);

  const form = useForm<z.infer<typeof licenseSchema>>({
    resolver: zodResolver(licenseSchema),
    defaultValues: {
      licenseType: "firearms_dealer",
      licenseNumber: "",
      issuingAuthority: "",
      issuedDate: "",
      expiryDate: "",
    },
  });

  const onSubmit = (values: z.infer<typeof licenseSchema>) => {
    submitMutation.mutate({ data: values }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListLicensesQueryKey() });
        toast({ title: "License Registered", description: "Document submitted for validation." });
        setOpen(false);
        form.reset();
      },
      onError: (err) => {
        toast({ title: "Registration Failed", description: err.error || "Failed to submit license.", variant: "destructive" });
      }
    });
  };

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'approved': return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'rejected': case 'expired': return <XCircle className="w-4 h-4 text-destructive" />;
      default: return <Clock className="w-4 h-4 text-amber-500" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-mono font-bold uppercase tracking-widest text-primary flex items-center">
            <FileText className="mr-3 w-8 h-8" /> License Registry
          </h1>
          <p className="text-muted-foreground font-mono text-sm tracking-wider uppercase mt-1">Manage operational authorizations</p>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="font-mono uppercase tracking-wider bg-primary/20 text-primary border border-primary/50 hover:bg-primary hover:text-primary-foreground shadow-[0_0_15px_rgba(0,212,255,0.2)]">
              <Plus className="w-4 h-4 mr-2" /> Add License
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card/90 backdrop-blur-xl border-primary/30 rounded-none sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="font-mono uppercase text-primary tracking-widest">Register New License</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
                <FormField
                  control={form.control}
                  name="licenseType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-mono uppercase text-xs text-primary/80 tracking-wider">Classification</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-background/50 border-primary/30 font-mono text-sm uppercase">
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="firearms_dealer">Federal Firearms License (FFL)</SelectItem>
                          <SelectItem value="concealed_carry">Concealed Carry Permit (CCW)</SelectItem>
                          <SelectItem value="collector">Curio & Relic (C&R)</SelectItem>
                          <SelectItem value="hunting">Hunting License</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="licenseNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-mono uppercase text-xs text-primary/80 tracking-wider">License Number</FormLabel>
                      <FormControl>
                        <Input className="bg-background/50 border-primary/20 font-mono text-sm tracking-widest" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="issuingAuthority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-mono uppercase text-xs text-primary/80 tracking-wider">Issuing Authority</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. ATF, State Police" className="bg-background/50 border-primary/20 font-mono text-sm" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="issuedDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-mono uppercase text-xs text-primary/80 tracking-wider">Issue Date</FormLabel>
                        <FormControl>
                          <Input placeholder="YYYY-MM-DD" className="bg-background/50 border-primary/20 font-mono text-sm" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="expiryDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-mono uppercase text-xs text-primary/80 tracking-wider">Expiry Date</FormLabel>
                        <FormControl>
                          <Input placeholder="YYYY-MM-DD" className="bg-background/50 border-primary/20 font-mono text-sm" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Button type="submit" className="w-full font-mono uppercase tracking-wider bg-primary/20 text-primary border border-primary/50 hover:bg-primary hover:text-primary-foreground mt-4" disabled={submitMutation.isPending}>
                  {submitMutation.isPending ? "Transmitting..." : "Submit to Registry"}
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2].map(i => <div key={i} className="h-32 bg-card border border-border rounded animate-pulse" />)}
        </div>
      ) : (licensesData as any[])?.length === 0 ? (
        <div className="text-center py-20 bg-card/30 border border-primary/10 backdrop-blur-sm">
          <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <h3 className="font-mono text-xl uppercase tracking-widest text-muted-foreground">No Licenses Found</h3>
          <p className="text-sm text-muted-foreground/60 mt-2 font-mono uppercase">Register licenses to access restricted inventory.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(licensesData as any[])?.map((license: any) => (
            <Card key={license.id} className="bg-card/40 backdrop-blur-sm border-primary/20 rounded-none relative overflow-hidden">
              {license.status === 'approved' && <div className="absolute top-0 right-0 w-16 h-16 bg-green-500/10 blur-xl rounded-full" />}
              {license.status === 'rejected' && <div className="absolute top-0 right-0 w-16 h-16 bg-destructive/10 blur-xl rounded-full" />}
              
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <div className="font-mono text-xs text-muted-foreground uppercase mb-1">Class</div>
                    <div className="font-mono text-lg text-foreground uppercase tracking-wider">{license.licenseType.replace('_', ' ')}</div>
                  </div>
                  <Badge variant="outline" className={`font-mono text-[10px] uppercase flex items-center gap-1
                    ${license.status === 'approved' ? 'border-green-500/30 text-green-500 bg-green-500/10' : 
                      license.status === 'rejected' || license.status === 'expired' ? 'border-destructive/30 text-destructive bg-destructive/10' : 
                      'border-amber-500/30 text-amber-500 bg-amber-500/10'}`}>
                    {getStatusIcon(license.status)}
                    {license.status}
                  </Badge>
                </div>

                <div className="space-y-4">
                  <div className="bg-background/50 border border-primary/10 p-3">
                    <div className="font-mono text-[10px] text-muted-foreground uppercase mb-1">ID Number</div>
                    <div className="font-mono text-sm tracking-widest text-primary">{license.licenseNumber}</div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="font-mono text-[10px] text-muted-foreground uppercase mb-1">Authority</div>
                      <div className="font-sans text-sm text-foreground/80">{license.issuingAuthority}</div>
                    </div>
                    <div>
                      <div className="font-mono text-[10px] text-muted-foreground uppercase mb-1">Valid Until</div>
                      <div className="font-mono text-sm text-foreground/80">{new Date(license.expiryDate).toLocaleDateString()}</div>
                    </div>
                  </div>
                </div>

                {license.rejectionReason && (
                  <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 text-xs font-sans text-destructive">
                    Reason: {license.rejectionReason}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
