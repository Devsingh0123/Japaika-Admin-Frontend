import { createSlice } from '@reduxjs/toolkit'
import {
  fetchAdminsThunk,
  fetchPermissionsThunk,
  createAdminThunk,
  updateAdminRoleThunk,
  updateAdminPermissionsThunk,
  updateAdminStatusThunk,
  deleteAdminThunk,
} from './adminsApi'

const adminsSlice = createSlice({
  name: 'admins',
  initialState: {
    admins: [],
    availablePermissions: [],
    pagination: {
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 1,
    },
    loadingList: false,
    submitting: false,
    togglingId: null,
    deletingId: null,
    error: null,
  },
  reducers: {
    clearAdminsError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdminsThunk.pending, (state) => {
        state.loadingList = true
        state.error = null
      })
      .addCase(fetchAdminsThunk.fulfilled, (state, action) => {
        state.loadingList = false
        state.admins = action.payload.admins
        state.pagination = action.payload.pagination
      })
      .addCase(fetchAdminsThunk.rejected, (state, action) => {
        state.loadingList = false
        state.error = action.payload
      })

      .addCase(fetchPermissionsThunk.fulfilled, (state, action) => {
        state.availablePermissions = action.payload
      })

      .addCase(createAdminThunk.pending, (state) => {
        state.submitting = true
        state.error = null
      })
      .addCase(createAdminThunk.fulfilled, (state, action) => {
        state.submitting = false
        state.admins.unshift(action.payload)
        state.pagination.total += 1
      })
      .addCase(createAdminThunk.rejected, (state, action) => {
        state.submitting = false
        state.error = action.payload
      })

      .addCase(updateAdminRoleThunk.fulfilled, (state, action) => {
        const idx = state.admins.findIndex((a) => a.id === action.payload.id)
        if (idx !== -1) {
          state.admins[idx] = { ...state.admins[idx], ...action.payload }
        }
      })

      .addCase(updateAdminPermissionsThunk.pending, (state) => {
        state.submitting = true
        state.error = null
      })
      .addCase(updateAdminPermissionsThunk.fulfilled, (state, action) => {
        state.submitting = false
        const idx = state.admins.findIndex((a) => a.id === action.payload.id)
        if (idx !== -1) {
          state.admins[idx] = { ...state.admins[idx], ...action.payload }
        }
      })
      .addCase(updateAdminPermissionsThunk.rejected, (state, action) => {
        state.submitting = false
        state.error = action.payload
      })

      .addCase(updateAdminStatusThunk.pending, (state, action) => {
        state.togglingId = action.meta.arg.id
      })
      .addCase(updateAdminStatusThunk.fulfilled, (state, action) => {
        state.togglingId = null
        const idx = state.admins.findIndex((a) => a.id === action.payload.id)
        if (idx !== -1) {
          state.admins[idx] = { ...state.admins[idx], ...action.payload }
        }
      })
      .addCase(updateAdminStatusThunk.rejected, (state, action) => {
        state.togglingId = null
        state.error = action.payload
      })

      .addCase(deleteAdminThunk.pending, (state, action) => {
        state.deletingId = action.meta.arg
      })
      .addCase(deleteAdminThunk.fulfilled, (state, action) => {
        state.deletingId = null
        state.admins = state.admins.filter((a) => a.id !== action.payload.id)
        state.pagination.total = Math.max(0, state.pagination.total - 1)
      })
      .addCase(deleteAdminThunk.rejected, (state, action) => {
        state.deletingId = null
        state.error = action.payload
      })
  },
})

export const { clearAdminsError } = adminsSlice.actions
export default adminsSlice.reducer
