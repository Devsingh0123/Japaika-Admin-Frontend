import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Cell,
  CartesianGrid,
  Tooltip,
  LabelList,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Briefcase,
  HeartHandshake,
  Heart,
  Coins,
  Activity,
  MessageSquare,
  Sparkles,
  Compass,
} from 'lucide-react'

const TOPIC_CONFIG = {
  career: {
    label: 'Career',
    color: '#6366f1',
    icon: Briefcase,
  },
  marriage: {
    label: 'Marriage',
    color: '#10b981',
    icon: HeartHandshake,
  },
  love: {
    label: 'Love',
    color: '#f43f5e',
    icon: Heart,
  },
  wealth: {
    label: 'Wealth',
    color: '#f59e0b',
    icon: Coins,
  },
  health: {
    label: 'Health',
    color: '#0ea5e9',
    icon: Activity,
  },
  general: {
    label: 'General',
    color: '#64748b',
    icon: MessageSquare,
  },
}

function getTopicConfig(rawTopic) {
  const key = String(rawTopic || 'general').toLowerCase()
  return TOPIC_CONFIG[key] || TOPIC_CONFIG.general
}

function CustomTopicTooltip({ active, payload }) {
  if (!active || !payload || !payload.length) return null

  const data = payload[0].payload
  const Icon = data.icon

  return (
    <div className="rounded-xl border border-border/80 bg-popover/95 p-3.5 shadow-2xl backdrop-blur-md text-popover-foreground min-w-[170px] space-y-2">
      <div className="flex items-center justify-between border-b border-border/50 pb-1.5 text-xs text-muted-foreground">
        <span className="font-semibold text-foreground flex items-center gap-1.5">
          {Icon && <Icon className="size-3.5" style={{ color: data.color }} />}
          {data.topic}
        </span>
        <span className="text-[10px] font-mono font-bold" style={{ color: data.color }}>
          {data.percentage}%
        </span>
      </div>

      <div className="space-y-1 text-xs">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Inquiries:</span>
          <span className="font-mono font-bold text-foreground">
            {data.count} {data.count === 1 ? 'inquiry' : 'inquiries'}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Share of Total:</span>
          <span className="font-mono font-semibold text-foreground">
            {data.percentage}%
          </span>
        </div>
      </div>
    </div>
  )
}

export function QuestionTopicStats({
  topics = [],
  totalQuestions = 0,
  loading = false,
}) {
  if (loading && (!topics || topics.length === 0)) {
    return (
      <Card className="border-border/60 bg-card/60 backdrop-blur-sm shadow-xs h-full flex flex-col justify-between">
        <CardHeader className="space-y-2">
          <Skeleton className="h-6 w-44" />
          <Skeleton className="h-4 w-60" />
        </CardHeader>
        <CardContent className="pt-2">
          <Skeleton className="h-[320px] w-full rounded-xl" />
        </CardContent>
      </Card>
    )
  }

  const chartData = topics.map((t) => {
    const config = getTopicConfig(t.topic)
    const pct = Math.min(100, Math.max(0, Number(t.percentage) || 0))
    return {
      topic: config.label,
      rawKey: t.topic,
      count: Number(t.count) || 0,
      percentage: pct.toFixed(1),
      percentageLabel: `${pct.toFixed(1)}%`,
      color: config.color,
      icon: config.icon,
    }
  })

  return (
    <Card className="border-border/60 bg-card/60 backdrop-blur-sm shadow-xs h-full flex flex-col justify-between overflow-hidden">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-4">
        <div>
          <CardTitle className="text-lg font-bold tracking-tight text-foreground flex items-center gap-2">
            <Compass className="size-5 text-primary" />
            Inquiry Topics
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground mt-0.5">
            User questions by astrological consultation domain
          </CardDescription>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-xs font-semibold text-primary self-start sm:self-auto">
          <Sparkles className="size-3.5" />
          <span>{totalQuestions} Inquiries</span>
        </div>
      </CardHeader>

      <CardContent className="pt-6 flex-1 flex flex-col justify-center">
        {topics.length === 0 || totalQuestions === 0 ? (
          <div className="flex flex-col items-center justify-center h-[320px] text-center space-y-2 text-muted-foreground">
            <div className="size-10 rounded-xl bg-muted/60 flex items-center justify-center text-muted-foreground">
              <MessageSquare className="size-5" />
            </div>
            <p className="text-xs font-semibold text-foreground">
              No inquiries recorded yet
            </p>
            <p className="text-[11px] max-w-xs">
              Questions asked to Jyotish &amp; Shastra AI engines will appear here automatically.
            </p>
          </div>
        ) : (
          <div className="h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={chartData}
                margin={{ top: 5, right: 48, left: 0, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  horizontal={false}
                  stroke="currentColor"
                  className="stroke-border/40"
                />

                <XAxis
                  type="number"
                  stroke="currentColor"
                  className="text-muted-foreground text-xs"
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                />

                <YAxis
                  type="category"
                  dataKey="topic"
                  stroke="currentColor"
                  className="text-foreground text-xs font-medium"
                  tickLine={false}
                  axisLine={false}
                  width={68}
                />

                <Tooltip content={<CustomTopicTooltip />} />

                <Bar
                  dataKey="count"
                  radius={[0, 6, 6, 0]}
                  maxBarSize={22}
                  animationDuration={600}
                >
                  {chartData.map((entry) => (
                    <Cell key={entry.rawKey} fill={entry.color} />
                  ))}
                  <LabelList
                    dataKey="percentageLabel"
                    position="right"
                    className="text-[11px] font-mono font-bold fill-foreground"
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
