import { useGetDashboardSummary, useGetSalesTrend, useGetCategoryBreakdown } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Package, Users, AlertTriangle } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

export default function Dashboard() {
  const { data: summary } = useGetDashboardSummary();
  const { data: salesTrend } = useGetSalesTrend();
  
  if (!summary) return <div className="p-10 font-mono text-primary animate-pulse text-center">Loading Telemetry...</div>;

  const stats = [
    { title: "Revenue", value: `$${summary.totalRevenue.toLocaleString()}`, icon: DollarSign, trend: summary.revenueGrowth },
    { title: "Orders", value: summary.totalOrders.toString(), icon: Package, trend: summary.orderGrowth },
    { title: "Users", value: summary.totalUsers.toString(), icon: Users, trend: summary.userGrowth },
    { title: "Pending Clearance", value: summary.pendingKyc.toString(), icon: AlertTriangle, trend: null, warning: true },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-mono font-bold uppercase tracking-widest text-primary">Command Center</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <Card key={i} className={`bg-card/40 backdrop-blur-sm border-primary/20 rounded-none ${stat.warning ? 'border-amber-500/50 bg-amber-500/5' : ''}`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className={`font-mono text-xs uppercase ${stat.warning ? 'text-amber-500' : 'text-muted-foreground'}`}>
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.warning ? 'text-amber-500' : 'text-primary'}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-mono font-bold">{stat.value}</div>
              {stat.trend !== null && (
                <p className={`text-xs font-mono mt-1 ${stat.trend >= 0 ? 'text-green-500' : 'text-destructive'}`}>
                  {stat.trend >= 0 ? '+' : ''}{stat.trend}% from last cycle
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <Card className="bg-card/40 backdrop-blur-sm border-primary/20 rounded-none col-span-1 lg:col-span-2">
          <CardHeader>
            <CardTitle className="font-mono text-sm uppercase tracking-widest text-primary border-b border-primary/20 pb-2">Revenue Telemetry</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            {salesTrend && salesTrend.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={salesTrend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(195, 100%, 50%)" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(195, 100%, 50%)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--primary)/0.1)" vertical={false} />
                  <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={10} tickFormatter={(val) => new Date(val).toLocaleDateString(undefined, {month:'short', day:'numeric'})} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={10} tickFormatter={(val) => `$${val}`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--primary)/0.5)', fontFamily: 'monospace', fontSize: '12px' }}
                    itemStyle={{ color: 'hsl(var(--primary))' }}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorRevenue)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center font-mono text-xs text-muted-foreground uppercase">Insufficient Data</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
