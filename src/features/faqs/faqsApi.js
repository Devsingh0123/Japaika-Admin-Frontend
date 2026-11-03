import { createAsyncThunk } from '@reduxjs/toolkit'
import api from '@/lib/api'

/**
 * 12.1 List All FAQs
 * GET /api/v1/admin/faqs?category=...&is_active=...
 */
export const fetchFaqsThunk = createAsyncThunk(
  'faqs/fetchList',
  async ({ category = 'all', is_active = 'all' } = {}, { rejectWithValue }) => {
    try {
      const params = {}
      if (category && category !== 'all') {
        params.category = category
      }
      if (is_active !== undefined && is_active !== 'all' && is_active !== '') {
        params.is_active = String(is_active)
      }

      const response = await api.get('/faqs', { params })
      return response.data.data
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        'Failed to load FAQs.'
      return rejectWithValue(message)
    }
  }
)

/**
 * 12.2 Get Single FAQ Details
 * GET /api/v1/admin/faqs/:id
 */
export const fetchFaqByIdThunk = createAsyncThunk(
  'faqs/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/faqs/${id}`)
      return response.data.data?.faq || response.data.data
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        'Failed to load FAQ details.'
      return rejectWithValue(message)
    }
  }
)

/**
 * 12.3 Create New FAQ
 * POST /api/v1/admin/faqs
 */
export const createFaqThunk = createAsyncThunk(
  'faqs/create',
  async (payload, { rejectWithValue }) => {
    try {
      const response = await api.post('/faqs', payload)
      return response.data.data?.faq || response.data.data
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        'Failed to create FAQ.'
      return rejectWithValue(message)
    }
  }
)

/**
 * 12.4 Update FAQ
 * PATCH /api/v1/admin/faqs/:id
 */
export const updateFaqThunk = createAsyncThunk(
  'faqs/update',
  async ({ id, payload }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/faqs/${id}`, payload)
      return response.data.data?.faq || response.data.data
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        'Failed to update FAQ.'
      return rejectWithValue(message)
    }
  }
)

/**
 * 12.5 Delete FAQ
 * DELETE /api/v1/admin/faqs/:id
 */
export const deleteFaqThunk = createAsyncThunk(
  'faqs/delete',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/faqs/${id}`)
      return { id, ...(response.data.data || {}) }
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        'Failed to delete FAQ.'
      return rejectWithValue(message)
    }
  }
)
