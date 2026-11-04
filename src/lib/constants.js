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
