import { Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ShieldAlert, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { useRegister, getGetMeQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

const registerSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  dateOfBirth: z.string().min(10, "Date of birth is required"),
  agreedToTerms: z.boolean().refine(val => val === true, "You must agree to the terms"),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passcodes do not match",
  path: ["confirmPassword"],
});

export default function Register() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const registerMutation = useRegister();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const form = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      firstName: "",
      lastName: "",
      dateOfBirth: "",
      agreedToTerms: false,
    },
  });

  const onSubmit = (values: z.infer<typeof registerSchema>) => {
    const { confirmPassword: _, ...payload } = values;
    registerMutation.mutate({ data: payload }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetMeQueryKey() });
        toast({ title: "Registration Successful", description: "Identity registered. Awaiting KYC." });
        setLocation("/kyc");
      },
      onError: (err) => {
        toast({ title: "Registration Failed", description: (err.data as any)?.message || "Failed to register", variant: "destructive" });
      }
    });
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh] py-8">
      <Card className="w-full max-w-lg bg-card/80 backdrop-blur-xl border-primary/20 shadow-[0_0_30px_rgba(0,212,255,0.05)]">
        <CardHeader className="space-y-1 items-center">
          <ShieldAlert className="w-12 h-12 text-primary mb-2 shadow-primary drop-shadow-[0_0_10px_rgba(0,212,255,0.5)]" />
          <CardTitle className="text-2xl font-mono uppercase tracking-widest text-primary">Initialize Profile</CardTitle>
          <CardDescription className="font-mono text-xs uppercase tracking-wider text-muted-foreground text-center">
            Provide identity details for baseline clearance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-mono uppercase text-xs text-primary/80 tracking-wider">First Name</FormLabel>
                      <FormControl>
                        <Input className="bg-background/50 border-primary/20 focus-visible:border-primary font-mono text-sm" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-mono uppercase text-xs text-primary/80 tracking-wider">Last Name</FormLabel>
                      <FormControl>
                        <Input className="bg-background/50 border-primary/20 focus-visible:border-primary font-mono text-sm" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-mono uppercase text-xs text-primary/80 tracking-wider">Communication Link (Email)</FormLabel>
                    <FormControl>
                      <Input type="email" autoComplete="email" placeholder="operative@armorx.com" className="bg-background/50 border-primary/20 focus-visible:border-primary font-mono text-sm" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-mono uppercase text-xs text-primary/80 tracking-wider">Passcode</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          autoComplete="new-password"
                          placeholder="••••••••"
                          className="bg-background/50 border-primary/20 focus-visible:border-primary font-mono text-sm tracking-widest pr-10"
                          {...field}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(v => !v)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-mono uppercase text-xs text-primary/80 tracking-wider">Confirm Passcode</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showConfirm ? "text" : "password"}
                          autoComplete="new-password"
                          placeholder="••••••••"
                          className="bg-background/50 border-primary/20 focus-visible:border-primary font-mono text-sm tracking-widest pr-10"
                          {...field}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirm(v => !v)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dateOfBirth"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-mono uppercase text-xs text-primary/80 tracking-wider">Date of Birth</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        max={new Date(new Date().setFullYear(new Date().getFullYear() - 21)).toISOString().split('T')[0]}
                        className="bg-background/50 border-primary/20 focus-visible:border-primary font-mono text-sm"
                        {...field}
                      />
                    </FormControl>
                    <p className="text-[10px] font-mono text-muted-foreground uppercase mt-1">Must be 21 years or older</p>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="agreedToTerms"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border border-primary/20 p-4 bg-background/30 mt-6">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                        I confirm I am of legal age and agree to the strict compliance terms and conditions.
                      </FormLabel>
                    </div>
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full font-mono uppercase tracking-wider bg-primary/20 text-primary border border-primary/50 hover:bg-primary hover:text-primary-foreground mt-6 shadow-[0_0_15px_rgba(0,212,255,0.2)]" disabled={registerMutation.isPending}>
                {registerMutation.isPending ? "Processing..." : "Submit Profile"}
              </Button>
            </form>
          </Form>
          <div className="mt-6 text-center text-sm">
            <span className="text-muted-foreground font-mono text-xs uppercase">Existing operative? </span>
            <Link href="/login" className="text-primary hover:underline font-mono text-xs uppercase tracking-wider">Authenticate</Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
