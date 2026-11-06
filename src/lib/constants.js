export const API_BASE_URL =
  import.meta.env.VITE_ADMIN_API_BASE_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  'http://localhost:5001/api/v1/admin'

export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'japaika_admin_access_token',
  REFRESH_TOKEN: 'japaika_admin_refresh_token',
  ADMIN_USER: 'japaika_admin_user',
  THEME: 'japaika_admin_theme',
}

export const PERMISSION_MODULES = [
  { key: 'dashboard', label: 'Dashboard', actions: ['read'] },
  { key: 'users', label: 'Users', actions: ['read', 'write'] },
  { key: 'orders', label: 'Orders', actions: ['read', 'write'] },
  { key: 'coupons', label: 'Coupons', actions: ['read', 'write'] },
  { key: 'question_packs', label: 'Question Packs', actions: ['read', 'write'] },
  { key: 'report_packs', label: 'Report Packs', actions: ['read', 'write'] },
  { key: 'blogs', label: 'Blogs', actions: ['read', 'write'] },
  { key: 'doshas', label: 'Vedic Doshas', actions: ['read', 'write'] },
  { key: 'faqs', label: 'FAQs', actions: ['read', 'write'] },
  { key: 'legal_pages', label: 'Legal Pages', actions: ['read', 'write'] },
  { key: 'chats', label: 'AI Chats', actions: ['read'] },
  { key: 'admins', label: 'Staff Admins', actions: ['read'] },
]

export const NAV_ITEMS = [
  {
    title: 'Dashboard',
    path: '/',
    icon: 'LayoutDashboard',
    permission: 'dashboard:read',
  },
  {
    title: 'Users',
    path: '/users',
    icon: 'Users',
    permission: 'users:read',
  },
  {
    title: 'Orders',
    path: '/orders',
    icon: 'Receipt',
    permission: 'orders:read',
  },
  {
    title: 'Coupons',
    path: '/coupons',
    icon: 'Tag',
    permission: 'coupons:read',
  },
  {
    title: 'Question Packs',
    path: '/question-packs',
    icon: 'Package',
    permission: 'question_packs:read',
  },
  {
    title: 'Report Packs',
    path: '/report-packs',
    icon: 'FileText',
    permission: 'report_packs:read',
  },
  {
    title: 'Blogs',
    path: '/blogs',
    icon: 'BookOpen',
    permission: 'blogs:read',
  },
  {
    title: 'Vedic Doshas',
    path: '/doshas',
    icon: 'Sparkles',
    permission: 'doshas:read',
  },
  {
    title: 'FAQs',
    path: '/faqs',
    icon: 'HelpCircle',
    permission: 'faqs:read',
  },
  {
    title: 'Legal Pages',
    path: '/legal-pages',
    icon: 'Scale',
    permission: 'legal_pages:read',
  },
  {
    title: 'AI Chats',
    path: '/chats',
    icon: 'MessageSquare',
    permission: 'chats:read',
  },
  {
    title: 'Staff Admins',
    path: '/admins',
    icon: 'ShieldCheck',
    permission: 'admins:read',
  },
  {
    title: 'Settings',
    path: '/settings',
    icon: 'Settings',
    permission: null,
  },
]

export function parseArray(val) {
  if (Array.isArray(val)) return val
  if (typeof val === 'string') {
    try {
      const parsed = JSON.parse(val)
      return Array.isArray(parsed) ? parsed : []
    } catch {
      return []
    }
  }
  return []
}

export function hasPermission(admin, requiredPerm) {
  if (!requiredPerm) return true
  if (!admin) return false
  if (admin.role === 'super_admin') return true

  const perms = parseArray(admin.permissions)
  if (perms.includes(requiredPerm)) return true

  if (requiredPerm.endsWith(':read')) {
    const moduleKey = requiredPerm.split(':')[0]
    return perms.includes(`${moduleKey}:write`)
  }

  return false
}

export const DOSHA_CATEGORIES = [
  { id: 'marriage', label: 'Marriage & Relationship' },
  { id: 'planetary', label: 'Planetary Combinations' },
  { id: 'karmic', label: 'Karmic & Ancestral' },
  { id: 'nakshatra', label: 'Nakshatra & Birth Star' },
  { id: 'general', label: 'General Afflictions' },
]

export const DOSHA_SEVERITIES = [
  { id: 'low', label: 'Low', badgeColor: 'border-slate-400/40 text-slate-700 dark:text-slate-300 bg-slate-500/10' },
  { id: 'medium', label: 'Medium', badgeColor: 'border-amber-500/40 text-amber-600 dark:text-amber-400 bg-amber-500/10' },
  { id: 'high', label: 'High', badgeColor: 'border-orange-500/40 text-orange-600 dark:text-orange-400 bg-orange-500/10' },
  { id: 'severe', label: 'Severe', badgeColor: 'border-rose-500/40 text-rose-600 dark:text-rose-400 bg-rose-500/10' },
]

export const DOSHA_STATUSES = [
  { id: 'draft', label: 'Draft' },
  { id: 'published', label: 'Published' },
  { id: 'archived', label: 'Archived' },
]

export const ALL_PLANETS = [
  'Sun',
  'Moon',
  'Mars',
  'Mercury',
  'Jupiter',
  'Venus',
  'Saturn',
  'Rahu',
  'Ketu',
]

export const ALL_HOUSES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]

export const REMEDY_TYPES = [
  { id: 'mantra', label: 'Mantra Recitation' },
  { id: 'puja', label: 'Puja & Vedic Ritual' },
  { id: 'gemstone', label: 'Gemstone & Ratna' },
  { id: 'donation', label: 'Charity & Daan' },
  { id: 'fasting', label: 'Fasting & Vrat' },
  { id: 'deity', label: 'Deity Worship' },
  { id: 'rudraksha', label: 'Rudraksha' },
  { id: 'lifestyle', label: 'Lifestyle & Guidance' },
]
