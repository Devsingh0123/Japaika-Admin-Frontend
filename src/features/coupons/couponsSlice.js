import { createSlice } from '@reduxjs/toolkit'
import {
  fetchCouponsThunk,
  createCouponThunk,
  updateCouponThunk,
  toggleCouponStatusThunk,
  toggleCouponVisibilityThunk,
  toggleCouponSpecialOfferThunk,
  fetchActiveSpecialOfferThunk,
  deleteCouponThunk,
} from './couponsApi'

const couponsSlice = createSlice({
  name: 'coupons',
  initialState: {
    coupons: [],
    activeSpecialOffer: null,
    loadingList: false,
    loadingSpecialOffer: false,
    isSubmitting: false,
    togglingId: null,
    togglingVisibilityId: null,
    togglingSpecialOfferId: null,
    deletingId: null,
    error: null,
  },
  reducers: {
    clearCouponsError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCouponsThunk.pending, (state) => {
        state.loadingList = true
        state.error = null
      })
      .addCase(fetchCouponsThunk.fulfilled, (state, action) => {
        state.loadingList = false
        state.coupons = action.payload
      })
      .addCase(fetchCouponsThunk.rejected, (state, action) => {
        state.loadingList = false
        state.error = action.payload
      })

      .addCase(createCouponThunk.pending, (state) => {
        state.isSubmitting = true
        state.error = null
      })
      .addCase(createCouponThunk.fulfilled, (state, action) => {
        state.isSubmitting = false
        state.coupons.unshift(action.payload)
      })
      .addCase(createCouponThunk.rejected, (state, action) => {
        state.isSubmitting = false
        state.error = action.payload
      })

      .addCase(updateCouponThunk.pending, (state) => {
        state.isSubmitting = true
        state.error = null
      })
      .addCase(updateCouponThunk.fulfilled, (state, action) => {
        state.isSubmitting = false
        const index = state.coupons.findIndex((c) => c.id === action.payload.id)
        if (index !== -1) {
          state.coupons[index] = action.payload
        }
      })
      .addCase(updateCouponThunk.rejected, (state, action) => {
        state.isSubmitting = false
        state.error = action.payload
      })

      .addCase(toggleCouponStatusThunk.pending, (state, action) => {
        state.togglingId = action.meta.arg.id
      })
      .addCase(toggleCouponStatusThunk.fulfilled, (state, action) => {
        state.togglingId = null
        const coupon = state.coupons.find((c) => c.id === action.payload.id)
        if (coupon) {
          coupon.is_active = action.payload.is_active
        }
      })
      .addCase(toggleCouponStatusThunk.rejected, (state, action) => {
        state.togglingId = null
        state.error = action.payload
      })

      .addCase(toggleCouponVisibilityThunk.pending, (state, action) => {
        state.togglingVisibilityId = action.meta.arg.id
      })
      .addCase(toggleCouponVisibilityThunk.fulfilled, (state, action) => {
        state.togglingVisibilityId = null
        const coupon = state.coupons.find((c) => c.id === action.payload.id)
        if (coupon) {
          coupon.is_hidden = action.payload.is_hidden
          if (action.payload.share_url) {
            coupon.share_url = action.payload.share_url
          }
        }
      })
      .addCase(toggleCouponVisibilityThunk.rejected, (state, action) => {
        state.togglingVisibilityId = null
        state.error = action.payload
      })

      .addCase(toggleCouponSpecialOfferThunk.pending, (state, action) => {
        state.togglingSpecialOfferId = action.meta.arg.id
      })
      .addCase(toggleCouponSpecialOfferThunk.fulfilled, (state, action) => {
        state.togglingSpecialOfferId = null
        const coupon = state.coupons.find((c) => c.id === action.payload.id)
        if (coupon) {
          coupon.is_special_offer = action.payload.is_special_offer
          if (action.payload.share_url) {
            coupon.share_url = action.payload.share_url
          }
        }
        if (action.payload.is_special_offer) {
          state.activeSpecialOffer = {
            ...(coupon || {}),
            ...action.payload,
          }
        } else if (state.activeSpecialOffer?.id === action.payload.id) {
          state.activeSpecialOffer = null
        }
      })
      .addCase(toggleCouponSpecialOfferThunk.rejected, (state, action) => {
        state.togglingSpecialOfferId = null
        state.error = action.payload
      })

      .addCase(fetchActiveSpecialOfferThunk.pending, (state) => {
        state.loadingSpecialOffer = true
      })
      .addCase(fetchActiveSpecialOfferThunk.fulfilled, (state, action) => {
        state.loadingSpecialOffer = false
        state.activeSpecialOffer = action.payload
      })
      .addCase(fetchActiveSpecialOfferThunk.rejected, (state) => {
        state.loadingSpecialOffer = false
      })

      .addCase(deleteCouponThunk.pending, (state, action) => {
        state.deletingId = action.meta.arg
      })
      .addCase(deleteCouponThunk.fulfilled, (state, action) => {
        state.deletingId = null
        state.coupons = state.coupons.filter((c) => c.id !== action.payload.id)
      })
      .addCase(deleteCouponThunk.rejected, (state, action) => {
        state.deletingId = null
        state.error = action.payload
      })
  },
})

export const { clearCouponsError } = couponsSlice.actions
export default couponsSlice.reducer
