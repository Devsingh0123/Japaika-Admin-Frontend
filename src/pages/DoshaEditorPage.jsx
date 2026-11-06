import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  fetchDoshaByIdThunk,
  createDoshaThunk,
  updateDoshaThunk,
} from '@/features/doshas/doshasApi'
import { clearCurrentDosha } from '@/features/doshas/doshasSlice'
import { CoverImageUpload } from '@/components/blogs/CoverImageUpload'
import { RemediesBuilder } from '@/components/doshas/RemediesBuilder'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  DOSHA_CATEGORIES,
  DOSHA_SEVERITIES,
  DOSHA_STATUSES,
  ALL_PLANETS,
  ALL_HOUSES,
  parseArray,
} from '@/lib/constants'
import {
  ArrowLeft,
  Save,
  Sparkles,
  Loader2,
  AlertCircle,
  Globe,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import { toast } from 'sonner'

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function DoshaEditorPage() {
  const { id } = useParams()
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const isEdit = Boolean(id)
  const { currentDosha, loadingDosha, isSubmitting } = useSelector(
    (state) => state.doshas
  )

  // Core Details
  const [name, setName] = useState('')
  const [sanskritName, setSanskritName] = useState('')
  const [slug, setSlug] = useState('')
  const [isSlugCustomized, setIsSlugCustomized] = useState(false)
  const [title, setTitle] = useState('')
  const [subtitle, setSubtitle] = useState('')

  // Astrological Classifications
  const [category, setCategory] = useState('general')
  const [severity, setSeverity] = useState('medium')
  const [affectedPlanets, setAffectedPlanets] = useState([])
  const [affectedHouses, setAffectedHouses] = useState([])

  // Long-Form Astrological Content
  const [excerpt, setExcerpt] = useState('')
  const [description, setDescription] = useState('')
  const [effects, setEffects] = useState('')
  const [cancellations, setCancellations] = useState('')
  const [remedies, setRemedies] = useState([])

  // Publishing & Media
  const [featuredImage, setFeaturedImage] = useState('')
  const [status, setStatus] = useState('published')
  const [isActive, setIsActive] = useState(true)
  const [sortOrder, setSortOrder] = useState('0')

  // SEO & Metadata
  const [metaTitle, setMetaTitle] = useState('')
  const [metaDescription, setMetaDescription] = useState('')
  const [metaKeywords, setMetaKeywords] = useState('')
  const [canonicalUrl, setCanonicalUrl] = useState('')
  const [showSeoSettings, setShowSeoSettings] = useState(false)

  const [validationError, setValidationError] = useState('')

  // Load existing Dosha when in Edit mode
  useEffect(() => {
    if (isEdit) {
      dispatch(fetchDoshaByIdThunk(id))
    } else {
      dispatch(clearCurrentDosha())
      setName('')
      setSanskritName('')
      setSlug('')
      setIsSlugCustomized(false)
      setTitle('')
      setSubtitle('')
      setCategory('general')
      setSeverity('medium')
      setAffectedPlanets([])
      setAffectedHouses([])
      setExcerpt('')
      setDescription('')
      setEffects('')
      setCancellations('')
      setRemedies([])
      setFeaturedImage('')
      setStatus('published')
      setIsActive(true)
      setSortOrder('0')
      setMetaTitle('')
      setMetaDescription('')
      setMetaKeywords('')
      setCanonicalUrl('')
    }
  }, [id, isEdit, dispatch])

  // Populate form with current dosha details
  useEffect(() => {
    if (isEdit && currentDosha) {
      setName(currentDosha.name || '')
      setSanskritName(currentDosha.sanskrit_name || '')
      setSlug(currentDosha.slug || '')
      setIsSlugCustomized(true)
      setTitle(currentDosha.title || '')
      setSubtitle(currentDosha.subtitle || '')
      setCategory(currentDosha.category || 'general')
      setSeverity(currentDosha.severity || 'medium')
      setAffectedPlanets(parseArray(currentDosha.affected_planets))
      setAffectedHouses(parseArray(currentDosha.affected_houses))
      setExcerpt(currentDosha.excerpt || '')
      setDescription(currentDosha.description || '')
      setEffects(currentDosha.effects || '')
      setCancellations(currentDosha.cancellations || '')
      setRemedies(parseArray(currentDosha.remedies))
      setFeaturedImage(currentDosha.featured_image || '')
      setStatus(currentDosha.status || 'published')
      setIsActive(currentDosha.is_active !== false)
      setSortOrder(String(currentDosha.sort_order ?? 0))
      setMetaTitle(currentDosha.meta_title || '')
      setMetaDescription(currentDosha.meta_description || '')
      setMetaKeywords(currentDosha.meta_keywords || '')
      setCanonicalUrl(currentDosha.canonical_url || '')
    }
  }, [isEdit, currentDosha])

  const togglePlanet = (planet) => {
    setAffectedPlanets((prev) =>
      prev.includes(planet)
        ? prev.filter((p) => p !== planet)
        : [...prev, planet]
    )
  }

  const toggleHouse = (houseNum) => {
    setAffectedHouses((prev) =>
      prev.includes(houseNum)
        ? prev.filter((h) => h !== houseNum)
        : [...prev, houseNum].sort((a, b) => a - b)
    )
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setValidationError('')

    const cleanName = name.trim()
    if (!cleanName) {
      setValidationError('Dosha Name is required.')
      return
    }

    const cleanDescription = description.trim()
    if (!cleanDescription) {
      setValidationError('Detailed Astrological Description is required.')
      return
    }

    const finalSlug = slug.trim() ? slugify(slug) : slugify(cleanName)
    const finalTitle = title.trim() || `${cleanName}: Astrological Causes, Effects & Classical Remedies`

    const payload = {
      name: cleanName,
      sanskrit_name: sanskritName.trim() || null,
      slug: finalSlug,
      title: finalTitle,
      subtitle: subtitle.trim() || null,
      category,
      severity,
      affected_planets: affectedPlanets,
      affected_houses: affectedHouses,
      excerpt: excerpt.trim() || null,
      description: cleanDescription,
      effects: effects.trim() || null,
      cancellations: cancellations.trim() || null,
      remedies,
      featured_image: featuredImage || null,
      status,
      is_active: isActive,
      sort_order: parseInt(sortOrder, 10) || 0,
      meta_title: metaTitle.trim() || null,
      meta_description: metaDescription.trim() || null,
      meta_keywords: metaKeywords.trim() || null,
      canonical_url: canonicalUrl.trim() || null,
    }

    let result
    if (isEdit) {
      result = await dispatch(updateDoshaThunk({ id, doshaData: payload }))
      if (updateDoshaThunk.fulfilled.match(result)) {
        toast.success(`Dosha "${cleanName}" updated successfully!`)
        navigate('/doshas')
      } else {
        toast.error(result.payload || 'Failed to update Dosha.')
      }
    } else {
      result = await dispatch(createDoshaThunk(payload))
      if (createDoshaThunk.fulfilled.match(result)) {
        toast.success(`Dosha "${cleanName}" created successfully!`)
        navigate('/doshas')
      } else {
        toast.error(result.payload || 'Failed to create Dosha.')
      }
    }
  }

  if (isEdit && loadingDosha) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="flex flex-col items-center gap-2 text-muted-foreground">
          <Loader2 className="size-8 animate-spin text-primary" />
          <p className="text-sm font-medium">Loading Dosha details...</p>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-6xl pb-16">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-5">
        <div className="flex items-center gap-3">
          <Link
            to="/doshas"
            className="p-2 rounded-xl border border-border/70 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            title="Back to Doshas"
          >
            <ArrowLeft className="size-4" />
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <Sparkles className="size-5 text-primary" />
              {isEdit ? `Edit: ${name || 'Dosha'}` : 'Create Vedic Dosha'}
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              {isEdit
                ? 'Update planetary combinations, Nivaran cancellation rules, and remedial actions.'
                : 'Configure a new classical astrological affliction, causes, and structured remedies.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => navigate('/doshas')}
            disabled={isSubmitting}
            className="rounded-xl h-9 text-xs"
          >
            Cancel
          </Button>

          <Button
            type="submit"
            size="sm"
            disabled={isSubmitting}
            className="gap-2 rounded-xl h-9 font-semibold shadow-xs text-xs px-4"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="size-3.5 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="size-3.5" />
                {isEdit ? 'Save Changes' : 'Create Dosha'}
              </>
            )}
          </Button>
        </div>
      </div>

      {validationError && (
        <div className="p-3.5 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-2">
          <AlertCircle className="size-4 shrink-0" />
          <span>{validationError}</span>
        </div>
      )}

      {/* 2-Column Responsive Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Main Column (2 spans) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Card 1: Basic Information */}
          <div className="p-5 rounded-2xl border border-border/60 bg-card/60 backdrop-blur-sm space-y-4">
            <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">
              Basic Identification
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="dosha-name" className="text-xs font-semibold text-muted-foreground uppercase">
                  Dosha Name *
                </Label>
                <Input
                  id="dosha-name"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value)
                    if (!isSlugCustomized) {
                      setSlug(slugify(e.target.value))
                    }
                  }}
                  placeholder="e.g. Mangal Dosha"
                  className="font-medium text-sm"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="dosha-sanskrit" className="text-xs font-semibold text-muted-foreground uppercase">
                  Sanskrit Name
                </Label>
                <Input
                  id="dosha-sanskrit"
                  value={sanskritName}
                  onChange={(e) => setSanskritName(e.target.value)}
                  placeholder="e.g. मंगल दोष / कुज दोष"
                  className="font-serif text-sm"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="dosha-slug" className="text-xs font-semibold text-muted-foreground uppercase">
                  URL Slug *
                </Label>
                <button
                  type="button"
                  onClick={() => setIsSlugCustomized((prev) => !prev)}
                  className="text-[11px] text-primary hover:underline"
                >
                  {isSlugCustomized ? 'Auto-sync from Name' : 'Custom Slug'}
                </button>
              </div>
              <div className="flex items-center">
                <span className="text-xs font-mono text-muted-foreground bg-muted/50 border border-r-0 border-border/70 px-3 py-2 rounded-l-xl select-none">
                  /doshas/
                </span>
                <Input
                  id="dosha-slug"
                  value={slug}
                  onChange={(e) => {
                    setSlug(e.target.value)
                    setIsSlugCustomized(true)
                  }}
                  placeholder="mangal-dosha"
                  className="rounded-l-none font-mono text-xs"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="dosha-title" className="text-xs font-semibold text-muted-foreground uppercase">
                Display Title *
              </Label>
              <Input
                id="dosha-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Mangal Dosha (Manglik): Astrological Causes, Effects on Marriage & Classical Cancellations"
                className="text-xs font-medium"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="dosha-subtitle" className="text-xs font-semibold text-muted-foreground uppercase">
                Subtitle
              </Label>
              <Input
                id="dosha-subtitle"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                placeholder="The placement of Mars in the 1st, 4th, 7th, 8th, or 12th house and matrimonial harmony."
                className="text-xs"
              />
            </div>
          </div>

          {/* Card 2: Astrological Classifications & Factors */}
          <div className="p-5 rounded-2xl border border-border/60 bg-card/60 backdrop-blur-sm space-y-4">
            <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">
              Astrological Factors
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="dosha-category" className="text-xs font-semibold text-muted-foreground uppercase">
                  Category *
                </Label>
                <select
                  id="dosha-category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full text-xs rounded-xl bg-background border border-border/70 px-3 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary font-medium"
                >
                  {DOSHA_CATEGORIES.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="dosha-severity" className="text-xs font-semibold text-muted-foreground uppercase">
                  Severity Level *
                </Label>
                <select
                  id="dosha-severity"
                  value={severity}
                  onChange={(e) => setSeverity(e.target.value)}
                  className="w-full text-xs rounded-xl bg-background border border-border/70 px-3 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary font-medium capitalize"
                >
                  {DOSHA_SEVERITIES.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.label} ({s.id})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Affected Planets Multi-Selector */}
            <div className="space-y-2 pt-1">
              <Label className="text-xs font-semibold text-muted-foreground uppercase block">
                Affected Planets ({affectedPlanets.length} Selected)
              </Label>
              <div className="flex flex-wrap gap-1.5">
                {ALL_PLANETS.map((planet) => {
                  const isSelected = affectedPlanets.includes(planet)
                  return (
                    <button
                      type="button"
                      key={planet}
                      onClick={() => togglePlanet(planet)}
                      className={`px-3 py-1 text-xs rounded-xl border transition-all font-mono ${
                        isSelected
                          ? 'bg-primary text-primary-foreground border-primary font-bold shadow-xs'
                          : 'bg-muted/40 text-muted-foreground border-border/60 hover:bg-muted hover:text-foreground'
                      }`}
                    >
                      {planet}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Affected Houses Multi-Selector */}
            <div className="space-y-2 pt-1">
              <Label className="text-xs font-semibold text-muted-foreground uppercase block">
                Affected Houses ({affectedHouses.length} Selected)
              </Label>
              <div className="grid grid-cols-6 sm:grid-cols-12 gap-1.5">
                {ALL_HOUSES.map((houseNum) => {
                  const isSelected = affectedHouses.includes(houseNum)
                  return (
                    <button
                      type="button"
                      key={houseNum}
                      onClick={() => toggleHouse(houseNum)}
                      className={`py-1.5 text-center text-xs rounded-lg border transition-all font-mono font-medium ${
                        isSelected
                          ? 'bg-primary text-primary-foreground border-primary font-bold shadow-xs'
                          : 'bg-muted/30 text-muted-foreground border-border/60 hover:bg-muted hover:text-foreground'
                      }`}
                      title={`House ${houseNum}`}
                    >
                      H{houseNum}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Card 3: Classical Analysis & Content */}
          <div className="p-5 rounded-2xl border border-border/60 bg-card/60 backdrop-blur-sm space-y-4">
            <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">
              Classical Analysis & Nivaran
            </h2>

            <div className="space-y-1.5">
              <Label htmlFor="dosha-excerpt" className="text-xs font-semibold text-muted-foreground uppercase">
                Short Excerpt
              </Label>
              <textarea
                id="dosha-excerpt"
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                rows={2}
                placeholder="Brief astrological summary for preview cards and chat recommendation teasers..."
                className="w-full text-xs rounded-xl bg-background border border-border/70 p-3 text-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none placeholder:text-muted-foreground/60"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="dosha-description" className="text-xs font-semibold text-muted-foreground uppercase">
                Astrological Formation & Classical Description *
              </Label>
              <textarea
                id="dosha-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={6}
                placeholder="Explain the classical Vedic astronomical combination (e.g. from Brihat Parashara Hora Shastra, Phaladeepika) and how the dosha is formed..."
                className="w-full text-xs rounded-xl bg-background border border-border/70 p-3 text-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-y placeholder:text-muted-foreground/60 font-mono"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="dosha-effects" className="text-xs font-semibold text-muted-foreground uppercase">
                Life & Astrological Effects
              </Label>
              <textarea
                id="dosha-effects"
                value={effects}
                onChange={(e) => setEffects(e.target.value)}
                rows={4}
                placeholder="1. Matrimonial friction and delays in marital timing...&#10;2. Career or temperament volatility during planetary dasha..."
                className="w-full text-xs rounded-xl bg-background border border-border/70 p-3 text-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-y placeholder:text-muted-foreground/60"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="dosha-cancellations" className="text-xs font-semibold text-muted-foreground uppercase">
                  Classical Cancellations & Exceptions (Nivaran Rules)
                </Label>
                <span className="text-[11px] text-muted-foreground">
                  When the dosha is nullified
                </span>
              </div>
              <textarea
                id="dosha-cancellations"
                value={cancellations}
                onChange={(e) => setCancellations(e.target.value)}
                rows={4}
                placeholder="1. If Mars is placed in Aries, Scorpio, or Capricorn...&#10;2. When aspected by natural benefic Jupiter (Guru)..."
                className="w-full text-xs rounded-xl bg-background border border-border/70 p-3 text-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-y placeholder:text-muted-foreground/60"
              />
            </div>
          </div>

          {/* Card 4: Structured Remedies Builder */}
          <div className="p-5 rounded-2xl border border-border/60 bg-card/60 backdrop-blur-sm">
            <RemediesBuilder remedies={remedies} onChange={setRemedies} />
          </div>
        </div>

        {/* Sidebar Column (1 span) */}
        <div className="space-y-6">
          {/* Publishing & Status Card */}
          <div className="p-5 rounded-2xl border border-border/60 bg-card/60 backdrop-blur-sm space-y-4">
            <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">
              Publishing Controls
            </h2>

            <div className="space-y-1.5">
              <Label htmlFor="dosha-status" className="text-xs font-semibold text-muted-foreground uppercase">
                Publishing Status
              </Label>
              <select
                id="dosha-status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full text-xs rounded-xl bg-background border border-border/70 px-3 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary font-medium capitalize"
              >
                {DOSHA_STATUSES.map((st) => (
                  <option key={st.id} value={st.id}>
                    {st.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl border border-border/60 bg-muted/20">
              <div className="space-y-0.5">
                <Label htmlFor="dosha-active-switch" className="text-xs font-semibold text-foreground cursor-pointer">
                  Active in Registry
                </Label>
                <p className="text-[10px] text-muted-foreground">
                  Available in AI chat & consultations
                </p>
              </div>
              <Switch
                id="dosha-active-switch"
                checked={isActive}
                onCheckedChange={setIsActive}
                className="data-[state=checked]:bg-emerald-500"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="dosha-sort" className="text-xs font-semibold text-muted-foreground uppercase">
                Display Sort Order
              </Label>
              <Input
                id="dosha-sort"
                type="number"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                placeholder="0"
                className="font-mono text-xs"
              />
            </div>
          </div>

          {/* Featured Cover Image Card */}
          <div className="p-5 rounded-2xl border border-border/60 bg-card/60 backdrop-blur-sm space-y-3">
            <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">
              Featured Artwork
            </h2>
            <CoverImageUpload
              value={featuredImage}
              onChange={setFeaturedImage}
              folder="japaika/doshas"
            />
          </div>

          {/* SEO & Search Visibility Card */}
          <div className="p-5 rounded-2xl border border-border/60 bg-card/60 backdrop-blur-sm space-y-3">
            <button
              type="button"
              onClick={() => setShowSeoSettings((prev) => !prev)}
              className="w-full flex items-center justify-between text-left text-sm font-semibold text-foreground uppercase tracking-wider"
            >
              <span className="flex items-center gap-1.5">
                <Globe className="size-4 text-primary" />
                SEO & Meta Settings
              </span>
              {showSeoSettings ? (
                <ChevronUp className="size-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="size-4 text-muted-foreground" />
              )}
            </button>

            {showSeoSettings && (
              <div className="space-y-3 pt-2 border-t border-border/40">
                <div className="space-y-1">
                  <Label htmlFor="meta-title" className="text-[11px] text-muted-foreground uppercase font-semibold">
                    Meta Title
                  </Label>
                  <Input
                    id="meta-title"
                    value={metaTitle}
                    onChange={(e) => setMetaTitle(e.target.value)}
                    placeholder="Mangal Dosha Meaning, Effects & Remedies | Japaika"
                    className="text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="meta-desc" className="text-[11px] text-muted-foreground uppercase font-semibold">
                    Meta Description
                  </Label>
                  <textarea
                    id="meta-desc"
                    value={metaDescription}
                    onChange={(e) => setMetaDescription(e.target.value)}
                    rows={3}
                    placeholder="Comprehensive Vedic astrology guide to Mangal Dosha..."
                    className="w-full text-xs rounded-xl bg-background border border-border/70 p-2.5 text-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none placeholder:text-muted-foreground/60"
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="meta-keywords" className="text-[11px] text-muted-foreground uppercase font-semibold">
                    Meta Keywords
                  </Label>
                  <Input
                    id="meta-keywords"
                    value={metaKeywords}
                    onChange={(e) => setMetaKeywords(e.target.value)}
                    placeholder="mangal dosha, manglik, vedic astrology, remedies"
                    className="text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="canonical-url" className="text-[11px] text-muted-foreground uppercase font-semibold">
                    Canonical URL
                  </Label>
                  <Input
                    id="canonical-url"
                    value={canonicalUrl}
                    onChange={(e) => setCanonicalUrl(e.target.value)}
                    placeholder="https://japaika.com/doshas/mangal-dosha"
                    className="text-xs font-mono"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </form>
  )
}
export default DoshaEditorPage
