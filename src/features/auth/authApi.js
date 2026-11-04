import { createAsyncThunk } from '@reduxjs/toolkit'
import api from '@/lib/api'
import { STORAGE_KEYS, parseArray } from '@/lib/constants'

const isAdminRole = (role) => ['admin', 'super_admin'].includes(role)

const normalizeAdmin = (admin) =>
  admin ? { ...admin, permissions: parseArray(admin.permissions) } : null

export const loginAdminThunk = createAsyncThunk(
  'auth/loginAdmin',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/auth/login', { email, password })
      const { admin, accessToken, refreshToken } = data.data

      if (!admin || !isAdminRole(admin.role)) {
        return rejectWithValue(
          'Access denied: Account does not have administrator privileges.'
        )
      }

      const normalized = normalizeAdmin(admin)
      localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken)
      localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken)
      localStorage.setItem(STORAGE_KEYS.ADMIN_USER, JSON.stringify(normalized))

      return normalized
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          'Failed to sign in. Please verify your administrator credentials.'
      )
    }
  }
)

export const fetchAdminMeThunk = createAsyncThunk(
  'auth/fetchAdminMe',
  async (_, { rejectWithValue }) => {
    const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN)
    if (!token) return null

    try {
      const { data } = await api.get('/auth/me')
      const { admin } = data.data

      if (!admin || !isAdminRole(admin.role)) {
        localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN)
        localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN)
        localStorage.removeItem(STORAGE_KEYS.ADMIN_USER)
        return rejectWithValue('Unauthorized administrator session.')
      }

      const normalized = normalizeAdmin(admin)
      localStorage.setItem(STORAGE_KEYS.ADMIN_USER, JSON.stringify(normalized))
      return normalized
    } catch (error) {
      if (error.response?.status === 401 || error.response?.status === 403) {
        localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN)
        localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN)
        localStorage.removeItem(STORAGE_KEYS.ADMIN_USER)
      }
      return rejectWithValue(
        error.response?.data?.message || 'Session expired. Please sign in again.'
      )
    }
  }
)

export const logoutAdminThunk = createAsyncThunk('auth/logoutAdmin', async () => {
  localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN)
  localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN)
  localStorage.removeItem(STORAGE_KEYS.ADMIN_USER)
  return null
})

export const updateAdminProfileThunk = createAsyncThunk(
  'auth/updateAdminProfile',
  async ({ name, avatar_url }, { getState, rejectWithValue }) => {
    try {
      const { data } = await api.patch('/auth/profile', { name, avatar_url })
      const merged = { ...getState().auth.admin, ...data.data.admin }
      localStorage.setItem(STORAGE_KEYS.ADMIN_USER, JSON.stringify(merged))
      return merged
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          'Failed to update administrator profile.'
      )
    }
  }
)

export const changeAdminPasswordThunk = createAsyncThunk(
  'auth/changeAdminPassword',
  async ({ current_password, new_password }, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/auth/change-password', {
        current_password,
        new_password,
      })
      return data
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          'Failed to change administrator password.'
      )
    }
  }
)

export const fetchSystemStatusThunk = createAsyncThunk(
  'auth/fetchSystemStatus',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/auth/system-status')
      return data.data
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          'Failed to fetch system status diagnostics.'
      )
    }
  }
)
