import { createAsyncThunk } from '@reduxjs/toolkit'
import api from '@/lib/api'

export const fetchCouponsThunk = createAsyncThunk(
  'coupons/fetchCoupons',
  async ({ search = '', is_active, is_hidden } = {}, { rejectWithValue }) => {
    try {
      const params = {}
      if (search.trim()) params.search = search.trim()
      if (is_active && is_active !== 'all') params.is_active = is_active
      if (is_hidden && is_hidden !== 'all') params.is_hidden = is_hidden

      const { data } = await api.get('/coupons', { params })
      return data.data.coupons
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch coupons.'
      )
    }
  }
)

export const createCouponThunk = createAsyncThunk(
  'coupons/createCoupon',
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/coupons', payload)
      return data.data.coupon
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to create coupon.'
      )
    }
  }
)

export const updateCouponThunk = createAsyncThunk(
  'coupons/updateCoupon',
  async ({ id, payload }, { rejectWithValue }) => {
    try {
      const { data } = await api.patch(`/coupons/${id}`, payload)
      return data.data.coupon
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to update coupon.'
      )
    }
  }
)

export const toggleCouponStatusThunk = createAsyncThunk(
  'coupons/toggleStatus',
  async ({ id, is_active }, { rejectWithValue }) => {
    try {
      const { data } = await api.patch(`/coupons/${id}/status`, { is_active })
      return data.data
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to update coupon status.'
      )
    }
  }
)

export const toggleCouponVisibilityThunk = createAsyncThunk(
  'coupons/toggleVisibility',
  async ({ id, is_hidden }, { rejectWithValue }) => {
    try {
      const payload = typeof is_hidden === 'boolean' ? { is_hidden } : {}
      const { data } = await api.patch(`/coupons/${id}/visibility`, payload)
      return data.data
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to update coupon visibility.'
      )
    }
  }
)

export const deleteCouponThunk = createAsyncThunk(
  'coupons/deleteCoupon',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await api.delete(`/coupons/${id}`)
      return data.data
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to delete coupon.'
      )
    }
  }
)
