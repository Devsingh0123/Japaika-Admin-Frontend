import { useEffect, useState, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import {
  fetchDoshasThunk,
  toggleDoshaStatusThunk,
} from '@/features/doshas/doshasApi'
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
import { DeleteDoshaDialog } from '@/components/doshas/DeleteDoshaDialog'
import {
  DOSHA_CATEGORIES,
  DOSHA_SEVERITIES,
  DOSHA_STATUSES,
  parseArray,
} from '@/lib/constants'
import {
  Sparkles,
  Plus,
  Search,
  RefreshCw,
  Edit2,
  Trash2,
  CheckCircle2,
  FileText,
  Filter,
  Layers,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react'
import { toast } from 'sonner'

export function DoshasPage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const { doshas, pagination, metrics, loadingList, togglingId } = useSelector(
    (state) => state.doshas
  )

  const [searchInput, setSearchInput] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [page, setPage] = useState(1)

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [doshaToDelete, setDoshaToDelete] = useState(null)

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput)
      setPage(1)
    }, 400)
    return () => clearTimeout(timer)
  }, [searchInput])

  const loadDoshas = useCallback(() => {
    dispatch(
      fetchDoshasThunk({
        page,
        limit: 20,
        search: debouncedSearch,
        category: categoryFilter,
        status: statusFilter,
      })
    )
  }, [dispatch, page, debouncedSearch, categoryFilter, statusFilter])

  useEffect(() => {
    loadDoshas()
  }, [loadDoshas])

  const handleToggleStatus = async (dosha) => {
    const nextStatus = !dosha.is_active
    const result = await dispatch(
      toggleDoshaStatusThunk({ id: dosha.id, is_active: nextStatus })
    )

    if (result.meta.requestStatus === 'fulfilled') {
      toast.success(
        `Dosha "${dosha.name}" is now ${nextStatus ? 'active' : 'inactive'}.`
      )
    } else {
      toast.error(result.payload || 'Failed to update Dosha status.')
    }
  }

  const handleOpenDelete = (dosha) => {
    setDoshaToDelete(dosha)
    setDeleteDialogOpen(true)
  }

  const getSeverityBadge = (severity) => {
    const sev = DOSHA_SEVERITIES.find((s) => s.id === severity)
    return (
      <Badge
        variant="outline"
        className={`text-[10px] px-1.5 py-0 capitalize font-medium ${
          sev?.badgeColor ||
          'border-muted-foreground/30 text-muted-foreground bg-muted/20'
        }`}
      >
        {severity || 'Medium'}
      </Badge>
    )
  }

  const getCategoryLabel = (category) => {
    const cat = DOSHA_CATEGORIES.find((c) => c.id === category)
    return cat?.label || category || 'General'
  }

  return (
    <div className="space-y-7">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <Sparkles className="size-7 text-primary" />
            Vedic Doshas
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage classical astrological afflictions, planetary combinations, Nivaran cancellation rules, and structured remedies.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={loadDoshas}
            disabled={loadingList}
            className="gap-2 h-9.5 px-4 rounded-xl border-border/70 hover:bg-muted font-medium"
          >
            <RefreshCw
              className={`size-3.5 ${loadingList ? 'animate-spin' : ''}`}
            />
            Refresh
          </Button>

          <Button
            size="sm"
            onClick={() => navigate('/doshas/new')}
            className="gap-2 h-9.5 px-4 rounded-xl shadow-xs font-semibold"
          >
            <Plus className="size-4" />
            Create Dosha
          </Button>
        </div>
      </div>

      {/* KPI Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="p-5 rounded-2xl border border-border/60 bg-card/60 backdrop-blur-sm shadow-xs space-y-1.5">
          <div className="flex items-center justify-between text-xs text-muted-foreground font-semibold uppercase tracking-wider">
            <span>Total Doshas</span>
            <div className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <Sparkles className="size-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-foreground font-mono">
            {metrics?.total ?? doshas.length}
          </p>
          <p className="text-xs text-muted-foreground">Configured in registry</p>
        </div>

        <div className="p-5 rounded-2xl border border-border/60 bg-card/60 backdrop-blur-sm shadow-xs space-y-1.5">
          <div className="flex items-center justify-between text-xs text-muted-foreground font-semibold uppercase tracking-wider">
            <span>Published & Active</span>
            <div className="size-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="size-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-emerald-600 dark:text-emerald-400 font-mono">
            {metrics?.published ?? doshas.filter((d) => d.status === 'published' && d.is_active).length}
          </p>
          <p className="text-xs text-muted-foreground">Live for consultations</p>
        </div>

        <div className="p-5 rounded-2xl border border-border/60 bg-card/60 backdrop-blur-sm shadow-xs space-y-1.5">
          <div className="flex items-center justify-between text-xs text-muted-foreground font-semibold uppercase tracking-wider">
            <span>Draft Entries</span>
            <div className="size-8 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <FileText className="size-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-amber-600 dark:text-amber-400 font-mono">
            {metrics?.drafts ?? doshas.filter((d) => d.status === 'draft').length}
          </p>
          <p className="text-xs text-muted-foreground">Work-in-progress</p>
        </div>

        <div className="p-5 rounded-2xl border border-border/60 bg-card/60 backdrop-blur-sm shadow-xs space-y-1.5">
          <div className="flex items-center justify-between text-xs text-muted-foreground font-semibold uppercase tracking-wider">
            <span>Vedic Categories</span>
            <div className="size-8 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Layers className="size-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-purple-600 dark:text-purple-400 font-mono">
            {DOSHA_CATEGORIES.length}
          </p>
          <p className="text-xs text-muted-foreground">Astrological realms</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-2xl border border-border/60 bg-card/50 backdrop-blur-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="size-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search dosha (e.g. Mangal, Kala Sarpa)..."
            className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl bg-background/80 border border-border/70 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-foreground placeholder:text-muted-foreground"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Category Filter */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            <span className="text-xs text-muted-foreground mr-1 flex items-center gap-1 font-medium">
              <Filter className="size-3.5" />
              Category:
            </span>
            <button
              onClick={() => {
                setCategoryFilter('all')
                setPage(1)
              }}
              className={`px-3 py-1.5 text-xs rounded-xl font-medium transition-colors ${
                categoryFilter === 'all'
                  ? 'bg-primary text-primary-foreground shadow-xs font-semibold'
                  : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              All
            </button>
            {DOSHA_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  setCategoryFilter(cat.id)
                  setPage(1)
                }}
                className={`px-2.5 py-1.5 text-xs rounded-xl font-medium transition-colors whitespace-nowrap ${
                  categoryFilter === cat.id
                    ? 'bg-primary text-primary-foreground shadow-xs font-semibold'
                    : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                {cat.label.split(' ')[0]}
              </button>
            ))}
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            <span className="text-xs text-muted-foreground mr-1 font-medium">
              Status:
            </span>
            <button
              onClick={() => {
                setStatusFilter('all')
                setPage(1)
              }}
              className={`px-3 py-1.5 text-xs rounded-xl font-medium transition-colors ${
                statusFilter === 'all'
                  ? 'bg-primary text-primary-foreground shadow-xs font-semibold'
                  : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              All
            </button>
            {DOSHA_STATUSES.map((st) => (
              <button
                key={st.id}
                onClick={() => {
                  setStatusFilter(st.id)
                  setPage(1)
                }}
                className={`px-2.5 py-1.5 text-xs rounded-xl font-medium transition-colors capitalize ${
                  statusFilter === st.id
                    ? 'bg-primary text-primary-foreground shadow-xs font-semibold'
                    : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Doshas Data Table */}
      <div className="rounded-2xl border border-border/60 bg-card/80 backdrop-blur-sm overflow-hidden shadow-xs">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-border/60 bg-muted/20">
              <TableHead className="font-semibold text-xs text-foreground uppercase tracking-wider w-[240px]">
                Dosha Name
              </TableHead>
              <TableHead className="font-semibold text-xs text-foreground uppercase tracking-wider">
                Category & Severity
              </TableHead>
              <TableHead className="font-semibold text-xs text-foreground uppercase tracking-wider">
                Affected Planets & Houses
              </TableHead>
              <TableHead className="font-semibold text-xs text-foreground uppercase tracking-wider text-center">
                Remedies
              </TableHead>
              <TableHead className="font-semibold text-xs text-foreground uppercase tracking-wider text-center">
                Status
              </TableHead>
              <TableHead className="text-center font-semibold text-xs text-foreground uppercase tracking-wider w-[120px]">
                Active
              </TableHead>
              <TableHead className="text-right font-semibold text-xs text-foreground uppercase tracking-wider w-[110px]">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loadingList ? (
              Array.from({ length: 5 }).map((_, idx) => (
                <TableRow key={idx}>
                  <TableCell>
                    <Skeleton className="h-5 w-36 mb-1" />
                    <Skeleton className="h-3.5 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-40" />
                  </TableCell>
                  <TableCell className="text-center">
                    <Skeleton className="h-5 w-16 mx-auto rounded-full" />
                  </TableCell>
                  <TableCell className="text-center">
                    <Skeleton className="h-5 w-16 mx-auto rounded-full" />
                  </TableCell>
                  <TableCell className="text-center">
                    <Skeleton className="h-5 w-10 mx-auto rounded-full" />
                  </TableCell>
                  <TableCell className="text-right">
                    <Skeleton className="h-8 w-18 ml-auto rounded-lg" />
                  </TableCell>
                </TableRow>
              ))
            ) : doshas.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-44 text-center">
                  <div className="flex flex-col items-center justify-center text-muted-foreground space-y-2">
                    <ShieldAlert className="size-8 opacity-40" />
                    <p className="text-sm font-medium">No Vedic Doshas found.</p>
                    <p className="text-xs">
                      Click &quot;Create Dosha&quot; above to configure a classical affliction and its remedies.
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              doshas.map((dosha) => {
                const planets = parseArray(dosha.affected_planets)
                const houses = parseArray(dosha.affected_houses)
                const remedies = parseArray(dosha.remedies)
                const isToggling = togglingId === dosha.id

                return (
                  <TableRow
                    key={dosha.id}
                    className="hover:bg-muted/30 transition-colors border-border/40 group"
                  >
                    {/* Name, Sanskrit Name & Slug */}
                    <TableCell>
                      <div className="flex flex-col gap-0.5 items-start">
                        <div className="flex items-center gap-1.5 font-bold text-sm text-foreground">
                          <span>{dosha.name}</span>
                          {dosha.sanskrit_name && (
                            <span className="text-xs font-normal text-muted-foreground font-serif">
                              ({dosha.sanskrit_name})
                            </span>
                          )}
                        </div>
                        <span className="font-mono text-[11px] text-muted-foreground">
                          /{dosha.slug}
                        </span>
                      </div>
                    </TableCell>

                    {/* Category & Severity */}
                    <TableCell>
                      <div className="flex flex-col gap-1 items-start">
                        <span className="text-xs font-medium text-foreground">
                          {getCategoryLabel(dosha.category)}
                        </span>
                        {getSeverityBadge(dosha.severity)}
                      </div>
                    </TableCell>

                    {/* Affected Planets & Houses */}
                    <TableCell>
                      <div className="flex flex-col gap-1.5">
                        {planets.length > 0 && (
                          <div className="flex flex-wrap gap-1 items-center">
                            {planets.map((p) => (
                              <Badge
                                key={p}
                                variant="outline"
                                className="text-[10px] px-1.5 py-0 border-border/70 text-foreground bg-muted/40 font-mono"
                              >
                                {p}
                              </Badge>
                            ))}
                          </div>
                        )}
                        {houses.length > 0 && (
                          <div className="flex flex-wrap gap-1 items-center text-[10px] text-muted-foreground font-mono">
                            <span className="text-[10px] uppercase font-semibold text-muted-foreground/80">
                              Houses:
                            </span>
                            {houses.map((h) => (
                              <span
                                key={h}
                                className="px-1 py-0.2 bg-muted/60 rounded text-[10px]"
                              >
                                H{h}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </TableCell>

                    {/* Remedies Count */}
                    <TableCell className="text-center">
                      <Badge
                        variant="outline"
                        className="text-[10px] px-2 py-0.5 font-medium border-primary/30 text-primary bg-primary/5"
                      >
                        {remedies.length} Remedies
                      </Badge>
                    </TableCell>

                    {/* Status Badge */}
                    <TableCell className="text-center">
                      <Badge
                        variant="outline"
                        className={`text-[10px] px-2 py-0.5 capitalize font-medium ${
                          dosha.status === 'published'
                            ? 'border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10'
                            : dosha.status === 'draft'
                            ? 'border-amber-500/30 text-amber-600 dark:text-amber-400 bg-amber-500/10'
                            : 'border-muted-foreground/30 text-muted-foreground bg-muted/20'
                        }`}
                      >
                        {dosha.status || 'Published'}
                      </Badge>
                    </TableCell>

                    {/* Active Status Switch */}
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Switch
                          checked={Boolean(dosha.is_active)}
                          onCheckedChange={() => handleToggleStatus(dosha)}
                          disabled={isToggling}
                          aria-label={`Toggle active status for ${dosha.name}`}
                          className="data-[state=checked]:bg-emerald-500"
                        />
                        <span
                          className={`text-xs font-medium w-12 text-left ${
                            dosha.is_active
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : 'text-muted-foreground'
                          }`}
                        >
                          {dosha.is_active ? 'Active' : 'Disabled'}
                        </span>
                      </div>
                    </TableCell>

                    {/* Actions: Edit & Delete */}
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="outline"
                          size="icon-sm"
                          onClick={() => navigate(`/doshas/edit/${dosha.id}`)}
                          className="size-8 rounded-lg border-border/70 text-muted-foreground hover:text-primary hover:border-primary/40"
                          title="Edit Dosha"
                          aria-label={`Edit ${dosha.name}`}
                        >
                          <Edit2 className="size-3.5" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon-sm"
                          onClick={() => handleOpenDelete(dosha)}
                          className="size-8 rounded-lg border-border/70 text-muted-foreground hover:text-destructive hover:border-destructive/40"
                          title="Delete Dosha"
                          aria-label={`Delete ${dosha.name}`}
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

      {/* Pagination Controls */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-xs text-muted-foreground">
            Showing Page <span className="font-semibold text-foreground">{pagination.page}</span> of{' '}
            <span className="font-semibold text-foreground">{pagination.totalPages}</span> ({pagination.total} total doshas)
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1 || loadingList}
              className="h-8 gap-1 rounded-xl text-xs"
            >
              <ChevronLeft className="size-3.5" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
              disabled={page >= pagination.totalPages || loadingList}
              className="h-8 gap-1 rounded-xl text-xs"
            >
              Next
              <ChevronRight className="size-3.5" />
            </Button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <DeleteDoshaDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        dosha={doshaToDelete}
        onSuccess={loadDoshas}
      />
    </div>
  )
}
export default DoshasPage
