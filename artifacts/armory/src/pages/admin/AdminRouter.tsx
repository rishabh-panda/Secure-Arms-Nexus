import { Switch, Route } from "wouter";
import { ShieldAlert } from "lucide-react";
import Dashboard from "./Dashboard";
import Orders from "./AdminOrders";
import Products from "./AdminProducts";
import Users from "./AdminUsers";
import Kyc from "./AdminKyc";

export default function AdminRouter() {
  return (
    <div className="space-y-6">
      <div className="bg-destructive/10 border border-destructive/30 p-2 flex items-center justify-center font-mono text-xs uppercase text-destructive tracking-widest">
        <ShieldAlert className="w-4 h-4 mr-2" /> Admin Override Active
      </div>
      <Switch>
        <Route path="/admin" component={Dashboard} />
        <Route path="/admin/orders" component={Orders} />
        <Route path="/admin/products" component={Products} />
        <Route path="/admin/users" component={Users} />
        <Route path="/admin/kyc" component={Kyc} />
      </Switch>
    </div>
  );
}
