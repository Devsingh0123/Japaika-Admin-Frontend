import { createSlice } from '@reduxjs/toolkit'
import {
  fetchFaqsThunk,
  fetchFaqByIdThunk,
  createFaqThunk,
  updateFaqThunk,
  deleteFaqThunk,
} from './faqsApi'

function sortFaqs(list) {
  return [...list].sort((a, b) => {
    const orderA = Number(a.sort_order ?? 999)
    const orderB = Number(b.sort_order ?? 999)
    if (orderA !== orderB) return orderA - orderB
    const dateA = new Date(a.created_at || 0).getTime()
    const dateB = new Date(b.created_at || 0).getTime()
    return dateB - dateA
  })
}

const initialState = {
  faqs: [],
  currentFaq: null,
  loadingList: false,
  loadingDetail: false,
  submitting: false,
  togglingId: null,
  deletingId: null,
  error: null,
}

const faqsSlice = createSlice({
  name: 'faqs',
  initialState,
  reducers: {
    clearFaqsError(state) {
      state.error = null
    },
    clearCurrentFaq(state) {
      state.currentFaq = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch All FAQs
      .addCase(fetchFaqsThunk.pending, (state) => {
        state.loadingList = true
        state.error = null
      })
      .addCase(fetchFaqsThunk.fulfilled, (state, action) => {
        state.loadingList = false
        const items = action.payload?.faqs || action.payload || []
        state.faqs = sortFaqs(Array.isArray(items) ? items : [])
      })
      .addCase(fetchFaqsThunk.rejected, (state, action) => {
        state.loadingList = false
        state.error = action.payload
      })

      // Fetch Single FAQ
      .addCase(fetchFaqByIdThunk.pending, (state) => {
        state.loadingDetail = true
        state.error = null
      })
      .addCase(fetchFaqByIdThunk.fulfilled, (state, action) => {
        state.loadingDetail = false
        state.currentFaq = action.payload
      })
      .addCase(fetchFaqByIdThunk.rejected, (state, action) => {
        state.loadingDetail = false
        state.error = action.payload
      })

      // Create FAQ
      .addCase(createFaqThunk.pending, (state) => {
        state.submitting = true
        state.error = null
      })
      .addCase(createFaqThunk.fulfilled, (state, action) => {
        state.submitting = false
        if (action.payload && action.payload.id) {
          state.faqs = sortFaqs([...state.faqs, action.payload])
        }
      })
      .addCase(createFaqThunk.rejected, (state, action) => {
        state.submitting = false
        state.error = action.payload
      })

      // Update FAQ
      .addCase(updateFaqThunk.pending, (state, action) => {
        state.submitting = true
        state.togglingId = action.meta.arg?.id || null
        state.error = null
      })
      .addCase(updateFaqThunk.fulfilled, (state, action) => {
        state.submitting = false
        state.togglingId = null
        const updated = action.payload
        if (updated && updated.id) {
          const idx = state.faqs.findIndex((f) => f.id === updated.id)
          if (idx !== -1) {
            state.faqs[idx] = { ...state.faqs[idx], ...updated }
            state.faqs = sortFaqs(state.faqs)
          }
          if (state.currentFaq?.id === updated.id) {
            state.currentFaq = { ...state.currentFaq, ...updated }
          }
        }
      })
      .addCase(updateFaqThunk.rejected, (state, action) => {
        state.submitting = false
        state.togglingId = null
        state.error = action.payload
      })

      // Delete FAQ
      .addCase(deleteFaqThunk.pending, (state, action) => {
        state.deletingId = action.meta.arg
        state.error = null
      })
      .addCase(deleteFaqThunk.fulfilled, (state, action) => {
        state.deletingId = null
        const deletedId = action.payload?.id || action.meta.arg
        state.faqs = state.faqs.filter((f) => f.id !== deletedId)
        if (state.currentFaq?.id === deletedId) {
          state.currentFaq = null
        }
      })
      .addCase(deleteFaqThunk.rejected, (state, action) => {
        state.deletingId = null
        state.error = action.payload
      })
  },
})

export const { clearFaqsError, clearCurrentFaq } = faqsSlice.actions
export default faqsSlice.reducer
