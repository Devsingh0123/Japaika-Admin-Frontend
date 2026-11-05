import { createSlice } from '@reduxjs/toolkit'
import {
  fetchDashboardMetricsThunk,
  fetchRevenueChartThunk,
  fetchQuestionTopicsThunk,
  fetchDashboardAllThunk,
} from './dashboardApi'

const initialState = {
  // 1. KPI Summary Cards
  metrics: null,
  loadingMetrics: false,
  metricsError: null,

  // 2. Revenue Time-Series Chart
  chartData: [],
  chartDays: 7,
  loadingChart: false,
  chartError: null,

  // 3. User Question Topic Analytics
  topics: [],
  totalQuestions: 0,
  loadingTopics: false,
  topicsError: null,

  // Global refresh state
  refreshing: false,
}

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    setChartDays: (state, action) => {
      state.chartDays = action.payload
    },
    clearDashboardErrors: (state) => {
      state.metricsError = null
      state.chartError = null
      state.topicsError = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Coordinated All
      .addCase(fetchDashboardAllThunk.pending, (state) => {
        state.refreshing = true
      })
      .addCase(fetchDashboardAllThunk.fulfilled, (state) => {
        state.refreshing = false
      })
      .addCase(fetchDashboardAllThunk.rejected, (state) => {
        state.refreshing = false
      })

      // KPI Metrics
      .addCase(fetchDashboardMetricsThunk.pending, (state) => {
        state.loadingMetrics = true
        state.metricsError = null
      })
      .addCase(fetchDashboardMetricsThunk.fulfilled, (state, action) => {
        state.loadingMetrics = false
        state.metrics = action.payload
      })
      .addCase(fetchDashboardMetricsThunk.rejected, (state, action) => {
        state.loadingMetrics = false
        state.metricsError = action.payload
      })

      // Revenue Chart
      .addCase(fetchRevenueChartThunk.pending, (state) => {
        state.loadingChart = true
        state.chartError = null
      })
      .addCase(fetchRevenueChartThunk.fulfilled, (state, action) => {
        state.loadingChart = false
        state.chartData = action.payload?.chartData || []
        if (action.payload?.days) {
          state.chartDays = action.payload.days
        }
      })
      .addCase(fetchRevenueChartThunk.rejected, (state, action) => {
        state.loadingChart = false
        state.chartError = action.payload
      })

      // Question Topics
      .addCase(fetchQuestionTopicsThunk.pending, (state) => {
        state.loadingTopics = true
        state.topicsError = null
      })
      .addCase(fetchQuestionTopicsThunk.fulfilled, (state, action) => {
        state.loadingTopics = false
        state.topics = action.payload?.topics || []
        state.totalQuestions = action.payload?.totalQuestions || 0
      })
      .addCase(fetchQuestionTopicsThunk.rejected, (state, action) => {
        state.loadingTopics = false
        state.topicsError = action.payload
      })
  },
})

export const { setChartDays, clearDashboardErrors } = dashboardSlice.actions
export default dashboardSlice.reducer
