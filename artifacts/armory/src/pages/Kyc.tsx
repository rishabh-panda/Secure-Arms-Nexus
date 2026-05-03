import { useGetKycStatus, useSubmitKyc, getGetKycStatusQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ShieldCheck, ShieldAlert, Fingerprint, Clock, CheckCircle2, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";

const kycSchema = z.object({
  documentType: z.enum(["passport", "drivers_license", "national_id"]),
  documentNumber: z.string().min(5),
  dateOfBirth: z.string().min(10),
  address: z.string().min(5),
  city: z.string().min(2),
  state: z.string().min(2),
  country: z.string().min(2),
  postalCode: z.string().min(3),
});

export default function Kyc() {
  const { data: kycStatus, isLoading } = useGetKycStatus();
  const submitMutation = useSubmitKyc();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof kycSchema>>({
    resolver: zodResolver(kycSchema),
    defaultValues: {
      documentType: "drivers_license",
      documentNumber: "",
      dateOfBirth: "",
      address: "",
      city: "",
      state: "",
      country: "",
      postalCode: "",
    },
  });

  const onSubmit = (values: z.infer<typeof kycSchema>) => {
    submitMutation.mutate({ data: values }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetKycStatusQueryKey() });
        toast({ title: "Data Transmitted", description: "Identity documents submitted for review." });
      },
      onError: (err) => {
        toast({ title: "Transmission Error", description: err.error || "Failed to submit documents.", variant: "destructive" });
      }
    });
  };

  if (isLoading) return <div className="p-10 font-mono text-primary animate-pulse text-center">Checking clearance status...</div>;

  const renderStatusBox = () => {
    if (!kycStatus || kycStatus.status === "not_submitted") return null;

    const config = {
      pending: { icon: Clock, color: "text-amber-500", bg: "bg-amber-500/10 border-amber-500/30", title: "Review Pending", desc: "Your identity dossier is under review by our compliance team." },
      approved: { icon: CheckCircle2, color: "text-green-500", bg: "bg-green-500/10 border-green-500/30", title: "Clearance Granted", desc: "Your identity has been verified. You may now request requisitions." },
      rejected: { icon: XCircle, color: "text-destructive", bg: "bg-destructive/10 border-destructive/30", title: "Clearance Denied", desc: `Verification failed: ${kycStatus.rejectionReason}` },
    }[kycStatus.status as "pending" | "approved" | "rejected"];

    const Icon = config.icon;

    return (
      <div className={`p-6 border flex items-start gap-4 mb-8 ${config.bg}`}>
        <Icon className={`w-8 h-8 ${config.color} mt-1`} />
        <div>
          <h3 className={`font-mono text-xl uppercase tracking-widest ${config.color} mb-2`}>{config.title}</h3>
          <p className="text-sm font-sans text-foreground/80">{config.desc}</p>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-mono font-bold uppercase tracking-widest text-primary flex items-center">
          <Fingerprint className="mr-3 w-8 h-8" /> Identity Clearance
        </h1>
        <p className="text-muted-foreground font-mono text-sm tracking-wider uppercase mt-1">Know Your Customer Protocol</p>
      </div>

      {renderStatusBox()}

      {(!kycStatus || kycStatus.status === "not_submitted" || kycStatus.status === "rejected") && (
        <Card className="bg-card/60 backdrop-blur-md border-primary/30 rounded-none">
          <CardHeader className="border-b border-primary/20">
            <CardTitle className="font-mono uppercase text-lg text-primary tracking-widest flex items-center">
              <ShieldCheck className="mr-2 w-5 h-5" /> Submit Credentials
            </CardTitle>
            <CardDescription className="font-mono text-xs uppercase">All fields must match your legal documents exactly.</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="documentType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-mono uppercase text-xs text-primary/80 tracking-wider">Document Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-background/50 border-primary/30 font-mono text-sm uppercase">
                              <SelectValue placeholder="Select document" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="drivers_license">Driver's License</SelectItem>
                            <SelectItem value="passport">Passport</SelectItem>
                            <SelectItem value="national_id">National ID</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="documentNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-mono uppercase text-xs text-primary/80 tracking-wider">Document ID</FormLabel>
                        <FormControl>
                          <Input className="bg-background/50 border-primary/20 font-mono text-sm tracking-widest" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="dateOfBirth"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-mono uppercase text-xs text-primary/80 tracking-wider">Date of Birth (YYYY-MM-DD)</FormLabel>
                      <FormControl>
                        <Input className="bg-background/50 border-primary/20 font-mono text-sm tracking-widest" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-4 border border-primary/10 p-4 bg-background/30">
                  <h3 className="font-mono text-sm uppercase text-muted-foreground border-b border-primary/10 pb-2 mb-4">Registered Domicile</h3>
                  
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-mono uppercase text-[10px] text-primary/80 tracking-wider">Street Address</FormLabel>
                        <FormControl>
                          <Input className="bg-background/50 border-primary/20 font-mono text-sm" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField control={form.control} name="city" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-mono uppercase text-[10px] text-primary/80 tracking-wider">City</FormLabel>
                          <FormControl><Input className="bg-background/50 border-primary/20 font-mono text-sm" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                    )} />
                    <FormField control={form.control} name="state" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-mono uppercase text-[10px] text-primary/80 tracking-wider">State/Region</FormLabel>
                          <FormControl><Input className="bg-background/50 border-primary/20 font-mono text-sm" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                    )} />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField control={form.control} name="country" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-mono uppercase text-[10px] text-primary/80 tracking-wider">Country</FormLabel>
                          <FormControl><Input className="bg-background/50 border-primary/20 font-mono text-sm" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                    )} />
                    <FormField control={form.control} name="postalCode" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-mono uppercase text-[10px] text-primary/80 tracking-wider">Postal Code</FormLabel>
                          <FormControl><Input className="bg-background/50 border-primary/20 font-mono text-sm tracking-widest" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                    )} />
                  </div>
                </div>

                <div className="bg-destructive/10 border border-destructive/30 p-4 flex items-start gap-3">
                  <ShieldAlert className="w-5 h-5 text-destructive mt-0.5" />
                  <p className="text-xs text-foreground/80 font-sans leading-relaxed">
                    By transmitting this data, you consent to background checks and database cross-referencing in accordance with federal and international arms control regulations. Falsifying this information is a felony.
                  </p>
                </div>

                <Button type="submit" className="w-full font-mono uppercase tracking-wider bg-primary/20 text-primary border border-primary/50 hover:bg-primary hover:text-primary-foreground shadow-[0_0_15px_rgba(0,212,255,0.2)] h-12" disabled={submitMutation.isPending}>
                  {submitMutation.isPending ? "Transmitting..." : "Submit Credentials"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
