import { createSlice } from '@reduxjs/toolkit'
import {
  fetchLegalPagesThunk,
  fetchLegalPageBySlugThunk,
  updateLegalPageThunk,
} from './legalPagesApi'

const initialState = {
  legalPages: [],
  currentLegalPage: null,
  loadingList: false,
  loadingDetail: false,
  savingSlug: null,
  error: null,
}

const legalPagesSlice = createSlice({
  name: 'legalPages',
  initialState,
  reducers: {
    clearLegalPagesError(state) {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // List All Legal Pages
      .addCase(fetchLegalPagesThunk.pending, (state) => {
        state.loadingList = true
        state.error = null
      })
      .addCase(fetchLegalPagesThunk.fulfilled, (state, action) => {
        state.loadingList = false
        const items = Array.isArray(action.payload) ? action.payload : []
        state.legalPages = items
        if (!state.currentLegalPage && items.length > 0) {
          state.currentLegalPage = items[0]
        } else if (state.currentLegalPage) {
          const refreshed = items.find(
            (p) => p.slug === state.currentLegalPage.slug
          )
          if (refreshed) {
            state.currentLegalPage = refreshed
          }
        }
      })
      .addCase(fetchLegalPagesThunk.rejected, (state, action) => {
        state.loadingList = false
        state.error = action.payload
      })

      // Get Single Legal Page by Slug
      .addCase(fetchLegalPageBySlugThunk.pending, (state) => {
        state.loadingDetail = true
        state.error = null
      })
      .addCase(fetchLegalPageBySlugThunk.fulfilled, (state, action) => {
        state.loadingDetail = false
        const page = action.payload
        if (page && page.slug) {
          state.currentLegalPage = page
          const idx = state.legalPages.findIndex((p) => p.slug === page.slug)
          if (idx !== -1) {
            state.legalPages[idx] = { ...state.legalPages[idx], ...page }
          } else {
            state.legalPages.push(page)
          }
        }
      })
      .addCase(fetchLegalPageBySlugThunk.rejected, (state, action) => {
        state.loadingDetail = false
        state.error = action.payload
      })

      // Update Legal Page by Slug
      .addCase(updateLegalPageThunk.pending, (state, action) => {
        state.savingSlug = action.meta.arg?.slug || null
        state.error = null
      })
      .addCase(updateLegalPageThunk.fulfilled, (state, action) => {
        state.savingSlug = null
        const updated = action.payload
        if (updated && updated.slug) {
          state.currentLegalPage = updated
          const idx = state.legalPages.findIndex((p) => p.slug === updated.slug)
          if (idx !== -1) {
            state.legalPages[idx] = { ...state.legalPages[idx], ...updated }
          } else {
            state.legalPages.push(updated)
          }
        }
      })
      .addCase(updateLegalPageThunk.rejected, (state, action) => {
        state.savingSlug = null
        state.error = action.payload
      })
  },
})

export const { clearLegalPagesError } = legalPagesSlice.actions
export default legalPagesSlice.reducer
