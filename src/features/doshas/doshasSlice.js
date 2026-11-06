import { createSlice } from '@reduxjs/toolkit'
import {
  fetchDoshasThunk,
  fetchDoshaByIdThunk,
  createDoshaThunk,
  updateDoshaThunk,
  toggleDoshaStatusThunk,
  deleteDoshaThunk,
} from './doshasApi'

const initialState = {
  doshas: [],
  currentDosha: null,
  pagination: {
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 1,
  },
  metrics: {
    total: 0,
    published: 0,
    drafts: 0,
  },
  loadingList: false,
  loadingDosha: false,
  isSubmitting: false,
  togglingId: null,
  deletingId: null,
  error: null,
}

const doshasSlice = createSlice({
  name: 'doshas',
  initialState,
  reducers: {
    clearDoshasError: (state) => {
      state.error = null
    },
    clearCurrentDosha: (state) => {
      state.currentDosha = null
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchDoshasThunk
      .addCase(fetchDoshasThunk.pending, (state) => {
        state.loadingList = true
        state.error = null
      })
      .addCase(fetchDoshasThunk.fulfilled, (state, action) => {
        state.loadingList = false
        state.doshas = action.payload?.doshas || []
        if (action.payload?.pagination) {
          state.pagination = action.payload.pagination
        }
        if (action.payload?.metrics) {
          state.metrics = action.payload.metrics
        }
      })
      .addCase(fetchDoshasThunk.rejected, (state, action) => {
        state.loadingList = false
        state.error = action.payload
      })

      // fetchDoshaByIdThunk
      .addCase(fetchDoshaByIdThunk.pending, (state) => {
        state.loadingDosha = true
        state.error = null
      })
      .addCase(fetchDoshaByIdThunk.fulfilled, (state, action) => {
        state.loadingDosha = false
        state.currentDosha = action.payload
      })
      .addCase(fetchDoshaByIdThunk.rejected, (state, action) => {
        state.loadingDosha = false
        state.error = action.payload
      })

      // createDoshaThunk
      .addCase(createDoshaThunk.pending, (state) => {
        state.isSubmitting = true
        state.error = null
      })
      .addCase(createDoshaThunk.fulfilled, (state, action) => {
        state.isSubmitting = false
        if (action.payload) {
          state.doshas.unshift(action.payload)
          state.metrics.total += 1
          if (action.payload.status === 'published' && action.payload.is_active) {
            state.metrics.published += 1
          } else if (action.payload.status === 'draft') {
            state.metrics.drafts += 1
          }
        }
      })
      .addCase(createDoshaThunk.rejected, (state, action) => {
        state.isSubmitting = false
        state.error = action.payload
      })

      // updateDoshaThunk
      .addCase(updateDoshaThunk.pending, (state) => {
        state.isSubmitting = true
        state.error = null
      })
      .addCase(updateDoshaThunk.fulfilled, (state, action) => {
        state.isSubmitting = false
        const updated = action.payload
        if (updated) {
          const idx = state.doshas.findIndex((d) => d.id === updated.id)
          if (idx !== -1) {
            state.doshas[idx] = updated
          }
          if (state.currentDosha?.id === updated.id) {
            state.currentDosha = updated
          }
        }
      })
      .addCase(updateDoshaThunk.rejected, (state, action) => {
        state.isSubmitting = false
        state.error = action.payload
      })

      // toggleDoshaStatusThunk
      .addCase(toggleDoshaStatusThunk.pending, (state, action) => {
        state.togglingId = action.meta.arg.id
      })
      .addCase(toggleDoshaStatusThunk.fulfilled, (state, action) => {
        state.togglingId = null
        const { id, is_active, status } = action.payload || {}
        const dosha = state.doshas.find((d) => d.id === id)
        if (dosha) {
          if (typeof is_active === 'boolean') dosha.is_active = is_active
          if (status) dosha.status = status
        }
        if (state.currentDosha?.id === id) {
          if (typeof is_active === 'boolean') state.currentDosha.is_active = is_active
          if (status) state.currentDosha.status = status
        }
      })
      .addCase(toggleDoshaStatusThunk.rejected, (state, action) => {
        state.togglingId = null
        state.error = action.payload
      })

      // deleteDoshaThunk
      .addCase(deleteDoshaThunk.pending, (state, action) => {
        state.deletingId = action.meta.arg
      })
      .addCase(deleteDoshaThunk.fulfilled, (state, action) => {
        state.deletingId = null
        state.doshas = state.doshas.filter((d) => d.id !== action.payload.id)
        state.pagination.total = Math.max(0, state.pagination.total - 1)
        state.metrics.total = Math.max(0, state.metrics.total - 1)
      })
      .addCase(deleteDoshaThunk.rejected, (state, action) => {
        state.deletingId = null
        state.error = action.payload
      })
  },
})

export const { clearDoshasError, clearCurrentDosha } = doshasSlice.actions
export default doshasSlice.reducer
