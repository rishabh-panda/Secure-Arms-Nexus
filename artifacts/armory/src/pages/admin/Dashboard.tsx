import { useGetDashboardSummary, useGetSalesTrend, useGetCategoryBreakdown, useGetRecentActivity, useGetUserStats } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Package, Users, AlertTriangle, ShieldAlert, Box, TrendingUp, TrendingDown, Activity, UserCheck, Clock } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, Legend } from 'recharts';
import { format } from "date-fns";

function TrendBadge({ value }: { value: number | null }) {
  if (value === null) return null;
  const positive = value >= 0;
  return (
    <p className={`text-xs font-mono mt-1 flex items-center gap-1 ${positive ? 'text-green-500' : 'text-destructive'}`}>
      {positive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
      {positive ? '+' : ''}{Number(value).toFixed(1)}% from last cycle
    </p>
  );
}

export default function Dashboard() {
  const { data: summary } = useGetDashboardSummary();
  const { data: salesTrend } = useGetSalesTrend();
  const { data: categoryBreakdown } = useGetCategoryBreakdown();
  const { data: recentActivity } = useGetRecentActivity();
  const { data: userStats } = useGetUserStats();

  if (!summary) return <div className="p-10 font-mono text-primary animate-pulse text-center">Loading Telemetry...</div>;

  const kpiCards = [
    {
      title: "Revenue",
      value: `$${summary.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: DollarSign,
      trend: summary.revenueGrowth,
      color: "text-primary",
    },
    {
      title: "Orders",
      value: summary.totalOrders.toString(),
      icon: Package,
      trend: summary.orderGrowth,
      color: "text-primary",
    },
    {
      title: "Operatives",
      value: summary.totalUsers.toString(),
      icon: Users,
      trend: summary.userGrowth,
      color: "text-primary",
    },
    {
      title: "Pending Clearance",
      value: summary.pendingKyc.toString(),
      icon: AlertTriangle,
      trend: null,
      warning: true,
      color: "text-amber-500",
    },
    {
      title: "Pending Orders",
      value: summary.pendingOrders.toString(),
      icon: Clock,
      trend: null,
      warning: summary.pendingOrders > 0,
      color: summary.pendingOrders > 0 ? "text-amber-500" : "text-primary",
    },
    {
      title: "Pending Licenses",
      value: summary.pendingLicenses.toString(),
      icon: ShieldAlert,
      trend: null,
      warning: summary.pendingLicenses > 0,
      color: summary.pendingLicenses > 0 ? "text-amber-500" : "text-primary",
    },
    {
      title: "Total Products",
      value: summary.totalProducts.toString(),
      icon: Box,
      trend: null,
      color: "text-primary",
    },
    {
      title: "Low Stock",
      value: summary.lowStockProducts.toString(),
      icon: AlertTriangle,
      trend: null,
      warning: summary.lowStockProducts > 0,
      color: summary.lowStockProducts > 0 ? "text-destructive" : "text-primary",
    },
  ];

  const activityIconMap: Record<string, string> = {
    order_placed: "📦",
    kyc_submitted: "🔐",
    license_uploaded: "📄",
    user_registered: "👤",
    order_shipped: "🚚",
    compliance_alert: "⚠️",
  };

  const userStatsChartData = userStats ? [
    { name: "Verified", value: userStats.verified, color: "#00FF9D" },
    { name: "Pending", value: userStats.pendingVerification, color: "#F59E0B" },
    { name: "Guest", value: userStats.guestUsers, color: "#8B5CF6" },
  ] : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-primary/20 pb-4">
        <h1 className="text-3xl font-mono font-bold uppercase tracking-widest text-primary">Command Center</h1>
        <div className="font-mono text-xs text-muted-foreground uppercase tracking-wider">
          {format(new Date(), "MMM dd, yyyy HH:mm")}
        </div>
      </div>

      {/* KPI Cards — 4 columns */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((stat, i) => (
          <Card key={i} className={`bg-card/40 backdrop-blur-sm border-primary/20 rounded-none ${stat.warning ? 'border-amber-500/40 bg-amber-500/5' : ''}`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className={`font-mono text-xs uppercase tracking-wider ${stat.warning ? 'text-amber-500' : 'text-muted-foreground'}`}>
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-mono font-bold ${stat.color}`}>{stat.value}</div>
              <TrendBadge value={stat.trend ?? null} />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Revenue Chart — Full Width */}
      <Card className="bg-card/40 backdrop-blur-sm border-primary/20 rounded-none">
        <CardHeader>
          <CardTitle className="font-mono text-sm uppercase tracking-widest text-primary border-b border-primary/20 pb-2 flex items-center gap-2">
            <Activity className="w-4 h-4" /> Revenue Telemetry (Last 30 Days)
          </CardTitle>
        </CardHeader>
        <CardContent className="h-[260px]">
          {salesTrend && salesTrend.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesTrend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00D4FF" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#00D4FF" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,212,255,0.1)" vertical={false} />
                <XAxis dataKey="date" stroke="#666" fontSize={10} tickFormatter={(val) => format(new Date(val + 'T00:00'), "MM/dd")} />
                <YAxis stroke="#666" fontSize={10} tickFormatter={(val) => `$${val}`} />
                <Tooltip
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'rgba(0,212,255,0.3)', fontFamily: 'monospace', fontSize: '11px' }}
                  itemStyle={{ color: '#00D4FF' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#00D4FF" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center font-mono text-xs text-muted-foreground uppercase tracking-widest">No Revenue Data Available</div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Category Breakdown */}
        <Card className="bg-card/40 backdrop-blur-sm border-primary/20 rounded-none lg:col-span-2">
          <CardHeader>
            <CardTitle className="font-mono text-sm uppercase tracking-widest text-primary border-b border-primary/20 pb-2">
              Category Revenue Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[280px]">
            {categoryBreakdown && categoryBreakdown.length > 0 && categoryBreakdown.some(c => c.revenue > 0) ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryBreakdown} layout="vertical" margin={{ top: 0, right: 20, left: 80, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,212,255,0.08)" horizontal={false} />
                  <XAxis type="number" stroke="#666" fontSize={10} tickFormatter={(val) => `$${val.toLocaleString()}`} />
                  <YAxis type="category" dataKey="category" stroke="#666" fontSize={10} width={80} tick={{ fontFamily: 'monospace', fontSize: 10 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'rgba(0,212,255,0.3)', fontFamily: 'monospace', fontSize: '11px' }}
                    formatter={(value: number, name: string, props: any) => [`$${value.toLocaleString()} (${props.payload.percentage}%)`, 'Revenue']}
                  />
                  <Bar dataKey="revenue" radius={[0, 2, 2, 0]}>
                    {categoryBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} fillOpacity={0.8} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center font-mono text-xs text-muted-foreground uppercase tracking-widest">No Category Data Available</div>
            )}
          </CardContent>
        </Card>

        {/* User Stats */}
        <Card className="bg-card/40 backdrop-blur-sm border-primary/20 rounded-none">
          <CardHeader>
            <CardTitle className="font-mono text-sm uppercase tracking-widest text-primary border-b border-primary/20 pb-2 flex items-center gap-2">
              <UserCheck className="w-4 h-4" /> User Stats
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {userStats ? (
              <>
                <div className="flex items-center justify-center py-2">
                  <ResponsiveContainer width="100%" height={140}>
                    <PieChart>
                      <Pie
                        data={userStatsChartData.filter(d => d.value > 0)}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={65}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {userStatsChartData.filter(d => d.value > 0).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} fillOpacity={0.85} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'rgba(0,212,255,0.3)', fontFamily: 'monospace', fontSize: '11px' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-2">
                  {userStatsChartData.map((item) => (
                    <div key={item.name} className="flex items-center justify-between text-xs font-mono">
                      <span className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: item.color }} />
                        <span className="uppercase text-muted-foreground">{item.name}</span>
                      </span>
                      <span className="text-foreground font-bold">{item.value}</span>
                    </div>
                  ))}
                  <div className="pt-2 border-t border-primary/10 flex justify-between text-xs font-mono">
                    <span className="uppercase text-muted-foreground">Verification Rate</span>
                    <span className="text-green-500 font-bold">{userStats.verificationRate}%</span>
                  </div>
                  <div className="flex justify-between text-xs font-mono">
                    <span className="uppercase text-muted-foreground">New This Month</span>
                    <span className="text-primary font-bold">+{userStats.newThisMonth}</span>
                  </div>
                </div>
              </>
            ) : (
              <div className="h-40 flex items-center justify-center font-mono text-xs text-muted-foreground uppercase">Loading...</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="bg-card/40 backdrop-blur-sm border-primary/20 rounded-none">
        <CardHeader>
          <CardTitle className="font-mono text-sm uppercase tracking-widest text-primary border-b border-primary/20 pb-2 flex items-center gap-2">
            <Activity className="w-4 h-4" /> Recent Activity Log
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentActivity && recentActivity.length > 0 ? (
            <div className="space-y-2 max-h-72 overflow-y-auto custom-scrollbar">
              {recentActivity.map((item) => (
                <div key={item.id} className={`flex items-start gap-3 p-3 border text-xs font-mono ${item.severity === 'warning' ? 'border-amber-500/20 bg-amber-500/5' : 'border-primary/10 bg-background/30'}`}>
                  <span className="text-base leading-none mt-0.5 flex-shrink-0">{activityIconMap[item.type] ?? '📋'}</span>
                  <div className="flex-1 min-w-0">
                    <div className={`uppercase tracking-wider ${item.severity === 'warning' ? 'text-amber-500' : 'text-foreground/80'}`}>
                      {item.description}
                    </div>
                    {item.userEmail && (
                      <div className="text-muted-foreground mt-0.5 truncate">{item.userEmail}</div>
                    )}
                  </div>
                  <div className="text-muted-foreground/60 flex-shrink-0 whitespace-nowrap">
                    {format(new Date(item.timestamp), "MM/dd HH:mm")}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-24 flex items-center justify-center font-mono text-xs text-muted-foreground uppercase tracking-widest">No Activity Recorded</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
