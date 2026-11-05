import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Calendar, TrendingUp } from 'lucide-react'

const RANGE_OPTIONS = [
  { label: '7D', value: 7 },
  { label: '14D', value: 14 },
  { label: '30D', value: 30 },
  { label: '90D', value: 90 },
]

function formatCompactINR(val) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(Number(val) || 0)
}

function formatFullINR(val) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(Number(val) || 0)
}

function CustomTooltip({ active, payload }) {
  if (!active || !payload || !payload.length) return null

  const data = payload[0].payload
  return (
    <div className="rounded-xl border border-border/80 bg-popover/95 p-3.5 shadow-2xl backdrop-blur-md text-popover-foreground min-w-[170px] space-y-2">
      <div className="flex items-center justify-between border-b border-border/50 pb-1.5 text-xs text-muted-foreground">
        <span className="font-semibold text-foreground flex items-center gap-1.5">
          <Calendar className="size-3.5 text-primary" />
          {data.label}
        </span>
        <span className="text-[10px] font-mono">{data.date}</span>
      </div>

      <div className="space-y-1">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Revenue:</span>
          <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
            {formatFullINR(data.revenue)}
          </span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Paid Orders:</span>
          <span className="font-mono font-semibold text-foreground">
            {data.ordersCount} orders
          </span>
        </div>
      </div>
    </div>
  )
}

export function RevenueAreaChart({
  chartData = [],
  chartDays = 7,
  onDaysChange,
  loading = false,
}) {
  if (loading && (!chartData || chartData.length === 0)) {
    return (
      <Card className="border-border/60 bg-card/60 backdrop-blur-sm shadow-xs h-full flex flex-col justify-between">
        <CardHeader className="space-y-2">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-72" />
        </CardHeader>
        <CardContent className="pt-2">
          <Skeleton className="h-[320px] w-full rounded-xl" />
        </CardContent>
      </Card>
    )
  }

  const totalPeriodRevenue = chartData.reduce(
    (acc, d) => acc + (Number(d.revenue) || 0),
    0
  )
  const totalPeriodOrders = chartData.reduce(
    (acc, d) => acc + (Number(d.ordersCount) || 0),
    0
  )
  const avgDailyRevenue =
    chartData.length > 0 ? totalPeriodRevenue / chartData.length : 0

  return (
    <Card className="border-border/60 bg-card/60 backdrop-blur-sm shadow-xs h-full flex flex-col justify-between overflow-hidden">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-4">
        <div>
          <CardTitle className="text-lg font-bold tracking-tight text-foreground flex items-center gap-2">
            <TrendingUp className="size-5 text-emerald-500" />
            Revenue Velocity (Last {chartDays} Days)
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground mt-0.5">
            Continuous daily revenue rolling window across all completed purchases
          </CardDescription>
        </div>

        {/* Range Selector & Telemetry Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Day Range Segmented Control */}
          <div className="flex items-center rounded-xl bg-muted/60 p-0.5 border border-border/60">
            {RANGE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => onDaysChange?.(opt.value)}
                aria-pressed={chartDays === opt.value}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                  chartDays === opt.value
                    ? 'bg-background text-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs font-medium text-emerald-700 dark:text-emerald-400">
            <span className="text-[11px] text-muted-foreground uppercase font-semibold">
              {chartDays}D Volume:
            </span>
            <span className="font-mono font-bold">
              {formatFullINR(totalPeriodRevenue)}
            </span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-muted/50 border border-border/60 text-xs font-medium text-muted-foreground">
            <span className="text-[11px] uppercase font-semibold">Orders:</span>
            <span className="font-mono font-bold text-foreground">
              {totalPeriodOrders}
            </span>
          </div>

          <div className="hidden xl:flex items-center gap-1.5 px-3 py-1 rounded-lg bg-muted/50 border border-border/60 text-xs font-medium text-muted-foreground">
            <span className="text-[11px] uppercase font-semibold">
              Daily Avg:
            </span>
            <span className="font-mono font-bold text-foreground">
              {formatFullINR(avgDailyRevenue)}
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-6 flex-1 flex flex-col justify-center">
        <div className="h-[320px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
            >
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                </linearGradient>
              </defs>

              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="currentColor"
                className="stroke-border/40"
              />

              <XAxis
                dataKey="label"
                stroke="currentColor"
                className="text-muted-foreground text-xs"
                tickLine={false}
                axisLine={false}
                dy={8}
              />

              <YAxis
                stroke="currentColor"
                className="text-muted-foreground text-xs"
                tickLine={false}
                axisLine={false}
                tickFormatter={formatCompactINR}
                dx={-4}
              />

              <Tooltip content={<CustomTooltip />} />

              <Area
                type="monotone"
                dataKey="revenue"
                name="Revenue"
                stroke="#10b981"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#revenueGradient)"
                activeDot={{
                  r: 6,
                  fill: '#10b981',
                  stroke: '#ffffff',
                  strokeWidth: 2,
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
