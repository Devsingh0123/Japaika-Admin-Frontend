import { useEffect, useState, useCallback, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchFaqsThunk, updateFaqThunk } from '@/features/faqs/faqsApi'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Skeleton } from '@/components/ui/skeleton'
import { FaqModal } from '@/components/faqs/FaqModal'
import { DeleteFaqDialog } from '@/components/faqs/DeleteFaqDialog'
import {
  HelpCircle,
  Plus,
  Search,
  RefreshCw,
  Edit2,
  Trash2,
  CheckCircle2,
  EyeOff,
  Layers,
  LayoutList,
  BookOpenCheck,
  ChevronDown,
  ChevronUp,
  ArrowUp,
  ArrowDown,
  Calendar,
} from 'lucide-react'
import { toast } from 'sonner'

const STATUS_FILTERS = [
  { label: 'All FAQs', value: 'all' },
  { label: 'Active', value: 'true' },
  { label: 'Hidden', value: 'false' },
]

const DEFAULT_CATEGORIES = [
  { id: 'all', label: 'All Categories' },
  { id: 'general', label: 'General' },
  { id: 'billing', label: 'Billing & Payments' },
  { id: 'reports', label: 'Reports & Kundli' },
  { id: 'horoscope', label: 'Horoscope & Charts' },
  { id: 'account', label: 'Account & Privacy' },
]

function formatFaqDate(dateStr) {
  if (!dateStr) return '—'
  const date = new Date(dateStr)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function formatCategoryLabel(category) {
  if (!category) return 'General'
  const found = DEFAULT_CATEGORIES.find(
    (c) => c.id === category.toLowerCase()
  )
  if (found && found.id !== 'all') return found.label
  return category.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())
}

export function FaqsPage() {
  const dispatch = useDispatch()
  const { faqs, loadingList, togglingId } = useSelector((state) => state.faqs)

  const [searchInput, setSearchInput] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [viewMode, setViewMode] = useState('table') // 'table' | 'accordion'
  const [expandedIds, setExpandedIds] = useState({})

  // Modal states
  const [modalOpen, setModalOpen] = useState(false)
  const [faqToEdit, setFaqToEdit] = useState(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [faqToDelete, setFaqToDelete] = useState(null)

  const loadFaqs = useCallback(() => {
    dispatch(
      fetchFaqsThunk({
        category: categoryFilter,
        is_active: statusFilter,
      })
    )
  }, [dispatch, categoryFilter, statusFilter])

  useEffect(() => {
    loadFaqs()
  }, [loadFaqs])

  const faqList = useMemo(() => (Array.isArray(faqs) ? faqs : []), [faqs])

  // Merge preset categories with any custom categories returned by backend
  const categoryOptions = useMemo(() => {
    const map = new Map(DEFAULT_CATEGORIES.map((c) => [c.id, c.label]))
    faqList.forEach((f) => {
      const cat = (f.category || 'general').toLowerCase()
      if (!map.has(cat)) {
        map.set(cat, formatCategoryLabel(cat))
      }
    })
    return Array.from(map.entries()).map(([id, label]) => ({ id, label }))
  }, [faqList])

  // Client-side search filtering over loaded FAQs
  const filteredFaqs = useMemo(() => {
    const q = searchInput.trim().toLowerCase()
    if (!q) return faqList
    return faqList.filter(
      (f) =>
        (f.question && f.question.toLowerCase().includes(q)) ||
        (f.answer && f.answer.toLowerCase().includes(q)) ||
        (f.category && f.category.toLowerCase().includes(q))
    )
  }, [faqList, searchInput])

  // Grouped FAQs for Accordion Preview mode
  const groupedByCategory = useMemo(() => {
    const groups = {}
    filteredFaqs.forEach((faq) => {
      const cat = (faq.category || 'general').toLowerCase()
      if (!groups[cat]) {
        groups[cat] = []
      }
      groups[cat].push(faq)
    })
    return Object.entries(groups)
  }, [filteredFaqs])

  // KPI metrics
  const totalCount = faqList.length
  const activeCount = faqList.filter((f) => Boolean(f.is_active)).length
  const hiddenCount = totalCount - activeCount
  const distinctCategoriesCount = new Set(
    faqList.map((f) => (f.category || 'general').toLowerCase())
  ).size

  const nextSortOrder = useMemo(() => {
    if (faqList.length === 0) return 1
    const maxOrder = Math.max(
      ...faqList.map((f) => Number(f.sort_order) || 0)
    )
    return maxOrder + 1
  }, [faqList])

  const handleOpenCreate = () => {
    setFaqToEdit(null)
    setModalOpen(true)
  }

  const handleOpenEdit = (faq) => {
    setFaqToEdit(faq)
    setModalOpen(true)
  }

  const handleOpenDelete = (faq) => {
    setFaqToDelete(faq)
    setDeleteDialogOpen(true)
  }

  const handleToggleActive = async (faq) => {
    const nextActive = !faq.is_active
    const result = await dispatch(
      updateFaqThunk({
        id: faq.id,
        payload: { is_active: nextActive },
      })
    )
    if (updateFaqThunk.fulfilled.match(result)) {
      toast.success(
        nextActive
          ? 'FAQ published and visible to users.'
          : 'FAQ hidden from public view.'
      )
    } else {
      toast.error(result.payload || 'Failed to update FAQ visibility.')
    }
  }

  const handleNudgeSortOrder = async (faq, delta) => {
    const currentOrder = Number(faq.sort_order ?? 1)
    const nextOrder = Math.max(0, currentOrder + delta)
    if (nextOrder === currentOrder) return

    const result = await dispatch(
      updateFaqThunk({
        id: faq.id,
        payload: { sort_order: nextOrder },
      })
    )
    if (updateFaqThunk.fulfilled.match(result)) {
      toast.success(`Sort order updated to #${nextOrder}.`)
    } else {
      toast.error(result.payload || 'Failed to update sort order.')
    }
  }

  const toggleExpandItem = (id) => {
    setExpandedIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }))
  }

  return (
    <div className="space-y-7">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <HelpCircle className="size-7 text-primary" aria-hidden="true" />
            FAQs Management
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Curate frequently asked questions, organize help center categories,
            and control public display priority.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={loadFaqs}
            disabled={loadingList}
            className="gap-2 h-9.5 px-4 rounded-xl border-border/70 hover:bg-muted font-medium"
          >
            <RefreshCw
              className={`size-3.5 ${loadingList ? 'animate-spin' : ''}`}
              aria-hidden="true"
            />
            Refresh
          </Button>

          <Button
            size="sm"
            onClick={handleOpenCreate}
            className="gap-2 h-9.5 px-4 rounded-xl shadow-xs font-semibold"
          >
            <Plus className="size-4" aria-hidden="true" />
            Create FAQ
          </Button>
        </div>
      </div>

      {/* KPI Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="p-5 rounded-2xl border border-border/60 bg-card/60 backdrop-blur-sm shadow-xs space-y-1.5">
          <div className="flex items-center justify-between text-xs text-muted-foreground font-semibold uppercase tracking-wider">
            <span>Total FAQs</span>
            <div className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <HelpCircle className="size-4" aria-hidden="true" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-foreground font-mono">
            {totalCount}
          </p>
          <p className="text-xs text-muted-foreground">Help center entries</p>
        </div>

        <div className="p-5 rounded-2xl border border-border/60 bg-card/60 backdrop-blur-sm shadow-xs space-y-1.5">
          <div className="flex items-center justify-between text-xs text-muted-foreground font-semibold uppercase tracking-wider">
            <span>Published (Active)</span>
            <div className="size-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="size-4" aria-hidden="true" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-emerald-600 dark:text-emerald-400 font-mono">
            {activeCount}
          </p>
          <p className="text-xs text-muted-foreground">Live on user platform</p>
        </div>

        <div className="p-5 rounded-2xl border border-border/60 bg-card/60 backdrop-blur-sm shadow-xs space-y-1.5">
          <div className="flex items-center justify-between text-xs text-muted-foreground font-semibold uppercase tracking-wider">
            <span>Hidden / Drafts</span>
            <div className="size-8 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <EyeOff className="size-4" aria-hidden="true" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-amber-600 dark:text-amber-400 font-mono">
            {hiddenCount}
          </p>
          <p className="text-xs text-muted-foreground">Unpublished entries</p>
        </div>

        <div className="p-5 rounded-2xl border border-border/60 bg-card/60 backdrop-blur-sm shadow-xs space-y-1.5">
          <div className="flex items-center justify-between text-xs text-muted-foreground font-semibold uppercase tracking-wider">
            <span>Categories</span>
            <div className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <Layers className="size-4" aria-hidden="true" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-foreground font-mono">
            {distinctCategoriesCount}
          </p>
          <p className="text-xs text-muted-foreground">Topic groupings</p>
        </div>
      </div>

      {/* Filter, Search & View Mode Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-4 rounded-2xl border border-border/60 bg-card/50 backdrop-blur-sm">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search
            className="size-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
            aria-hidden="true"
          />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search questions, answers, or categories..."
            aria-label="Search FAQs"
            className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl bg-background/80 border border-border/70 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-foreground placeholder:text-muted-foreground"
          />
        </div>

        {/* Filters & View Switcher */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Category Filter Dropdown */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            aria-label="Filter by FAQ category"
            className="h-9 rounded-xl border border-border/70 bg-card px-3 text-xs text-foreground outline-none focus:ring-1 focus:ring-primary"
          >
            {categoryOptions.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>

          {/* Status Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto">
            {STATUS_FILTERS.map((f) => (
              <button
                key={f.value}
                type="button"
                onClick={() => setStatusFilter(f.value)}
                aria-pressed={statusFilter === f.value}
                className={`px-3 py-1.5 text-xs rounded-xl font-medium transition-colors ${
                  statusFilter === f.value
                    ? 'bg-primary text-primary-foreground shadow-xs font-semibold'
                    : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* View Mode Toggle (Table vs Accordion Preview) */}
          <div className="flex items-center rounded-xl border border-border/70 bg-background/60 p-0.5">
            <button
              type="button"
              onClick={() => setViewMode('table')}
              aria-pressed={viewMode === 'table'}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                viewMode === 'table'
                  ? 'bg-primary/15 text-primary font-semibold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              title="Structured Table View"
            >
              <LayoutList className="size-3.5" aria-hidden="true" />
              <span>Table</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('accordion')}
              aria-pressed={viewMode === 'accordion'}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                viewMode === 'accordion'
                  ? 'bg-primary/15 text-primary font-semibold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              title="Interactive Accordion Preview"
            >
              <BookOpenCheck className="size-3.5" aria-hidden="true" />
              <span>Accordion</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area: Table View vs Accordion Preview */}
      {viewMode === 'table' ? (
        <div className="rounded-2xl border border-border/60 bg-card/80 backdrop-blur-sm overflow-hidden shadow-xs">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-border/60 bg-muted/20">
                <TableHead className="w-[100px] font-semibold text-xs text-foreground uppercase tracking-wider">
                  Order
                </TableHead>
                <TableHead className="font-semibold text-xs text-foreground uppercase tracking-wider">
                  Question & Answer
                </TableHead>
                <TableHead className="w-[150px] font-semibold text-xs text-foreground uppercase tracking-wider">
                  Category
                </TableHead>
                <TableHead className="w-[130px] font-semibold text-xs text-foreground uppercase tracking-wider">
                  Updated
                </TableHead>
                <TableHead className="w-[130px] text-center font-semibold text-xs text-foreground uppercase tracking-wider">
                  Visibility
                </TableHead>
                <TableHead className="w-[110px] text-right font-semibold text-xs text-foreground uppercase tracking-wider">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loadingList ? (
                Array.from({ length: 5 }).map((_, idx) => (
                  <TableRow key={idx}>
                    <TableCell>
                      <Skeleton className="h-6 w-12 rounded-lg" />
                    </TableCell>
                    <TableCell>
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-72" />
                        <Skeleton className="h-3 w-96" />
                      </div>
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-24 rounded-lg" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-20" />
                    </TableCell>
                    <TableCell className="text-center">
                      <Skeleton className="h-5 w-14 mx-auto rounded-full" />
                    </TableCell>
                    <TableCell className="text-right">
                      <Skeleton className="h-8 w-18 ml-auto rounded-lg" />
                    </TableCell>
                  </TableRow>
                ))
              ) : filteredFaqs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-48 text-center">
                    <div className="flex flex-col items-center justify-center gap-2.5 text-muted-foreground">
                      <HelpCircle
                        className="size-8 opacity-40"
                        aria-hidden="true"
                      />
                      <p className="text-sm font-semibold text-foreground">
                        No FAQs found
                      </p>
                      <p className="text-xs max-w-sm">
                        {searchInput ||
                        categoryFilter !== 'all' ||
                        statusFilter !== 'all'
                          ? 'No FAQ entries match your current search or filter criteria.'
                          : 'Get started by creating your first Frequently Asked Question.'}
                      </p>
                      <Button
                        size="sm"
                        onClick={handleOpenCreate}
                        className="mt-1 rounded-xl gap-1.5"
                      >
                        <Plus className="size-4" aria-hidden="true" />
                        Create First FAQ
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredFaqs.map((faq) => {
                  const isToggling = togglingId === faq.id
                  const isExpanded = Boolean(expandedIds[faq.id])
                  return (
                    <TableRow
                      key={faq.id}
                      className="hover:bg-muted/30 transition-colors border-border/40 align-top"
                    >
                      {/* Sort Order + Quick Nudge Buttons */}
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <span className="inline-flex h-7 min-w-8 items-center justify-center rounded-lg border border-border/60 bg-muted/40 px-2 font-mono text-xs font-semibold text-foreground">
                            #{faq.sort_order ?? 1}
                          </span>
                          <div className="flex flex-col">
                            <button
                              type="button"
                              disabled={isToggling || (faq.sort_order ?? 1) <= 0}
                              onClick={() => handleNudgeSortOrder(faq, -1)}
                              className="p-0.5 text-muted-foreground hover:text-primary disabled:opacity-30 transition-colors"
                              title="Move up (decrease sort_order)"
                              aria-label={`Decrease sort order for ${faq.question}`}
                            >
                              <ArrowUp className="size-3" />
                            </button>
                            <button
                              type="button"
                              disabled={isToggling}
                              onClick={() => handleNudgeSortOrder(faq, 1)}
                              className="p-0.5 text-muted-foreground hover:text-primary disabled:opacity-30 transition-colors"
                              title="Move down (increase sort_order)"
                              aria-label={`Increase sort order for ${faq.question}`}
                            >
                              <ArrowDown className="size-3" />
                            </button>
                          </div>
                        </div>
                      </TableCell>

                      {/* Question & Answer */}
                      <TableCell className="max-w-xl">
                        <div className="space-y-1">
                          <button
                            type="button"
                            onClick={() => toggleExpandItem(faq.id)}
                            aria-expanded={isExpanded}
                            className="text-left group flex items-start gap-2 w-full focus:outline-none"
                          >
                            <span className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors leading-snug">
                              {faq.question}
                            </span>
                            {faq.answer && faq.answer.length > 140 && (
                              <span className="mt-0.5 text-muted-foreground shrink-0">
                                {isExpanded ? (
                                  <ChevronUp className="size-3.5" />
                                ) : (
                                  <ChevronDown className="size-3.5" />
                                )}
                              </span>
                            )}
                          </button>
                          <p
                            className={`text-xs text-muted-foreground leading-relaxed whitespace-pre-line ${
                              isExpanded ? '' : 'line-clamp-2'
                            }`}
                          >
                            {faq.answer}
                          </p>
                        </div>
                      </TableCell>

                      {/* Category */}
                      <TableCell>
                        <Badge
                          variant="outline"
                          className="rounded-lg bg-muted/40 border-border/60 px-2.5 py-0.5 text-xs font-medium text-foreground capitalize"
                        >
                          {formatCategoryLabel(faq.category)}
                        </Badge>
                      </TableCell>

                      {/* Updated Date */}
                      <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Calendar
                            className="size-3.5 text-muted-foreground/70"
                            aria-hidden="true"
                          />
                          <span>
                            {formatFaqDate(faq.updated_at || faq.created_at)}
                          </span>
                        </div>
                      </TableCell>

                      {/* Visibility Switch */}
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Switch
                            checked={Boolean(faq.is_active)}
                            onCheckedChange={() => handleToggleActive(faq)}
                            disabled={isToggling}
                            aria-label={`Toggle active status for ${faq.question}`}
                            className="data-[state=checked]:bg-emerald-500"
                          />
                          <span
                            className={`text-xs font-medium w-12 text-left ${
                              faq.is_active
                                ? 'text-emerald-600 dark:text-emerald-400'
                                : 'text-muted-foreground'
                            }`}
                          >
                            {faq.is_active ? 'Active' : 'Hidden'}
                          </span>
                        </div>
                      </TableCell>

                      {/* Edit & Delete Actions */}
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="outline"
                            size="icon-sm"
                            onClick={() => handleOpenEdit(faq)}
                            className="size-8 rounded-lg border-border/70 text-muted-foreground hover:text-primary hover:border-primary/40"
                            title="Edit FAQ"
                            aria-label={`Edit FAQ: ${faq.question}`}
                          >
                            <Edit2 className="size-3.5" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon-sm"
                            onClick={() => handleOpenDelete(faq)}
                            className="size-8 rounded-lg border-border/70 text-muted-foreground hover:text-destructive hover:border-destructive/40"
                            title="Delete FAQ"
                            aria-label={`Delete FAQ: ${faq.question}`}
                          >
                            <Trash2 className="size-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </div>
      ) : (
        /* Interactive Accordion Preview Mode Grouped by Category */
        <div className="space-y-6">
          {groupedByCategory.length === 0 ? (
            <div className="rounded-2xl border border-border/60 bg-card/80 p-12 text-center space-y-2">
              <HelpCircle
                className="size-8 text-muted-foreground/40 mx-auto"
                aria-hidden="true"
              />
              <p className="text-sm font-semibold text-foreground">
                No FAQs to preview
              </p>
              <p className="text-xs text-muted-foreground">
                Adjust your filters or add a new FAQ entry above.
              </p>
            </div>
          ) : (
            groupedByCategory.map(([catKey, items]) => (
              <div
                key={catKey}
                className="rounded-2xl border border-border/60 bg-card/80 backdrop-blur-sm overflow-hidden shadow-xs"
              >
                <div className="flex items-center justify-between px-6 py-3.5 border-b border-border/50 bg-muted/25">
                  <div className="flex items-center gap-2">
                    <Layers
                      className="size-4 text-primary"
                      aria-hidden="true"
                    />
                    <h2 className="text-sm font-bold tracking-tight text-foreground">
                      {formatCategoryLabel(catKey)}
                    </h2>
                  </div>
                  <Badge variant="outline" className="font-mono text-[11px]">
                    {items.length} {items.length === 1 ? 'item' : 'items'}
                  </Badge>
                </div>

                <div className="divide-y divide-border/50">
                  {items.map((faq) => {
                    const isOpen = Boolean(expandedIds[faq.id])
                    return (
                      <div
                        key={faq.id}
                        className="p-5 transition-colors hover:bg-muted/20"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <button
                            type="button"
                            onClick={() => toggleExpandItem(faq.id)}
                            aria-expanded={isOpen}
                            className="flex-1 text-left flex items-start gap-3 focus:outline-none group"
                          >
                            <span className="mt-0.5 inline-flex h-6 min-w-7 items-center justify-center rounded-md bg-primary/10 px-1.5 font-mono text-xs font-bold text-primary shrink-0">
                              #{faq.sort_order ?? 1}
                            </span>
                            <div className="space-y-1 flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                                  {faq.question}
                                </span>
                                {!faq.is_active && (
                                  <Badge
                                    variant="outline"
                                    className="text-[10px] border-amber-500/40 text-amber-600 dark:text-amber-400 bg-amber-500/10"
                                  >
                                    Hidden
                                  </Badge>
                                )}
                              </div>
                              {isOpen && (
                                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed pt-2 whitespace-pre-line">
                                  {faq.answer}
                                </p>
                              )}
                            </div>
                          </button>

                          <div className="flex items-center gap-1.5 shrink-0">
                            <Button
                              variant="ghost"
                              size="icon-xs"
                              onClick={() => toggleExpandItem(faq.id)}
                              aria-label={
                                isOpen ? 'Collapse answer' : 'Expand answer'
                              }
                            >
                              {isOpen ? (
                                <ChevronUp className="size-4 text-muted-foreground" />
                              ) : (
                                <ChevronDown className="size-4 text-muted-foreground" />
                              )}
                            </Button>
                            <Button
                              variant="outline"
                              size="icon-xs"
                              onClick={() => handleOpenEdit(faq)}
                              title="Edit FAQ"
                              aria-label={`Edit FAQ: ${faq.question}`}
                            >
                              <Edit2 className="size-3.5" />
                            </Button>
                            <Button
                              variant="outline"
                              size="icon-xs"
                              onClick={() => handleOpenDelete(faq)}
                              className="hover:text-destructive"
                              title="Delete FAQ"
                              aria-label={`Delete FAQ: ${faq.question}`}
                            >
                              <Trash2 className="size-3.5" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Create / Edit FAQ Modal (key resets form state cleanly without useEffect setState) */}
      <FaqModal
        key={
          faqToEdit
            ? `edit-${faqToEdit.id}-${faqToEdit.updated_at || ''}`
            : `create-${modalOpen}-${nextSortOrder}`
        }
        open={modalOpen}
        onOpenChange={setModalOpen}
        faqToEdit={faqToEdit}
        defaultSortOrder={nextSortOrder}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteFaqDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        faq={faqToDelete}
      />
    </div>
  )
}

export default FaqsPage
