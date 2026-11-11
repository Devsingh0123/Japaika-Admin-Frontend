import { createAsyncThunk } from '@reduxjs/toolkit'
import api from '@/lib/api'

export const fetchUsersThunk = createAsyncThunk(
  'users/fetchUsers',
  async ({ page = 1, limit = 20, search = '' } = {}, { rejectWithValue }) => {
    try {
      const params = { page, limit }
      if (search && search.trim()) {
        params.search = search.trim()
      }
      const { data } = await api.get('/users', { params })
      return data?.data || data
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          'Failed to retrieve users list.'
      )
    }
  }
)

export const fetchUserDetailsThunk = createAsyncThunk(
  'users/fetchUserDetails',
  async (userId, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/users/${userId}`)
      return data?.data?.user || data?.data || data
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          'Failed to retrieve user details.'
      )
    }
  }
)

export const updateUserStatusThunk = createAsyncThunk(
  'users/updateUserStatus',
  async ({ id, is_blocked }, { rejectWithValue }) => {
    try {
      const { data } = await api.patch(`/users/${id}/status`, { is_blocked })
      return data?.data || { id, is_blocked }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          'Failed to update user block status.'
      )
    }
  }
)

/**
 * Adjust user credits (Question Credits `credit_balance` or Report Credits `report_credits`: add, deduct, set)
 * Also supports direct shorthand payloads (`credit_balance`, `report_credits`, `report_credit`).
 */
export const adjustUserCreditsThunk = createAsyncThunk(
  'users/adjustUserCredits',
  async (
    {
      id,
      credit_type,
      action,
      amount,
      reason,
      credit_balance,
      report_credits,
      report_credit,
    },
    { rejectWithValue }
  ) => {
    try {
      const trimmedReason = reason?.trim() || undefined
      let payload

      if (credit_type !== undefined) {
        payload = {
          credit_type,
          action,
          amount: Number(amount),
          reason: trimmedReason,
        }
      } else if (report_credit !== undefined) {
        payload = {
          report_credit: Number(report_credit),
          reason: trimmedReason,
        }
      } else if (report_credits !== undefined) {
        payload = {
          report_credits: Number(report_credits),
          reason: trimmedReason,
        }
      } else if (credit_balance !== undefined) {
        payload = {
          credit_balance: Number(credit_balance),
          reason: trimmedReason,
        }
      } else {
        payload = {
          credit_type: 'questions',
          action: action || 'add',
          amount: Number(amount),
          reason: trimmedReason,
        }
      }

      const { data } = await api.patch(`/users/${id}/credits`, payload)
      return data?.data?.user || data?.data || data
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          'Failed to adjust user credits.'
      )
    }
  }
)

/**
 * Export users data to CSV file
 */
export const exportUsersCsvThunk = createAsyncThunk(
  'users/exportUsersCsv',
  async (filters = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/users/export', {
        params: filters,
        responseType: 'blob',
      })

      const blob = new Blob([response.data], { type: 'text/csv;charset=utf-8;' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url

      const contentDisposition = response.headers?.['content-disposition']
      let filename = `japaika-users-${new Date().toISOString().split('T')[0]}.csv`
      if (contentDisposition) {
        const match = contentDisposition.match(/filename="?([^"]+)"?/)
        if (match && match[1]) filename = match[1]
      }

      link.setAttribute('download', filename)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)

      return { success: true, filename }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          'Failed to export users CSV.'
      )
    }
  }
)
