import { useEffect, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  fetchDashboardAllThunk,
  fetchRevenueChartThunk,
} from '@/features/dashboard/dashboardApi'
import {
  setChartDays,
  clearDashboardErrors,
} from '@/features/dashboard/dashboardSlice'
import { MetricCards } from '@/components/dashboard/MetricCards'
import { RevenueAreaChart } from '@/components/dashboard/RevenueAreaChart'
import { QuestionTopicStats } from '@/components/dashboard/QuestionTopicStats'
import { Button } from '@/components/ui/button'
import {
  LayoutDashboard,
  RefreshCw,
  AlertCircle,
  ShieldCheck,
  Zap,
  Globe2,
} from 'lucide-react'

export function DashboardPage() {
  const dispatch = useDispatch()
  const {
    metrics,
    loadingMetrics,
    metricsError,

    chartData,
    chartDays,
    loadingChart,
    chartError,

    topics,
    totalQuestions,
    loadingTopics,
    topicsError,

    refreshing,
  } = useSelector((state) => state.dashboard)

  const loadAll = useCallback(() => {
    dispatch(fetchDashboardAllThunk(chartDays))
  }, [dispatch, chartDays])

  useEffect(() => {
    loadAll()
  }, [loadAll])

  const handleDaysChange = (days) => {
    dispatch(setChartDays(days))
    dispatch(fetchRevenueChartThunk(days))
  }

  const anyError = metricsError || chartError || topicsError

  return (
    <div className="space-y-7">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <LayoutDashboard className="size-7 text-primary" />
            Executive Dashboard
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Real-time telemetry, paid transaction velocity, and platform user growth.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={loadAll}
            disabled={refreshing}
            className="gap-2 h-9.5 px-4 rounded-xl border-border/70 hover:bg-muted font-medium"
          >
            <RefreshCw
              className={`size-3.5 ${refreshing ? 'animate-spin text-primary' : ''}`}
            />
            <span>Refresh</span>
          </Button>
        </div>
      </div>

      {/* Error Banner */}
      {anyError && (
        <div className="p-4 rounded-2xl border border-rose-500/20 bg-rose-500/10 text-rose-600 dark:text-rose-400 text-sm flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="size-4 shrink-0" />
            <span>{anyError}</span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={loadAll}
              className="border-rose-500/30 text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 h-8 rounded-lg"
            >
              Retry
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => dispatch(clearDashboardErrors())}
              className="text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 h-8 rounded-lg"
            >
              Dismiss
            </Button>
          </div>
        </div>
      )}

      {/* Top Metric Cards */}
      <MetricCards metrics={metrics} loading={loadingMetrics} />

      {/* Analytics Grid: Revenue Area Chart (2 Cols) + Inquiry Topics Bar Chart (1 Col) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-stretch">
        <div className="lg:col-span-2 flex flex-col">
          <RevenueAreaChart
            chartData={chartData}
            chartDays={chartDays}
            onDaysChange={handleDaysChange}
            loading={loadingChart}
          />
        </div>
        <div className="lg:col-span-1 flex flex-col">
          <QuestionTopicStats
            topics={topics}
            totalQuestions={totalQuestions}
            loading={loadingTopics}
          />
        </div>
      </div>

      {/* Platform Telemetry & System Health Footer */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 pt-1">
        <div className="p-5 rounded-2xl border border-border/60 bg-card/60 backdrop-blur-sm shadow-xs flex items-center gap-3.5">
          <div className="size-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20">
            <ShieldCheck className="size-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-foreground uppercase tracking-wider">
              Razorpay India Gateway
            </p>
            <p className="text-[11px] text-muted-foreground flex items-center gap-1.5 mt-1 font-medium">
              <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
              Live &amp; Webhook Active
            </p>
          </div>
        </div>

        <div className="p-5 rounded-2xl border border-border/60 bg-card/60 backdrop-blur-sm shadow-xs flex items-center gap-3.5">
          <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
            <Zap className="size-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-foreground uppercase tracking-wider">
              Vedic Astrology Engine
            </p>
            <p className="text-[11px] text-muted-foreground flex items-center gap-1.5 mt-1 font-medium">
              <span className="size-2 rounded-full bg-primary" />
              Using Japaika Algorithmic Engine
            </p>
          </div>
        </div>

        <div className="p-5 rounded-2xl border border-border/60 bg-card/60 backdrop-blur-sm shadow-xs flex items-center gap-3.5">
          <div className="size-10 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center border border-sky-500/20">
            <Globe2 className="size-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-foreground uppercase tracking-wider">
              Multi-Currency Billing
            </p>
            <p className="text-[11px] text-muted-foreground flex items-center gap-1.5 mt-1 font-medium">
              <span className="size-2 rounded-full bg-sky-500" />
              INR • USD
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardPage
