import { createAsyncThunk } from '@reduxjs/toolkit'
import api from '@/lib/api'

/**
 * GET /api/v1/admin/doshas
 * Retrieves paginated, filterable doshas list with summary metrics.
 */
export const fetchDoshasThunk = createAsyncThunk(
  'doshas/fetchDoshas',
  async (
    { page = 1, limit = 20, search = '', category, status, is_active } = {},
    { rejectWithValue }
  ) => {
    try {
      const params = { page, limit }
      if (search.trim()) params.search = search.trim()
      if (category && category !== 'all') params.category = category
      if (status && status !== 'all') params.status = status
      if (is_active !== undefined && is_active !== 'all' && is_active !== '') {
        params.is_active = is_active
      }

      const { data } = await api.get('/doshas', { params })
      return data.data
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          'Failed to retrieve Vedic Doshas.'
      )
    }
  }
)

/**
 * GET /api/v1/admin/doshas/:id
 * Retrieves full entity of a single Dosha.
 */
export const fetchDoshaByIdThunk = createAsyncThunk(
  'doshas/fetchDoshaById',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/doshas/${id}`)
      return data.data?.dosha
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          'Failed to retrieve Dosha details.'
      )
    }
  }
)

/**
 * POST /api/v1/admin/doshas
 * Creates a new Vedic Dosha entry.
 */
export const createDoshaThunk = createAsyncThunk(
  'doshas/createDosha',
  async (doshaData, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/doshas', doshaData)
      return data.data?.dosha
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          'Failed to create Dosha.'
      )
    }
  }
)

/**
 * PATCH /api/v1/admin/doshas/:id
 * Updates an existing Dosha entry.
 */
export const updateDoshaThunk = createAsyncThunk(
  'doshas/updateDosha',
  async ({ id, doshaData }, { rejectWithValue }) => {
    try {
      const { data } = await api.patch(`/doshas/${id}`, doshaData)
      return data.data?.dosha
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          'Failed to update Dosha.'
      )
    }
  }
)

/**
 * PATCH /api/v1/admin/doshas/:id/status
 * Toggles active or updates publishing status of a Dosha.
 */
export const toggleDoshaStatusThunk = createAsyncThunk(
  'doshas/toggleStatus',
  async ({ id, is_active, status }, { rejectWithValue }) => {
    try {
      const payload = {}
      if (typeof is_active === 'boolean') payload.is_active = is_active
      if (status) payload.status = status

      const { data } = await api.patch(`/doshas/${id}/status`, payload)
      return data.data
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          'Failed to update Dosha status.'
      )
    }
  }
)

/**
 * DELETE /api/v1/admin/doshas/:id
 * Soft deletes a Dosha.
 */
export const deleteDoshaThunk = createAsyncThunk(
  'doshas/deleteDosha',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await api.delete(`/doshas/${id}`)
      return { id, ...(data.data || {}) }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          'Failed to delete Dosha.'
      )
    }
  }
)
