import { useEffect, useState, useCallback, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  fetchLegalPagesThunk,
  fetchLegalPageBySlugThunk,
  updateLegalPageThunk,
} from '@/features/legalPages/legalPagesApi'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Skeleton } from '@/components/ui/skeleton'
import { BlogEditor } from '@/components/blogs/BlogEditor'
import {
  Scale,
  ShieldCheck,
  FileText,
  RotateCcw,
  AlertTriangle,
  RefreshCw,
  Save,
  Loader2,
  CheckCircle2,
  EyeOff,
  Eye,
  Code2,
  FileEdit,
  Clock,
  Globe,
  Undo2,
} from 'lucide-react'
import { toast } from 'sonner'

const LEGAL_PAGE_DEFINITIONS = [
  {
    slug: 'privacy-policy',
    defaultTitle: 'Privacy Policy',
    subtitle: 'Data collection, birth chart storage & user privacy rights',
    icon: ShieldCheck,
    accentClass:
      'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
  },
  {
    slug: 'terms',
    defaultTitle: 'Terms & Conditions',
    subtitle: 'Platform usage rules, account responsibilities & service terms',
    icon: FileText,
    accentClass: 'bg-primary/10 text-primary border-primary/20',
  },
  {
    slug: 'refund-policy',
    defaultTitle: 'Refund Policy',
    subtitle: 'Cancellation terms, question/report credits & refund eligibility',
    icon: RotateCcw,
    accentClass:
      'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20',
  },
  {
    slug: 'disclaimer',
    defaultTitle: 'Disclaimer',
    subtitle: 'Vedic astrological guidance scope & advisory limitations',
    icon: AlertTriangle,
    accentClass:
      'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
  },
]

function formatPolicyTimestamp(dateStr) {
  if (!dateStr) return 'Not modified yet'
  const date = new Date(dateStr)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function LegalPolicyEditor({ policy, definition, isSaving, onSave }) {
  const [title, setTitle] = useState(
    () => policy?.title || definition?.defaultTitle || ''
  )
  const [content, setContent] = useState(() => policy?.content || '')
  const [isActive, setIsActive] = useState(() =>
    policy?.is_active !== undefined ? Boolean(policy.is_active) : true
  )
  const [editorMode, setEditorMode] = useState('visual') // 'visual' | 'preview' | 'html'
  const [titleTouched, setTitleTouched] = useState(false)

  const initialTitle = policy?.title || definition?.defaultTitle || ''
  const initialContent = policy?.content || ''
  const initialActive =
    policy?.is_active !== undefined ? Boolean(policy.is_active) : true

  const isDirty =
    title.trim() !== initialTitle.trim() ||
    content !== initialContent ||
    isActive !== initialActive

  const titleError =
    titleTouched && !title.trim() ? 'Document title is required.' : ''

  const handleReset = () => {
    setTitle(initialTitle)
    setContent(initialContent)
    setIsActive(initialActive)
    setTitleTouched(false)
    toast.info('Reverted unsaved edits.')
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setTitleTouched(true)
    if (!title.trim()) {
      toast.error('Please provide a document title before saving.')
      return
    }
    onSave({
      slug: policy.slug,
      payload: {
        title: title.trim(),
        content,
        is_active: Boolean(isActive),
      },
    })
  }

  const plainTextWords = useMemo(() => {
    const stripped = (content || '')
      .replace(/<[^>]*>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
    return stripped ? stripped.split(' ').length : 0
  }, [content])

  const IconComp = definition?.icon || Scale

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-border/60 bg-card/80 backdrop-blur-sm shadow-xs overflow-hidden"
    >
      {/* Top Studio Control Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-5 sm:p-6 border-b border-border/60 bg-muted/20">
        <div className="flex items-start gap-3.5">
          <div
            className={`size-11 rounded-xl border flex items-center justify-center shrink-0 ${
              definition?.accentClass ||
              'bg-primary/10 text-primary border-primary/20'
            }`}
          >
            <IconComp className="size-5" aria-hidden="true" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg font-bold tracking-tight text-foreground">
                {title || definition?.defaultTitle}
              </h2>
              <Badge
                variant="outline"
                className="font-mono text-[11px] px-2 py-0 bg-background/60"
              >
                /{policy.slug}
              </Badge>
              {isDirty ? (
                <Badge
                  variant="outline"
                  className="border-amber-500/40 text-amber-600 dark:text-amber-400 bg-amber-500/10 text-[11px] font-medium"
                >
                  Unsaved Changes
                </Badge>
              ) : (
                <Badge
                  variant="outline"
                  className="border-emerald-500/40 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 text-[11px] font-medium gap-1"
                >
                  <CheckCircle2 className="size-3" aria-hidden="true" />
                  Synced
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
              <span className="inline-flex items-center gap-1">
                <Clock className="size-3.5" aria-hidden="true" />
                Last updated: {formatPolicyTimestamp(policy.updated_at)}
              </span>
              <span>•</span>
              <span className="font-mono">{plainTextWords} words</span>
            </div>
          </div>
        </div>

        {/* Actions: Active Toggle, Discard & Save */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2.5 rounded-xl border border-border/70 bg-background/70 px-3.5 py-2">
            <Switch
              id="legal-page-active"
              checked={isActive}
              onCheckedChange={setIsActive}
              disabled={isSaving}
              className="data-[state=checked]:bg-emerald-500"
            />
            <Label
              htmlFor="legal-page-active"
              className={`text-xs font-semibold cursor-pointer ${
                isActive
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-muted-foreground'
              }`}
            >
              {isActive ? 'Published (Active)' : 'Hidden'}
            </Label>
          </div>

          {isDirty && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleReset}
              disabled={isSaving}
              className="h-9.5 rounded-xl gap-1.5 border-border/70"
            >
              <Undo2 className="size-3.5" aria-hidden="true" />
              Discard
            </Button>
          )}

          <Button
            type="submit"
            size="sm"
            disabled={isSaving}
            className="h-9.5 px-5 rounded-xl gap-2 font-semibold shadow-xs"
          >
            {isSaving ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                Saving Policy...
              </>
            ) : (
              <>
                <Save className="size-4" aria-hidden="true" />
                Save Policy
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Document Metadata Row */}
      <div className="p-5 sm:p-6 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 space-y-1.5">
            <Label
              htmlFor="legal-page-title"
              className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
            >
              Document Heading / Title{' '}
              <span className="text-destructive">*</span>
            </Label>
            <Input
              id="legal-page-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={() => setTitleTouched(true)}
              placeholder={definition?.defaultTitle || 'Policy Title'}
              aria-invalid={Boolean(titleError)}
              className="h-10 rounded-xl font-semibold"
            />
            {titleError && (
              <p className="text-xs font-medium text-destructive mt-1">
                {titleError}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Public Endpoint / Route
            </Label>
            <div className="flex h-10 items-center gap-2 rounded-xl border border-border/60 bg-muted/30 px-3.5 text-xs font-mono text-muted-foreground">
              <Globe
                className="size-3.5 text-primary shrink-0"
                aria-hidden="true"
              />
              <span className="truncate">japaika.com/{policy.slug}</span>
            </div>
          </div>
        </div>

        {/* Editor Mode Switcher Tabs */}
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Policy Content (HTML)
            </Label>

            <div className="inline-flex items-center rounded-xl border border-border/70 bg-muted/30 p-1 self-start">
              <button
                type="button"
                onClick={() => setEditorMode('visual')}
                aria-pressed={editorMode === 'visual'}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  editorMode === 'visual'
                    ? 'bg-card text-foreground shadow-2xs font-semibold'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <FileEdit className="size-3.5" aria-hidden="true" />
                <span>Rich Text Editor</span>
              </button>

              <button
                type="button"
                onClick={() => setEditorMode('preview')}
                aria-pressed={editorMode === 'preview'}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  editorMode === 'preview'
                    ? 'bg-card text-foreground shadow-2xs font-semibold'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Eye className="size-3.5" aria-hidden="true" />
                <span>Reader Preview</span>
              </button>

              <button
                type="button"
                onClick={() => setEditorMode('html')}
                aria-pressed={editorMode === 'html'}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  editorMode === 'html'
                    ? 'bg-card text-foreground shadow-2xs font-semibold'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Code2 className="size-3.5" aria-hidden="true" />
                <span>HTML Source</span>
              </button>
            </div>
          </div>

          {/* Active Editor Tab Surface */}
          {editorMode === 'visual' && (
            <BlogEditor content={content} onChange={setContent} />
          )}

          {editorMode === 'preview' && (
            <div className="rounded-2xl border border-border/60 bg-background/70 p-6 sm:p-10 min-h-[420px] shadow-inner">
              <div className="max-w-3xl mx-auto space-y-6">
                <div className="border-b border-border/60 pb-5 space-y-1.5">
                  <Badge
                    variant="outline"
                    className="font-mono text-[10px] uppercase tracking-widest text-primary border-primary/30 bg-primary/5"
                  >
                    Japaika Legal Document
                  </Badge>
                  <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                    {title || definition?.defaultTitle}
                  </h1>
                  <p className="text-xs text-muted-foreground">
                    Last updated: {formatPolicyTimestamp(policy.updated_at)}
                  </p>
                </div>

                {content && content.trim() ? (
                  <div
                    className="prose prose-neutral dark:prose-invert max-w-none text-sm sm:text-base leading-relaxed text-foreground/90"
                    dangerouslySetInnerHTML={{ __html: content }}
                  />
                ) : (
                  <p className="text-sm text-muted-foreground italic">
                    No content written for this policy yet. Switch to the Rich
                    Text Editor to author policy clauses.
                  </p>
                )}
              </div>
            </div>
          )}

          {editorMode === 'html' && (
            <div className="rounded-2xl border border-border/60 bg-background/90 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2 border-b border-border/50 bg-muted/30 text-[11px] font-mono text-muted-foreground">
                <span>Raw HTML Markup</span>
                <span>{content.length} characters</span>
              </div>
              <textarea
                rows={18}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="<h2>1. Overview</h2><p>Enter policy HTML content...</p>"
                aria-label="Raw HTML content"
                className="w-full p-5 font-mono text-xs sm:text-sm leading-relaxed bg-transparent text-foreground focus:outline-none resize-y"
              />
            </div>
          )}
        </div>
      </div>
    </form>
  )
}

export function LegalPagesPage() {
  const dispatch = useDispatch()
  const {
    legalPages,
    currentLegalPage,
    loadingList,
    loadingDetail,
    savingSlug,
  } = useSelector((state) => state.legalPages)

  const [selectedSlug, setSelectedSlug] = useState('privacy-policy')

  const loadAllLegalPages = useCallback(() => {
    dispatch(fetchLegalPagesThunk())
  }, [dispatch])

  useEffect(() => {
    loadAllLegalPages()
  }, [loadAllLegalPages])

  // Map backend legalPages by canonical slug (normalizing 'terms-and-conditions' -> 'terms')
  const pagesBySlug = useMemo(() => {
    const map = {}
    const list = Array.isArray(legalPages) ? legalPages : []
    list.forEach((p) => {
      if (!p?.slug) return
      const normalized =
        p.slug === 'terms-and-conditions' ? 'terms' : p.slug.toLowerCase()
      map[normalized] = p
    })
    return map
  }, [legalPages])

  const activeDefinition = useMemo(
    () =>
      LEGAL_PAGE_DEFINITIONS.find((d) => d.slug === selectedSlug) ||
      LEGAL_PAGE_DEFINITIONS[0],
    [selectedSlug]
  )

  const activePolicy = useMemo(() => {
    const fromMap = pagesBySlug[selectedSlug]
    if (fromMap) return fromMap
    if (
      currentLegalPage &&
      (currentLegalPage.slug === selectedSlug ||
        (selectedSlug === 'terms' &&
          currentLegalPage.slug === 'terms-and-conditions'))
    ) {
      return currentLegalPage
    }
    return {
      slug: selectedSlug,
      title: activeDefinition.defaultTitle,
      content: '',
      is_active: true,
      updated_at: null,
    }
  }, [pagesBySlug, selectedSlug, currentLegalPage, activeDefinition])

  const handleSelectPolicy = (slug) => {
    setSelectedSlug(slug)
    dispatch(fetchLegalPageBySlugThunk(slug))
  }

  const handleSavePolicy = async ({ slug, payload }) => {
    const result = await dispatch(updateLegalPageThunk({ slug, payload }))
    if (updateLegalPageThunk.fulfilled.match(result)) {
      toast.success(`${payload.title} saved and published successfully.`)
    } else {
      toast.error(result.payload || 'Failed to save legal page.')
    }
  }

  return (
    <div className="space-y-7">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <Scale className="size-7 text-primary" aria-hidden="true" />
            Legal & Compliance Pages
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage Japaika&apos;s official Privacy Policy, Terms &amp;
            Conditions, Refund Policy, and Astrological Disclaimer.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={loadAllLegalPages}
            disabled={loadingList || loadingDetail}
            className="gap-2 h-9.5 px-4 rounded-xl border-border/70 hover:bg-muted font-medium"
          >
            <RefreshCw
              className={`size-3.5 ${
                loadingList || loadingDetail ? 'animate-spin' : ''
              }`}
              aria-hidden="true"
            />
            Refresh Policies
          </Button>
        </div>
      </div>

      {/* 4 Legal Policy Selector Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {LEGAL_PAGE_DEFINITIONS.map((def) => {
          const record = pagesBySlug[def.slug]
          const isSelected = selectedSlug === def.slug
          const isActive =
            record?.is_active !== undefined ? Boolean(record.is_active) : true
          const IconComp = def.icon

          return (
            <button
              key={def.slug}
              type="button"
              onClick={() => handleSelectPolicy(def.slug)}
              aria-pressed={isSelected}
              className={`text-left p-5 rounded-2xl border transition-all flex flex-col justify-between gap-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                isSelected
                  ? 'border-primary bg-primary/5 shadow-md ring-1 ring-primary/30'
                  : 'border-border/60 bg-card/60 hover:border-border hover:bg-card/90 shadow-2xs'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div
                    className={`size-10 rounded-xl border flex items-center justify-center ${def.accentClass}`}
                  >
                    <IconComp className="size-5" aria-hidden="true" />
                  </div>

                  {loadingList && !record ? (
                    <Skeleton className="h-5 w-16 rounded-full" />
                  ) : isActive ? (
                    <Badge
                      variant="outline"
                      className="border-emerald-500/40 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 text-[10px] font-semibold gap-1"
                    >
                      <CheckCircle2 className="size-3" aria-hidden="true" />
                      Active
                    </Badge>
                  ) : (
                    <Badge
                      variant="outline"
                      className="border-amber-500/40 text-amber-600 dark:text-amber-400 bg-amber-500/10 text-[10px] font-semibold gap-1"
                    >
                      <EyeOff className="size-3" aria-hidden="true" />
                      Hidden
                    </Badge>
                  )}
                </div>

                <div>
                  <h2 className="text-base font-bold tracking-tight text-foreground">
                    {record?.title || def.defaultTitle}
                  </h2>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
                    {def.subtitle}
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-border/50 flex items-center justify-between text-[11px] text-muted-foreground">
                <span className="font-mono text-primary font-medium">
                  /{def.slug}
                </span>
                <span className="truncate max-w-[140px]">
                  {record?.updated_at
                    ? new Date(record.updated_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })
                    : 'Default'}
                </span>
              </div>
            </button>
          )
        })}
      </div>

      {/* Policy Studio Editor Workspace */}
      {loadingList && Object.keys(pagesBySlug).length === 0 ? (
        <div className="rounded-2xl border border-border/60 bg-card/80 p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <Skeleton className="h-6 w-56" />
              <Skeleton className="h-4 w-40" />
            </div>
            <Skeleton className="h-10 w-36 rounded-xl" />
          </div>
          <Skeleton className="h-12 w-full rounded-xl" />
          <Skeleton className="h-[420px] w-full rounded-2xl" />
        </div>
      ) : (
        <LegalPolicyEditor
          key={`${activePolicy.slug}-${activePolicy.updated_at || 'init'}-${
            activePolicy.id || ''
          }`}
          policy={activePolicy}
          definition={activeDefinition}
          isSaving={savingSlug === activePolicy.slug}
          onSave={handleSavePolicy}
        />
      )}
    </div>
  )
}

export default LegalPagesPage
