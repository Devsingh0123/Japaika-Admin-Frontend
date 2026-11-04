import { createAsyncThunk } from '@reduxjs/toolkit'
import api from '@/lib/api'

export const fetchAdminsThunk = createAsyncThunk(
  'admins/fetchAdmins',
  async (params = {}, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/admins', { params })
      return data.data
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch staff administrators.'
      )
    }
  }
)

export const fetchPermissionsThunk = createAsyncThunk(
  'admins/fetchPermissions',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/admins/permissions')
      return data.data.permissions
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch permissions.'
      )
    }
  }
)

export const createAdminThunk = createAsyncThunk(
  'admins/createAdmin',
  async (adminData, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/admins', adminData)
      return data.data.admin
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          'Failed to create administrator account.'
      )
    }
  }
)

export const updateAdminRoleThunk = createAsyncThunk(
  'admins/updateAdminRole',
  async ({ id, role }, { rejectWithValue }) => {
    try {
      const { data } = await api.patch(`/admins/${id}/role`, { role })
      return data.data.admin
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to update administrator role.'
      )
    }
  }
)

export const updateAdminPermissionsThunk = createAsyncThunk(
  'admins/updateAdminPermissions',
  async ({ id, permissions }, { rejectWithValue }) => {
    try {
      const { data } = await api.patch(`/admins/${id}/permissions`, {
        permissions,
      })
      return data.data.admin
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          'Failed to update administrator permissions.'
      )
    }
  }
)

export const updateAdminStatusThunk = createAsyncThunk(
  'admins/updateAdminStatus',
  async ({ id, is_blocked }, { rejectWithValue }) => {
    try {
      const { data } = await api.patch(`/admins/${id}/status`, { is_blocked })
      return data.data.admin
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          'Failed to update administrator status.'
      )
    }
  }
)

export const deleteAdminThunk = createAsyncThunk(
  'admins/deleteAdmin',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await api.delete(`/admins/${id}`)
      return data.data
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          'Failed to delete administrator account.'
      )
    }
  }
)
