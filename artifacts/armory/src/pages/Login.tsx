import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Shield } from "lucide-react";
import { useLogin, getGetMeQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export default function Login() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const loginMutation = useLogin();

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = (values: z.infer<typeof loginSchema>) => {
    loginMutation.mutate({ data: values }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetMeQueryKey() });
        toast({ title: "Authentication Successful", description: "Clearance granted." });
        setLocation("/");
      },
      onError: (err) => {
        toast({ title: "Authentication Failed", description: err.error || "Invalid credentials", variant: "destructive" });
      }
    });
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh]">
      <Card className="w-full max-w-md bg-card/80 backdrop-blur-xl border-primary/20 shadow-[0_0_30px_rgba(0,212,255,0.05)]">
        <CardHeader className="space-y-1 items-center">
          <Shield className="w-12 h-12 text-primary mb-2 shadow-primary drop-shadow-[0_0_10px_rgba(0,212,255,0.5)]" />
          <CardTitle className="text-2xl font-mono uppercase tracking-widest text-primary">Authenticate</CardTitle>
          <CardDescription className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
            Enter operative credentials
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-mono uppercase text-xs text-primary/80 tracking-wider">Communication Link (Email)</FormLabel>
                    <FormControl>
                      <Input placeholder="operative@armorx.com" className="bg-background/50 border-primary/20 focus-visible:border-primary font-mono text-sm" {...field} />
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
                      <Input type="password" placeholder="••••••••" className="bg-background/50 border-primary/20 focus-visible:border-primary font-mono text-sm tracking-widest" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full font-mono uppercase tracking-wider bg-primary/20 text-primary border border-primary/50 hover:bg-primary hover:text-primary-foreground mt-6 shadow-[0_0_15px_rgba(0,212,255,0.2)]" disabled={loginMutation.isPending}>
                {loginMutation.isPending ? "Verifying..." : "Establish Connection"}
              </Button>
            </form>
          </Form>
          <div className="mt-6 text-center text-sm">
            <span className="text-muted-foreground font-mono text-xs uppercase">Unregistered operative? </span>
            <Link href="/register" className="text-primary hover:underline font-mono text-xs uppercase tracking-wider">Request Clearance</Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
