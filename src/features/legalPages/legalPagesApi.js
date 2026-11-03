import { createAsyncThunk } from '@reduxjs/toolkit'
import api from '@/lib/api'

/**
 * 13.1 List All Legal Pages
 * GET /api/v1/admin/legal-pages
 */
export const fetchLegalPagesThunk = createAsyncThunk(
  'legalPages/fetchList',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/legal-pages')
      return response.data.data?.legalPages || response.data.data || []
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        'Failed to load legal pages.'
      return rejectWithValue(message)
    }
  }
)

/**
 * 13.2 Get Single Legal Page by Slug
 * GET /api/v1/admin/legal-pages/:slug
 */
export const fetchLegalPageBySlugThunk = createAsyncThunk(
  'legalPages/fetchBySlug',
  async (slug, { rejectWithValue }) => {
    try {
      const response = await api.get(`/legal-pages/${slug}`)
      return response.data.data?.legalPage || response.data.data
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        `Failed to load legal page "${slug}".`
      return rejectWithValue(message)
    }
  }
)

/**
 * 13.3 Update Legal Page by Slug
 * PUT /api/v1/admin/legal-pages/:slug
 */
export const updateLegalPageThunk = createAsyncThunk(
  'legalPages/updateBySlug',
  async ({ slug, payload }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/legal-pages/${slug}`, payload)
      return response.data.data?.legalPage || response.data.data
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        `Failed to update legal page "${slug}".`
      return rejectWithValue(message)
    }
  }
)
