import { createAsyncThunk } from '@reduxjs/toolkit'
import api from '@/lib/api'

export const fetchDashboardMetricsThunk = createAsyncThunk(
  'dashboard/fetchMetrics',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/dashboard/metrics')
      return data?.data?.metrics || null
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to retrieve KPI metrics.'
      )
    }
  }
)

export const fetchRevenueChartThunk = createAsyncThunk(
  'dashboard/fetchRevenueChart',
  async (days = 7, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/dashboard/revenue-chart', {
        params: { days },
      })
      return data?.data || { days, chartData: [] }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to retrieve revenue chart data.'
      )
    }
  }
)

export const fetchQuestionTopicsThunk = createAsyncThunk(
  'dashboard/fetchQuestionTopics',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/dashboard/topics')
      return data?.data || { totalQuestions: 0, topics: [] }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to retrieve topic analytics.'
      )
    }
  }
)

export const fetchDashboardAllThunk = createAsyncThunk(
  'dashboard/fetchAll',
  async (days = 7, { dispatch }) => {
    await Promise.allSettled([
      dispatch(fetchDashboardMetricsThunk()),
      dispatch(fetchRevenueChartThunk(days)),
      dispatch(fetchQuestionTopicsThunk()),
    ])
    return true
  }
)
