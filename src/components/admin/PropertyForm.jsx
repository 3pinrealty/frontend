import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api, normalizeProperty } from '../../services/api'

const ADMIN_TOAST_KEY = 'adminToast'

function emptyPropertyForm() {
  return {
    title: '',
    price: '',
    minPrice: '',
    maxPrice: '',
    currency: 'INR',
    paymentPlan: 'Full payment',
    location: '',
    addressLine: '',
    description: '',
    bedrooms: '',
    bathrooms: '',
    area: '',
    areaSqftMin: '',
    areaSqftMax: '',
    landAreaAcres: '',
    type: '',
    builder: '',
    unitsCount: '',
    pricePerSqftMin: '',
    pricePerSqftMax: '',
    structure: '',
    towerCount: '',
    deliveryDate: '',
    isNewDevelopment: false,
    featured: false,
    launchStatus: '',
    propertyVisibility: '',
    cashbackEligible: false,
    amenitiesText: '',
    landmarksText: '',
    floorPlanNote: '',
    brochureUrl: '',
    latitude: '',
    longitude: '',
    mapUrl: '',
    youtubeUrl: '',
  }
}

function numToInput(v) {
  if (v == null || v === '') return ''
  const n = Number(v)
  return Number.isFinite(n) ? String(n) : ''
}

function positiveNumToInput(v) {
  if (v == null || v === '') return ''
  const n = Number(v)
  return Number.isFinite(n) && n > 0 ? String(n) : ''
}

function textToInput(v) {
  if (v == null) return ''
  return String(v).trim()
}

function normalizePositiveNumericField(v) {
  const raw = String(v ?? '').trim()
  if (!raw) return ''
  const n = Number(raw)
  return Number.isFinite(n) && n > 0 ? raw : ''
}

function hasPriceNumberAndText(v) {
  const text = String(v || '').trim()
  return /\d/.test(text) && /[a-zA-Z]/.test(text)
}

function landmarksToText(landmarks) {
  if (!Array.isArray(landmarks)) return ''
  return landmarks
    .map((l) => {
      const parts = [l.name?.trim(), (l.distance || '').trim()].filter(Boolean)
      if (l.icon && l.icon !== 'mdi:map-marker-outline') parts.push(String(l.icon).trim())
      return parts.join(' | ')
    })
    .filter(Boolean)
    .join('\n')
}

function reorderItems(list, fromIndex, toIndex) {
  if (!Array.isArray(list)) return []
  if (fromIndex === toIndex) return list
  if (fromIndex < 0 || toIndex < 0 || fromIndex >= list.length || toIndex >= list.length) return list
  const next = [...list]
  const [moved] = next.splice(fromIndex, 1)
  next.splice(toIndex, 0, moved)
  return next
}

function propertyToFormState(p) {
  const row = normalizeProperty(p)
  let deliveryDate = ''
  if (row.deliveryDate) {
    const date = new Date(row.deliveryDate)
    if (!Number.isNaN(date.getTime())) deliveryDate = date.toISOString().slice(0, 10)
  }

  return {
    title: row.title ?? '',
    price: textToInput(row.price),
    minPrice: row.minPrice == null ? '' : String(row.minPrice),
    maxPrice: row.maxPrice == null ? '' : String(row.maxPrice),
    currency: row.currency || 'INR',
    paymentPlan: row.paymentPlan ?? 'Full payment',
    location: row.location ?? '',
    addressLine: row.addressLine ?? '',
    description: row.description ?? '',
    bedrooms: numToInput(row.bedrooms),
    bathrooms: numToInput(row.bathrooms),
    area: textToInput(row.area),
    areaSqftMin: positiveNumToInput(row.areaSqftMin),
    areaSqftMax: positiveNumToInput(row.areaSqftMax),
    landAreaAcres: numToInput(row.landAreaAcres),
    type: row.type ?? '',
    builder: row.builder ?? '',
    unitsCount: numToInput(row.unitsCount),
    pricePerSqftMin: positiveNumToInput(row.pricePerSqftMin),
    pricePerSqftMax: positiveNumToInput(row.pricePerSqftMax),
    structure: row.structure ?? '',
    towerCount: numToInput(row.towerCount),
    deliveryDate,
    isNewDevelopment: Boolean(row.isNewDevelopment),
    featured: Boolean(row.featured),
    launchStatus: row.launchStatus ?? '',
    propertyVisibility: row.propertyVisibility ?? '',
    cashbackEligible: Boolean(row.cashbackEligible),
    amenitiesText: Array.isArray(row.amenities) ? row.amenities.join('\n') : '',
    landmarksText: landmarksToText(row.nearbyLandmarks),
    floorPlanNote: row.floorPlanNote ?? '',
    brochureUrl: row.brochureUrl ?? '',
    latitude: numToInput(row.latitude),
    longitude: numToInput(row.longitude),
    mapUrl: row.mapUrl ?? '',
    youtubeUrl: row.youtubeUrl ?? '',
  }
}

function appendPayload(fd, form) {
  fd.append('title', form.title.trim())
  fd.append('price', String(form.price))
  // Always send optional range fields so clearing in admin overwrites stale DB values.
  fd.append('minPrice', String(form.minPrice ?? '').trim())
  fd.append('maxPrice', String(form.maxPrice ?? '').trim())
  fd.append('currency', form.currency.trim() || 'INR')
  fd.append('paymentPlan', form.paymentPlan.trim())
  fd.append('location', form.location.trim())
  fd.append('addressLine', form.addressLine.trim())
  fd.append('description', form.description.trim())
  if (form.bedrooms !== '') fd.append('bedrooms', String(form.bedrooms))
  if (form.bathrooms !== '') fd.append('bathrooms', String(form.bathrooms))
  if (form.area) fd.append('area', String(form.area))
  // Always send optional range fields so clearing overwrites old DB values.
  fd.append('areaSqftMin', normalizePositiveNumericField(form.areaSqftMin))
  fd.append('areaSqftMax', normalizePositiveNumericField(form.areaSqftMax))
  if (form.landAreaAcres) fd.append('landAreaAcres', String(form.landAreaAcres))
  if (form.type) fd.append('type', form.type.trim())
  fd.append('builder', form.builder.trim())
  if (form.unitsCount) fd.append('unitsCount', String(form.unitsCount))
  fd.append('pricePerSqftMin', normalizePositiveNumericField(form.pricePerSqftMin))
  fd.append('pricePerSqftMax', normalizePositiveNumericField(form.pricePerSqftMax))
  fd.append('structure', form.structure.trim())
  if (form.towerCount) fd.append('towerCount', String(form.towerCount))
  if (form.deliveryDate) fd.append('deliveryDate', form.deliveryDate)
  fd.append('isNewDevelopment', form.isNewDevelopment ? '1' : '0')
  fd.append('featured', form.featured ? '1' : '0')
  fd.append('launchStatus', form.launchStatus.trim())
  fd.append('propertyVisibility', form.propertyVisibility.trim())
  fd.append('cashbackEligible', form.cashbackEligible ? '1' : '0')
  fd.append('amenitiesText', form.amenitiesText)
  fd.append('landmarksText', form.landmarksText)
  fd.append('floorPlanNote', form.floorPlanNote.trim())
  fd.append('brochureUrl', form.brochureUrl.trim())
  if (form.latitude) fd.append('latitude', String(form.latitude))
  if (form.longitude) fd.append('longitude', String(form.longitude))
  fd.append('mapUrl', form.mapUrl.trim())
  fd.append('youtubeUrl', form.youtubeUrl.trim())
}

const fieldClass =
  'h-12 w-full rounded-[var(--radius-sm)] border border-slate-200 bg-white px-[18px] py-[14px] text-[15px] font-normal leading-snug text-slate-900 placeholder:text-sm placeholder:font-normal placeholder:text-slate-400 transition-all duration-300 hover:border-slate-300 focus:border-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-500/15 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.12)] disabled:cursor-not-allowed disabled:border-stone-200 disabled:bg-stone-100 disabled:text-slate-500'

const fieldClassTitle =
  'h-12 w-full rounded-[var(--radius-sm)] border border-slate-200 bg-white px-[18px] py-[14px] text-[15px] font-normal tracking-normal text-slate-900 placeholder:text-sm placeholder:font-normal placeholder:text-slate-400 transition-all duration-300 hover:border-slate-300 focus:border-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-500/15 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.12)] disabled:cursor-not-allowed disabled:border-stone-200 disabled:bg-stone-100'

const fieldClassPrice =
  'h-12 w-full rounded-[var(--radius-sm)] border border-slate-200 bg-white px-[18px] py-[14px] text-[15px] font-normal tabular-nums tracking-normal text-slate-900 placeholder:text-sm placeholder:font-normal placeholder:text-slate-400 transition-all duration-300 hover:border-slate-300 focus:border-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-500/15 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.12)] disabled:cursor-not-allowed disabled:border-stone-200 disabled:bg-stone-100'

const labelClass = 'mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.04em] text-slate-600'
const requiredMarkClass = 'ml-1 text-rose-600'

const sectionCardClass =
  'rounded-[var(--radius-md)] border border-slate-200 bg-white p-5 shadow-[var(--shadow-prestige)] sm:p-6 md:p-8'

const sectionHeadingClass = 'mb-5 text-xs font-bold uppercase tracking-[0.14em] text-slate-500'

const fileInputClass =
  'w-full rounded-[var(--radius-sm)] border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 transition-colors duration-300 hover:border-slate-300 file:mr-4 file:cursor-pointer file:rounded-[var(--radius-sm)] file:border-0 file:bg-slate-700 file:px-4 file:py-2.5 file:text-sm file:font-semibold file:text-white file:shadow-[var(--shadow-md)] file:transition file:duration-300 file:hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60'

const submitButtonClass =
  'inline-flex h-12 w-full items-center justify-center gap-2 rounded-[var(--radius-sm)] bg-slate-700 px-7 text-sm font-semibold uppercase tracking-[0.05em] text-white shadow-[var(--shadow-md)] transition-all duration-300 hover:bg-slate-800 hover:shadow-[var(--shadow-lg)] focus:outline-none focus:ring-4 focus:ring-slate-900/10 disabled:cursor-not-allowed disabled:opacity-60'

const errTextClass = 'mt-1.5 text-sm font-medium text-rose-700'

function FormSkeleton() {
  return (
    <div className="space-y-8 md:space-y-10" aria-busy="true" aria-label="Loading property">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className={`${sectionCardClass} animate-pulse`}>
          <div className="mb-5 h-3 w-28 rounded bg-stone-200" />
          <div className="grid gap-5 md:grid-cols-2">
            <div className="h-12 rounded-xl bg-stone-100 md:col-span-2" />
            <div className="h-12 rounded-xl bg-stone-100" />
            <div className="h-12 rounded-xl bg-stone-100" />
            <div className="h-28 rounded-xl bg-stone-100 md:col-span-2" />
          </div>
        </div>
      ))}
    </div>
  )
}

function SpinIcon() {
  return (
    <svg className="h-5 w-5 shrink-0 animate-spin text-white" viewBox="0 0 24 24" aria-hidden="true">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  )
}

export function PropertyForm() {
  const { propertyId } = useParams()
  const isEdit = Boolean(propertyId)
  const navigate = useNavigate()

  const [form, setForm] = useState(emptyPropertyForm)
  const [files, setFiles] = useState([])
  const [previewUrls, setPreviewUrls] = useState([])
  const [existingImages, setExistingImages] = useState([])
  const [floorPlanFiles, setFloorPlanFiles] = useState([])
  const [floorPlanPreviewUrls, setFloorPlanPreviewUrls] = useState([])
  const [existingFloorPlans, setExistingFloorPlans] = useState([])
  const [brochureFile, setBrochureFile] = useState(null)

  const [fetchLoading, setFetchLoading] = useState(isEdit)
  const [fetchError, setFetchError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const [dragExistingIndex, setDragExistingIndex] = useState(null)
  const [dragNewIndex, setDragNewIndex] = useState(null)

  useEffect(() => {
    return () => {
      previewUrls.forEach((u) => URL.revokeObjectURL(u))
      floorPlanPreviewUrls.forEach((u) => URL.revokeObjectURL(u))
    }
  }, [previewUrls, floorPlanPreviewUrls])

  useEffect(() => {
    if (!propertyId) {
      setFetchLoading(false)
      setExistingImages([])
      setExistingFloorPlans([])
      return
    }

    let cancelled = false

    async function load() {
      try {
        setFetchLoading(true)
        setFetchError('')
        const res = await api.get(`/api/properties/${propertyId}`)
        const raw = res.data?.data
        if (!raw || cancelled) return
        const data = normalizeProperty(raw)
        setForm(propertyToFormState(data))
        setExistingImages(Array.isArray(data.images) ? data.images : [])
        setExistingFloorPlans(Array.isArray(data.floorPlans) ? data.floorPlans : [])
        setFiles([])
        setPreviewUrls([])
        setFloorPlanFiles([])
        setFloorPlanPreviewUrls([])
        setBrochureFile(null)
        setFieldErrors({})
        setDragExistingIndex(null)
        setDragNewIndex(null)
      } catch {
        if (!cancelled) setFetchError('Failed to load property. Check the link or try again.')
      } finally {
        if (!cancelled) setFetchLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [propertyId])

  const formDisabled = fetchLoading || submitting

  const handleFilesChange = (e) => {
    const selected = Array.from(e.target.files || [])
    setFiles(selected)
    previewUrls.forEach((u) => URL.revokeObjectURL(u))
    const urls = selected.map((f) => URL.createObjectURL(f))
    setPreviewUrls(urls)
    setFieldErrors((prev) => {
      if (!prev.images) return prev
      const next = { ...prev }
      delete next.images
      return next
    })
  }

  const handleExistingImageDrop = (toIndex) => {
    if (dragExistingIndex == null) return
    setExistingImages((prev) => reorderItems(prev, dragExistingIndex, toIndex))
    setDragExistingIndex(null)
  }

  const handleNewImageDrop = (toIndex) => {
    if (dragNewIndex == null) return
    setFiles((prev) => reorderItems(prev, dragNewIndex, toIndex))
    setPreviewUrls((prev) => reorderItems(prev, dragNewIndex, toIndex))
    setDragNewIndex(null)
  }

  const handleFloorPlanFilesChange = (e) => {
    const selected = Array.from(e.target.files || [])
    setFloorPlanFiles(selected)
    floorPlanPreviewUrls.forEach((u) => URL.revokeObjectURL(u))
    const urls = selected.map((f) => URL.createObjectURL(f))
    setFloorPlanPreviewUrls(urls)
  }

  const handleBrochureFileChange = (e) => {
    const file = (e.target.files && e.target.files[0]) || null
    setBrochureFile(file)
  }

  const validate = () => {
    const err = {}
    if (!form.title.trim()) err.title = 'Title is required.'
    if (!hasPriceNumberAndText(form.price)) err.price = 'Enter list price like "80 Lakhs".'
    if (!form.location.trim()) err.location = 'Location is required.'
    const imageCount = existingImages.length + files.length
    if (imageCount < 1) err.images = 'At least one image is required. Add files or keep existing gallery images.'
    setFieldErrors(err)
    return Object.keys(err).length === 0
  }

  const clearFieldError = (key) => {
    setFieldErrors((prev) => {
      if (!prev[key]) return prev
      const next = { ...prev }
      delete next[key]
      return next
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitError('')
    if (!validate()) return

    try {
      setSubmitting(true)
      const fd = new FormData()
      appendPayload(fd, form)
      if (isEdit) fd.append('imageOrder', JSON.stringify(existingImages))
      files.forEach((f) => fd.append('images', f))
      floorPlanFiles.forEach((f) => fd.append('floorPlans', f))
      if (brochureFile) fd.append('brochure', brochureFile)

      if (isEdit) {
        await api.put(`/api/properties/${propertyId}`, fd)
      } else {
        const res = await api.post('/api/properties', fd)
        if (!res.data?.data) throw new Error('Unexpected response')
      }

      navigate('/admin/properties', {
        replace: false,
        state: {
          [ADMIN_TOAST_KEY]: isEdit ? 'Property updated successfully.' : 'Property created successfully.',
        },
      })
    } catch (err) {
      const data = err?.response?.data
      const msg = data?.message || data?.error
      setSubmitError(
        typeof msg === 'string' && msg.trim()
          ? msg
          : isEdit
            ? 'Failed to update property.'
            : 'Failed to create property.',
      )
    } finally {
      setSubmitting(false)
    }
  }

  if (fetchError) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 px-6 py-8 text-center">
        <p className="font-semibold text-rose-900">{fetchError}</p>
        <button
          type="button"
          onClick={() => navigate('/admin/properties')}
          className="mt-4 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
        >
          Back to properties
        </button>
      </div>
    )
  }

  if (fetchLoading && isEdit) {
    return <FormSkeleton />
  }

  return (
    <div className="space-y-6">
      {/* {import.meta.env.VITE_API_BASE_URL ? (
        <p className="text-xs font-medium text-slate-500">{import.meta.env.VITE_API_BASE_URL}</p>
      ) : null} */}
      <p className="max-w-2xl border-l-[3px] border-amber-400/90 pl-4 text-sm leading-relaxed text-slate-600">
        Title, price, location, and at least one image are required. Use multiline fields for amenities and landmarks as
        described below.
      </p>
      <p className="text-xs font-medium text-slate-600">
        Fields marked with <span className={requiredMarkClass}>*</span> are mandatory.
      </p>

      {submitError ? (
        <div
          className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-800 shadow-sm"
          role="alert"
        >
          {submitError}
        </div>
      ) : null}

      <form onSubmit={handleSubmit} className="space-y-8 md:space-y-10" aria-busy={submitting}>
        <div className={sectionCardClass}>
          <div className={sectionHeadingClass}>Basics</div>
          <div className="grid gap-x-6 gap-y-5 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className={labelClass} htmlFor="property-title">
                Title<span className={requiredMarkClass}>*</span>
              </label>
              <input
                id="property-title"
                type="text"
                value={form.title}
                onChange={(e) => {
                  setForm((s) => ({ ...s, title: e.target.value }))
                  clearFieldError('title')
                }}
                placeholder="e.g. Prestige Medavakkam Heights"
                disabled={formDisabled}
                className={fieldClassTitle}
                autoComplete="off"
                aria-invalid={Boolean(fieldErrors.title)}
                required
              />
              {fieldErrors.title ? <p className={errTextClass}>{fieldErrors.title}</p> : null}
            </div>
            <div>
              <label className={labelClass} htmlFor="property-price">
                List price (INR)<span className={requiredMarkClass}>*</span>
              </label>
              <input
                id="property-price"
                type="text"
                min={0}
                value={form.price}
                onChange={(e) => {
                  setForm((s) => ({ ...s, price: e.target.value }))
                  clearFieldError('price')
                }}
                placeholder="e.g. 25 Lakhs"
                disabled={formDisabled}
                className={fieldClassPrice}
                aria-invalid={Boolean(fieldErrors.price)}
                required
              />
              {fieldErrors.price ? <p className={errTextClass}>{fieldErrors.price}</p> : null}
            </div>
            <div>
              <label className={labelClass} htmlFor="property-currency">
                Currency
              </label>
              <select
                id="property-currency"
                value={form.currency}
                onChange={(e) => setForm((s) => ({ ...s, currency: e.target.value }))}
                disabled={formDisabled}
                className={fieldClass}
              >
                <option value="INR">INR</option>
                <option value="NGN">NGN</option>
                <option value="USD">USD</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Min price (optional range)</label>
              <input
                type="text"
                value={form.minPrice}
                onChange={(e) => setForm((s) => ({ ...s, minPrice: e.target.value }))}
                placeholder="e.g. 70Lakh"
                disabled={formDisabled}
                className={fieldClass}
              />
            </div>
            <div>
              <label className={labelClass}>Max price (optional range)</label>
              <input
                type="text"
                value={form.maxPrice}
                onChange={(e) => setForm((s) => ({ ...s, maxPrice: e.target.value }))}
                placeholder="e.g. 2Crore"
                disabled={formDisabled}
                className={fieldClass}
              />
            </div>
            <div className="md:col-span-2">
              <label className={labelClass}>Payment plan label</label>
              <input
                type="text"
                value={form.paymentPlan}
                onChange={(e) => setForm((s) => ({ ...s, paymentPlan: e.target.value }))}
                placeholder="e.g. Full payment"
                disabled={formDisabled}
                className={fieldClass}
              />
            </div>
            <div className="md:col-span-2">
              <label className={labelClass}>
                Location (short)<span className={requiredMarkClass}>*</span>
              </label>
              <input
                type="text"
                value={form.location}
                onChange={(e) => {
                  setForm((s) => ({ ...s, location: e.target.value }))
                  clearFieldError('location')
                }}
                placeholder="e.g. Medavakkam, Chennai"
                disabled={formDisabled}
                className={fieldClass}
                aria-invalid={Boolean(fieldErrors.location)}
                required
              />
              {fieldErrors.location ? <p className={errTextClass}>{fieldErrors.location}</p> : null}
            </div>
            <div className="md:col-span-2">
              <label className={labelClass}>Full address (map label)</label>
              <input
                type="text"
                value={form.addressLine}
                onChange={(e) => setForm((s) => ({ ...s, addressLine: e.target.value }))}
                placeholder="e.g. Medavakkam Main Road, Chennai – 600100"
                disabled={formDisabled}
                className={fieldClass}
              />
            </div>
            <div className="md:col-span-2">
              <label className={labelClass}>Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm((s) => ({ ...s, description: e.target.value }))}
                placeholder="Project description..."
                disabled={formDisabled}
                className={`${fieldClass} min-h-[120px] resize-y`}
              />
            </div>
          </div>
        </div>

        <div className={sectionCardClass}>
          <div className={sectionHeadingClass}>Status &amp; flags</div>
          <div className="grid gap-6 md:grid-cols-2 md:items-end">
            <div className="flex flex-wrap gap-x-8 gap-y-4">
              <label className="flex cursor-pointer items-center gap-3 text-sm font-medium text-slate-800">
                <input
                  type="checkbox"
                  checked={form.isNewDevelopment}
                  onChange={(e) => setForm((s) => ({ ...s, isNewDevelopment: e.target.checked }))}
                  disabled={formDisabled}
                  className="h-4 w-4 rounded border-[#d1d5db] text-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-0"
                />
                New development
              </label>
              <label className="flex cursor-pointer items-center gap-3 text-sm font-medium text-slate-800">
                <input
                  type="checkbox"
                  checked={form.featured}
                  onChange={(e) => setForm((s) => ({ ...s, featured: e.target.checked }))}
                  disabled={formDisabled}
                  className="h-4 w-4 rounded border-[#d1d5db] text-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-0"
                />
                Featured
              </label>
              <label className="flex cursor-pointer items-center gap-3 text-sm font-medium text-slate-800">
                <input
                  type="checkbox"
                  checked={form.cashbackEligible}
                  onChange={(e) => setForm((s) => ({ ...s, cashbackEligible: e.target.checked }))}
                  disabled={formDisabled}
                  className="h-4 w-4 rounded border-[#d1d5db] text-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-0"
                />
                Eligible for Cashback
              </label>
            </div>
            <div>
              <label className={labelClass}>Launch status badge</label>
              <select
                value={form.launchStatus}
                onChange={(e) => setForm((s) => ({ ...s, launchStatus: e.target.value }))}
                disabled={formDisabled}
                className={fieldClass}
              >
                <option value="">None</option>
                <option value="New Launch">New Launch</option>
                <option value="Ready to Move">Ready to Move</option>
                {/* <option value="Exclusive">Exclusive</option> */}
                <option value="Under Construction">Under Construction</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Property Visibility</label>
              <select
                value={form.propertyVisibility}
                onChange={(e) => setForm((s) => ({ ...s, propertyVisibility: e.target.value }))}
                disabled={formDisabled}
                className={fieldClass}
              >
                <option value="">None</option>
                <option value="Exclusive">Exclusive</option>
              </select>
            </div>
          </div>
        </div>

        <div className={sectionCardClass}>
          <div className={sectionHeadingClass}>Unit &amp; specs</div>
          <div className="grid gap-x-6 gap-y-5 md:grid-cols-2">
            <div className="space-y-2">
              <label className={labelClass}>Bedrooms</label>
              <input
                type="number"
                min={0}
                value={form.bedrooms}
                onChange={(e) => setForm((s) => ({ ...s, bedrooms: e.target.value }))}
                placeholder="e.g. 3"
                disabled={formDisabled}
                className={fieldClass}
              />
            </div>
            <div className="space-y-2">
              <label className={labelClass}>Bathrooms</label>
              <input
                type="number"
                min={0}
                value={form.bathrooms}
                onChange={(e) => setForm((s) => ({ ...s, bathrooms: e.target.value }))}
                placeholder="e.g. 2"
                disabled={formDisabled}
                className={fieldClass}
              />
            </div>
            <div className="space-y-2">
              <label className={labelClass}>Total Land Area</label>
              <input
                type="text"
                min={0}
                step="0.01"
                value={form.area}
                onChange={(e) => setForm((s) => ({ ...s, area: e.target.value }))}
                placeholder="e.g. 180"
                disabled={formDisabled}
                className={fieldClass}
              />
            </div>
              <div className="space-y-2">
              <label className={labelClass}>Super built-up min (sq ft)</label>
              <input
                type="number"
                min={0}
                value={form.areaSqftMin}
                onChange={(e) => setForm((s) => ({ ...s, areaSqftMin: e.target.value }))}
                placeholder="e.g. 1500"
                disabled={formDisabled}
                className={fieldClass}
              />
            </div>
            <div className="space-y-2">
              <label className={labelClass}>Super built-up max (sq ft)</label>
              <input
                type="number"
                min={0}
                value={form.areaSqftMax}
                onChange={(e) => setForm((s) => ({ ...s, areaSqftMax: e.target.value }))}
                placeholder="e.g. 2500"
                disabled={formDisabled}
                className={fieldClass}
              />
            </div>
            <div className="space-y-2">
              <label className={labelClass}>Land area (acres)</label>
              <input
                type="number"
                min={0}
                step="0.01"
                value={form.landAreaAcres}
                onChange={(e) => setForm((s) => ({ ...s, landAreaAcres: e.target.value }))}
                placeholder="e.g. 1"
                disabled={formDisabled}
                className={fieldClass}
              />
            </div>
            <div className="space-y-2">
              <label className={labelClass}>Type</label>
              <select
                value={form.type}
                onChange={(e) => setForm((s) => ({ ...s, type: e.target.value }))}
                disabled={formDisabled}
                className={fieldClass}
              >
                <option value="">Select type</option>
                <option value="Apartment">Apartment</option>
                <option value="House">House</option>
                <option value="Villa">Villa</option>
                <option value="Condo">Condo</option>
                <option value="Townhouse">Townhouse</option>
              </select>
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className={labelClass}>Builder</label>
              <input
                type="text"
                value={form.builder}
                onChange={(e) => setForm((s) => ({ ...s, builder: e.target.value }))}
                placeholder="Developer name"
                disabled={formDisabled}
                className={fieldClass}
              />
            </div>
            <div className="space-y-2">
              <label className={labelClass}>No. of units</label>
              <input
                type="number"
                min={0}
                value={form.unitsCount}
                onChange={(e) => setForm((s) => ({ ...s, unitsCount: e.target.value }))}
                placeholder="e.g. 248"
                disabled={formDisabled}
                className={fieldClass}
              />
            </div>
            <div className="space-y-2">
              <label className={labelClass}>Price / sqft min (₹)</label>
              <input
                type="number"
                min={0}
                value={form.pricePerSqftMin}
                onChange={(e) => setForm((s) => ({ ...s, pricePerSqftMin: e.target.value }))}
                placeholder="e.g. 5800"
                disabled={formDisabled}
                className={fieldClass}
              />
            </div>
            <div className="space-y-2">
              <label className={labelClass}>Price / sqft max (₹)</label>
              <input
                type="number"
                min={0}
                value={form.pricePerSqftMax}
                onChange={(e) => setForm((s) => ({ ...s, pricePerSqftMax: e.target.value }))}
                placeholder="e.g. 6400"
                disabled={formDisabled}
                className={fieldClass}
              />
            </div>
            <div className="space-y-2">
              <label className={labelClass}>Structure</label>
              <input
                type="text"
                value={form.structure}
                onChange={(e) => setForm((s) => ({ ...s, structure: e.target.value }))}
                placeholder="e.g. G + 5 Floors"
                disabled={formDisabled}
                className={fieldClass}
              />
            </div>
            <div className="space-y-2">
              <label className={labelClass}>Tower count</label>
              <input
                type="number"
                min={0}
                value={form.towerCount}
                onChange={(e) => setForm((s) => ({ ...s, towerCount: e.target.value }))}
                placeholder="e.g. 4"
                disabled={formDisabled}
                className={fieldClass}
              />
            </div>
            <div className="space-y-2">
              <label className={labelClass}>Handover date</label>
              <input
                type="date"
                value={form.deliveryDate}
                onChange={(e) => setForm((s) => ({ ...s, deliveryDate: e.target.value }))}
                disabled={formDisabled}
                className={fieldClass}
              />
            </div>
          </div>
        </div>

        <div className={sectionCardClass}>
          <div className={sectionHeadingClass}>Amenities &amp; landmarks</div>
          <div className="grid gap-x-6 gap-y-5 md:grid-cols-2">
            <div className="space-y-2">
              <label className={labelClass}>Amenities (one per line)</label>
              <textarea
                value={form.amenitiesText}
                onChange={(e) => setForm((s) => ({ ...s, amenitiesText: e.target.value }))}
                placeholder={'Swimming Pool\nGymnasium\nClubhouse'}
                disabled={formDisabled}
                className={`${fieldClass} min-h-[140px] resize-y font-mono text-sm leading-relaxed`}
              />
            </div>
            <div className="space-y-2">
              <label className={labelClass}>Nearby landmarks</label>
              <textarea
                value={form.landmarksText}
                onChange={(e) => setForm((s) => ({ ...s, landmarksText: e.target.value }))}
                placeholder={'Airport name | 10 km\nSchool name | 2 km'}
                disabled={formDisabled}
                className={`${fieldClass} min-h-[140px] resize-y font-mono text-sm leading-relaxed`}
              />
              <p className="text-xs leading-relaxed text-slate-600">
                Format each line:{' '}
                <code className="rounded bg-stone-100 px-1.5 py-0.5 text-[13px] text-slate-800">Name | distance</code>{' '}
                (optional third part for icon id).
              </p>
            </div>
          </div>
        </div>

        <div className={sectionCardClass}>
          <div className={sectionHeadingClass}>Media &amp; links</div>
          <div className="space-y-5">
            <div className="space-y-2">
              <label className={labelClass}>Map embed URL</label>
              <input
                type="url"
                value={form.mapUrl}
                onChange={(e) => setForm((s) => ({ ...s, mapUrl: e.target.value }))}
                placeholder="Google Maps embed https://..."
                disabled={formDisabled}
                className={fieldClass}
              />
            </div>
            <div className="grid gap-x-6 gap-y-5 md:grid-cols-2">
              <div className="space-y-2">
                <label className={labelClass}>Latitude (fallback map)</label>
                <input
                  type="number"
                  step="any"
                  value={form.latitude}
                  onChange={(e) => setForm((s) => ({ ...s, latitude: e.target.value }))}
                  placeholder="e.g. 12.9716"
                  disabled={formDisabled}
                  className={fieldClass}
                />
              </div>
              <div className="space-y-2">
                <label className={labelClass}>Longitude (fallback map)</label>
                <input
                  type="number"
                  step="any"
                  value={form.longitude}
                  onChange={(e) => setForm((s) => ({ ...s, longitude: e.target.value }))}
                  placeholder="e.g. 77.5946"
                  disabled={formDisabled}
                  className={fieldClass}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className={labelClass}>YouTube URL (tour)</label>
              <input
                type="url"
                value={form.youtubeUrl}
                onChange={(e) => setForm((s) => ({ ...s, youtubeUrl: e.target.value }))}
                placeholder="https://www.youtube.com/watch?v=..."
                disabled={formDisabled}
                className={fieldClass}
              />
            </div>
            <div className="space-y-2">
              <label className={labelClass}>Brochure (PDF file)</label>
              {form.brochureUrl ? (
                <a
                  href={form.brochureUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-block truncate rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-xs font-medium text-blue-700 underline hover:text-blue-900"
                >
                  View current brochure
                </a>
              ) : (
                <p className="text-xs text-slate-600">No brochure uploaded yet.</p>
              )}
              <input
                type="file"
                name="brochure"
                accept="application/pdf"
                onChange={handleBrochureFileChange}
                disabled={formDisabled}
                className={fileInputClass}
              />
              <p className="text-xs text-slate-600">
                Uploading a new file will replace the existing brochure (if any).
              </p>
            </div>
          </div>
        </div>

        <div className={sectionCardClass}>
          <div className={sectionHeadingClass}>Floor plans (files)</div>
          {existingFloorPlans.length ? (
            <div className="mb-4">
              <p className="mb-2 text-sm font-medium text-slate-700">Current floor plans (new files append)</p>
              <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4">
                {existingFloorPlans.map((url, idx) => (
                  <a
                    key={url + String(idx)}
                    href={url}
                    target="_blank"
                    rel="noreferrer"
                    className="truncate rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-xs font-medium text-blue-700 underline hover:text-blue-900"
                  >
                    File {idx + 1}
                  </a>
                ))}
              </div>
            </div>
          ) : null}
          <div className="space-y-2">
            <label className={labelClass}>Floor plan files (images or PDF)</label>
            <input
              type="file"
              name="floorPlans"
              multiple
              accept="image/*,application/pdf"
              onChange={handleFloorPlanFilesChange}
              disabled={formDisabled}
              className={fileInputClass}
            />
          </div>
          {floorPlanPreviewUrls.length ? (
            <div className="mt-4 grid gap-3 sm:grid-cols-2 md:grid-cols-4">
              {floorPlanPreviewUrls.map((u, idx) => (
                <div
                  key={u + String(idx)}
                  className="aspect-[4/3] overflow-hidden rounded-xl border border-[#d1d5db] bg-stone-50 shadow-sm"
                >
                  <img src={u} alt={`floor-plan-preview-${idx + 1}`} className="h-full w-full object-cover" />
                </div>
              ))}
            </div>
          ) : null}
          <div className="mt-6 space-y-2">
            <label className={labelClass}>Floor plan note</label>
            <input
              type="text"
              value={form.floorPlanNote}
              onChange={(e) => setForm((s) => ({ ...s, floorPlanNote: e.target.value }))}
              placeholder="Optional note"
              disabled={formDisabled}
              className={fieldClass}
            />
          </div>
        </div>

        <div className={sectionCardClass}>
          <div className={sectionHeadingClass}>Gallery images</div>
          <p className="mb-3 text-xs text-slate-600">Drag and drop image cards to set display order.</p>
          {existingImages.length ? (
            <div className="mb-4">
              <p className="mb-2 text-sm font-medium text-slate-700">Current gallery</p>
              <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4">
                {existingImages.map((url, idx) => (
                  <div
                    key={url + String(idx)}
                    className="group relative aspect-[4/3] cursor-move overflow-hidden rounded-xl border border-[#d1d5db] bg-stone-50 shadow-sm"
                    draggable
                    onDragStart={() => setDragExistingIndex(idx)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={() => handleExistingImageDrop(idx)}
                    onDragEnd={() => setDragExistingIndex(null)}
                  >
                    <img src={url} alt={`Existing ${idx + 1}`} className="h-full w-full object-cover" loading="lazy" />
                    <span className="absolute left-2 top-2 rounded bg-black/60 px-2 py-0.5 text-xs font-semibold text-white">
                      {idx + 1}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
          <div className="space-y-2">
            <label className={labelClass}>
              {isEdit ? 'Add more images (optional)' : 'Images (up to 10)'}
              {!isEdit ? <span className={requiredMarkClass}>*</span> : null}
            </label>
            <input
              type="file"
              name="images"
              multiple
              accept="image/*"
              onChange={handleFilesChange}
              disabled={formDisabled}
              className={fileInputClass}
              required={!isEdit}
              aria-invalid={Boolean(fieldErrors.images)}
            />
            {fieldErrors.images ? <p className={errTextClass}>{fieldErrors.images}</p> : null}
            {isEdit ? (
              <p className="text-xs text-slate-600">New uploads are appended to the gallery. At least one image must remain in total.</p>
            ) : null}
          </div>
          {previewUrls.length ? (
            <div className="mt-4 grid gap-3 sm:grid-cols-2 md:grid-cols-4">
              {previewUrls.map((u, idx) => (
                <div
                  key={u + String(idx)}
                  className="relative aspect-[4/3] cursor-move overflow-hidden rounded-xl border border-[#d1d5db] bg-stone-50 shadow-sm"
                  draggable
                  onDragStart={() => setDragNewIndex(idx)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => handleNewImageDrop(idx)}
                  onDragEnd={() => setDragNewIndex(null)}
                >
                  <img src={u} alt={`preview-${idx + 1}`} className="h-full w-full object-cover" />
                  <span className="absolute left-2 top-2 rounded bg-black/60 px-2 py-0.5 text-xs font-semibold text-white">
                    {idx + 1}
                  </span>
                </div>
              ))}
            </div>
          ) : null}
        </div>

        <button type="submit" disabled={formDisabled} className={submitButtonClass}>
          {submitting ? <SpinIcon /> : null}
          {isEdit ? 'Update Property' : 'Create Property'}
        </button>
      </form>
    </div>
  )
}
