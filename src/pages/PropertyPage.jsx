import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeftIcon,
  MapPinIcon,
  BuildingOffice2Icon,
  AcademicCapIcon,
  HeartIcon,
  TruckIcon,
  PhoneIcon,
  PlayIcon,
  DocumentArrowDownIcon,
  RectangleStackIcon,
  CalendarDaysIcon,
  CheckIcon,
} from '@heroicons/react/24/outline'
import { ContactForm } from '../components/ContactForm'
import { ImageCarousel } from '../components/ImageCarousel'
import { WhatsAppButton } from '../components/WhatsAppButton'
import { formatPropertyDisplayPrice } from '../data/properties'
import { api, normalizeProperty } from '../services/api'
import {
  handlePhonePaste,
  isValidPhoneValue,
  PHONE_PATTERN_ATTR,
  PHONE_VALIDATION_MESSAGE,
  sanitizePhoneInputValue,
} from '../utils/phoneInput'
import { toGoogleMapsEmbedUrl, toGoogleMapsOpenUrl } from '../utils/googleMapsEmbed'

const WA_PHONE = '+919080895163'

const sanitizePayload = (payload) =>
  Object.fromEntries(
    Object.entries(payload).filter(([, value]) => {
      if (value == null) return false
      if (typeof value === 'string') return value.trim() !== ''
      return true
    }).map(([key, value]) => [key, typeof value === 'string' ? value.trim() : value])
  )

const extractYouTubeVideoId = (url) => {
  if (!url) return null
  const match = url.match(/(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/)
  return match ? match[1] : null
}

function formatINRPlain(n) {
  if (n == null || n === '' || Number.isNaN(Number(n))) return null
  return new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(Number(n))
}

function toPositiveNumber(v) {
  if (v == null || v === '') return null
  const n = Number(v)
  return Number.isFinite(n) && n > 0 ? n : null
}

function formatSqftRange(minValue, maxValue) {
  const min = toPositiveNumber(minValue)
  const max = toPositiveNumber(maxValue)
  const minText = min != null ? formatINRPlain(min) : null
  const maxText = max != null ? formatINRPlain(max) : null
  if (minText && maxText) return `${minText} – ${maxText} sqft`
  if (minText) return `${minText} sqft`
  if (maxText) return `${maxText} sqft`
  return null
}

function formatPricePerSqftRange(minValue, maxValue) {
  const min = toPositiveNumber(minValue)
  const max = toPositiveNumber(maxValue)
  const minText = min != null ? formatINRPlain(min) : null
  const maxText = max != null ? formatINRPlain(max) : null
  if (minText && maxText) return `₹${minText} – ₹${maxText}`
  if (minText) return `₹${minText}`
  if (maxText) return `₹${maxText}`
  return null
}

function isHttpUrl(s) {
  return typeof s === 'string' && /^https?:\/\//i.test(s.trim())
}

function specChipsFromProperty(p, completionLabel) {
  const chips = [
    { label: 'Type', value: p.type || null },
    { label: 'Bedrooms', value: p.bedrooms != null && p.bedrooms !== '' ? String(p.bedrooms) : null },
    { label: 'Bathrooms', value: p.bathrooms != null && p.bathrooms !== '' ? String(p.bathrooms) : null },
    {
      label: 'Total Land Area',
      value: p.area
    },
    { label: 'No. of units', value: p.unitsCount != null ? `${p.unitsCount} Units` : null },
    { label: 'Completion', value: completionLabel },
    {
      label: 'Price / sqft',
      value: formatPricePerSqftRange(p.pricePerSqftMin, p.pricePerSqftMax),
    },
    { label: 'Structure', value: p.structure || null },
    { label: 'Towers', value: p.towerCount != null ? `${p.towerCount} Towers` : null },
  ]
  return chips.filter((c) => c.value)
}

export function PropertyPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [property, setProperty] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [brochureOpen, setBrochureOpen] = useState(false)
  const [brochureName, setBrochureName] = useState('')
  const [brochureMobile, setBrochureMobile] = useState('')
  const [brochureSubmitting, setBrochureSubmitting] = useState(false)
  const [brochureFieldErrors, setBrochureFieldErrors] = useState({ name: '', phone: '' })
  const [brochureFormError, setBrochureFormError] = useState('')

  useEffect(() => {
    if (!id) return

    setLoading(true)
    setError('')

    api
      .get(`/api/property/${id}`)
      .then((res) => {
        setProperty(normalizeProperty(res.data?.data))
      })
      .catch(() => {
        setError('Failed to load property.')
        setProperty(null)
      })
      .finally(() => setLoading(false))
  }, [id])

  const completionDateLabel = property?.deliveryDate
    ? new Date(property.deliveryDate).toLocaleDateString('en-IN', {
        month: 'short',
        year: 'numeric',
      })
    : 'Immediate'

  const scrollToSection = (id) => {
    const target = document.getElementById(id)
    if (!target) return

    const header = document.querySelector('.main-header')
    const headerHeight = header?.offsetHeight ?? 80
    const getTargetTop = () =>
      Math.max(target.getBoundingClientRect().top + window.scrollY - headerHeight - 20, 0)

    // Smoothly move toward the section first.
    window.scrollTo({ top: getTargetTop(), behavior: 'smooth' })

    // Then snap precisely once layout/sticky calculations settle.
    setTimeout(() => {
      window.scrollTo({ top: getTargetTop(), behavior: 'auto' })
    }, 320)
  }

  const scrollToMap = () => {
    scrollToSection('property-map')
  }

  const scrollToInquiry = () => {
    scrollToSection('property-inquiry')
  }

  const scrollToSchedule = () => {
    scrollToSection('property-schedule')
  }

  const openBrochureModal = () => {
    setBrochureFieldErrors({ name: '', phone: '' })
    setBrochureFormError('')
    setBrochureOpen(true)
  }

  const closeBrochureModal = () => {
    if (brochureSubmitting) return
    setBrochureOpen(false)
  }

  const submitBrochureLead = async () => {
    setBrochureFieldErrors({ name: '', phone: '' })
    setBrochureFormError('')

    const name = brochureName.trim()
    const phone = brochureMobile.trim()
    const fe = { name: '', phone: '' }

    if (!brochureName.trim()) {
      fe.name = 'Name is required'
    }
    if (!phone) {
      fe.phone = 'Phone Number is required'
    } else if (!isValidPhoneValue(brochureMobile)) {
      fe.phone = PHONE_VALIDATION_MESSAGE
    }

    if (fe.name || fe.phone) {
      setBrochureFieldErrors(fe)
      return
    }

    try {
      setBrochureSubmitting(true)
      const brochurePayload = sanitizePayload({
        name,
        phone,
        sheetName: 'Brochure Leads',
        propertyName: property?.title,
        propertyLocation: property?.location,
        propertyType: property?.type,
      })
      const res = await api.post(`/api/property/${id}/brochure-lead`, brochurePayload)
      const downloadUrl = res?.data?.data?.downloadUrl
      if (!downloadUrl) {
        setBrochureFormError('Unable to start download. Please try again.')
        return
      }

      setBrochureOpen(false)
      // Trigger a real browser navigation so the file can download.
      // window.location.assign(downloadUrl)
      window.location.assign(
        `${import.meta.env.VITE_API_BASE_URL}${downloadUrl}`
      )
    } catch (e) {
      const msg =
        (typeof e?.response?.data?.message === 'string' && e.response.data.message.trim()) ||
        'Unable to start download. Please try again.'
      setBrochureFormError(msg)
    } finally {
      setBrochureSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-neutral-50)]">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[var(--color-accent)] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="font-sans text-sm text-[var(--color-neutral-500)]">Loading property...</p>
        </div>
      </div>
    )
  }

  if (error || !property) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-neutral-50)]">
        <div className="text-center max-w-md px-6">
          <h2 className="font-serif text-2xl text-[var(--color-primary)] mb-4">Property Not Found</h2>
          <p className="font-sans text-sm text-[var(--color-neutral-500)] mb-6">
            {error || "We couldn't find the property you're looking for."}
          </p>
          <button type="button" onClick={() => navigate('/listings')} className="luxury-button luxury-button-primary">
            Browse Properties
          </button>
        </div>
      </div>
    )
  }

  const priceBar = formatPropertyDisplayPrice(property)
  const priceBarWithRupee =
    property.currency === 'INR' &&
    priceBar !== '—' &&
    !String(priceBar).startsWith('₹') &&
    !String(priceBar).startsWith('Rs') &&
    !String(priceBar).startsWith('INR')
      ? `₹ ${priceBar}`
      : priceBar

  const sqftBar = formatSqftRange(property.areaSqftMin, property.areaSqftMax) || (property.areaSqm != null ? `${property.areaSqm} m²` : '—')

  const rawMapUrl = property.mapUrl != null ? String(property.mapUrl).trim() : ''
  const hasLatLngFields =
    property.latitude != null &&
    property.longitude != null &&
    String(property.latitude).trim() !== '' &&
    String(property.longitude).trim() !== ''
  const mapEmbedSrc = toGoogleMapsEmbedUrl(property.mapUrl, property.latitude, property.longitude)
  const mapOpenUrl = toGoogleMapsOpenUrl(property.mapUrl)
  const hadMapIntent = Boolean(rawMapUrl) || hasLatLngFields
  const showMapSection =
    (property.nearbyLandmarks?.length ?? 0) > 0 || Boolean(rawMapUrl) || hasLatLngFields

  const ytId = property.youtubeUrl ? extractYouTubeVideoId(property.youtubeUrl) : null
  const specChips = specChipsFromProperty(property, completionDateLabel)
  const waMsg = `I am interested in this property: ${property.title}, ${property.location}`

  return (
    <div className="property-detail-page pb-24 lg:pb-10">
      <div className="property-page-section__topbar border-b border-[var(--color-neutral-200)]">
        <div className="luxury-container max-w-[1180px] py-4">
          <button
            type="button"
            onClick={() => navigate('/listings')}
            className="inline-flex items-center gap-2 font-sans text-sm text-[var(--color-neutral-500)] hover:text-[var(--color-primary)] transition"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            Back to Listings
          </button>
        </div>
      </div>

      <div className="property-page-section__header border-b border-[var(--color-neutral-200)]">
        <div className="luxury-container max-w-[1180px] py-8">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                {property.isNewDevelopment && !property.launchStatus ? (
                  <span
                    className="inline-flex items-center px-3.5 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wider text-white"
                    style={{ background: 'var(--color-accent)' }}
                  >
                    New Development
                  </span>
                ) : null}
                {property.type ? (
                  <span className="luxury-badge luxury-badge-outline border-[var(--color-neutral-200)] text-[var(--color-primary)]">
                    {property.type}
                  </span>
                ) : null}
              </div>
              <h1 className="font-serif text-[clamp(1.75rem,4vw,2.75rem)] font-medium text-[var(--color-primary)] leading-tight tracking-tight">
                {property.title}
              </h1>
              <p className="font-sans text-sm text-[var(--color-neutral-500)] mt-2">{property.location}</p>
              {property.deliveryDate ? (
                <p className="font-sans text-xs text-[var(--color-neutral-400)] mt-1">
                  Handover Date{' '}
                  {new Date(property.deliveryDate).toLocaleDateString('en-IN', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  })}
                </p>
              ) : null}
            </div>
            <div className="lg:text-right shrink-0">
              <p className="font-serif text-2xl sm:text-3xl text-[var(--color-primary)]">{priceBarWithRupee}</p>
              <p className="font-sans text-[10px] font-semibold uppercase tracking-wider text-[var(--color-neutral-500)] mt-1">
                {property.paymentPlan || 'Full payment'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="luxury-container max-w-[1180px] py-8 px-4 sm:px-6 lg:px-8">
        <section className="rounded-[var(--radius-md)] overflow-hidden shadow-[var(--shadow-prestige)] border border-[var(--color-neutral-200)] bg-white mb-5">
          <ImageCarousel
            images={property.images}
            alt={property.title}
            cashbackEligible={property.cashbackEligible}
            launchStatus={property.launchStatus}
            onBookSiteVisit={scrollToSchedule}
          />
        </section>

        <div className="prestige-card p-5 sm:p-6 mb-8 flex flex-col lg:flex-row flex-wrap gap-6 lg:gap-10 lg:items-center lg:justify-between">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 flex-1">
            <div>
              <div className="font-sans text-[10.5px] font-semibold uppercase tracking-wider text-[var(--color-neutral-500)] mb-1">
                Price range
              </div>
              <div className="font-serif text-xl text-[var(--color-primary)]">{priceBarWithRupee}</div>
            </div>
            <div>
              <div className="font-sans text-[10.5px] font-semibold uppercase tracking-wider text-[var(--color-neutral-500)] mb-1">
                Super built-up area
              </div>
              <div className="font-serif text-xl text-[var(--color-primary)]">{sqftBar}</div>
            </div>
            <div>
              <div className="font-sans text-[10.5px] font-semibold uppercase tracking-wider text-[var(--color-neutral-500)] mb-1">
                Location
              </div>
              <div className="font-serif text-lg text-[var(--color-primary)] leading-snug">{property.location || '—'}</div>
            </div>
          </div>
          <button
            type="button"
            onClick={scrollToMap}
            className="inline-flex items-center gap-2 self-start rounded-lg px-4 py-2.5 font-sans text-sm font-medium text-white transition hover:opacity-95"
            style={{ background: 'var(--color-primary)' }}
          >
            <MapPinIcon className="w-5 h-5 text-[var(--color-accent-light)]" />
            View area pin
          </button>
        </div>

        <div className="grid lg:grid-cols-[1fr_300px] gap-8 lg:gap-10 items-start">
          <div className="space-y-8 min-w-0">
            {specChips.length > 0 ? (
              <section className="property-page-section__panel p-6 sm:p-8">
                <h2 className="font-serif text-xl text-[var(--color-primary)] mb-5 card-title-rule">Project details</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {specChips.map((chip) => (
                    <div
                      key={chip.label}
                      className="rounded-lg border px-3.5 py-3 transition hover:border-[var(--color-accent-light)]"
                      style={{
                        background: 'var(--color-secondary-200)',
                        borderColor: 'var(--color-neutral-200)',
                      }}
                    >
                      <div className="font-sans text-[10px] font-semibold uppercase tracking-wider text-[var(--color-neutral-500)] mb-1">
                        {chip.label}
                      </div>
                      <div className="font-serif text-base text-[var(--color-primary)] leading-tight">{chip.value}</div>
                    </div>
                  ))}
                </div>
              </section>
            ) : null}

            {property.description ? (
              <section className="property-page-section__panel p-6 sm:p-8">
                <h2 className="font-serif text-xl text-[var(--color-primary)] mb-4 card-title-rule">About this property</h2>
                <p className="font-sans text-[15px] text-[var(--color-neutral-600)] leading-relaxed">{property.description}</p>
              </section>
            ) : null}

            {property.amenities?.length > 0 ? (
              <section className="property-page-section__panel p-6 sm:p-8">
                <h2 className="font-serif text-xl text-[var(--color-primary)] mb-5 card-title-rule">Amenities</h2>
                <div
                  className="grid gap-3"
                  style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))' }}
                >
                  {property.amenities.map((amenity) => (
                    <div
                      key={amenity}
                      className="flex flex-col items-center gap-2 rounded-[10px] border px-2 py-4 text-center transition hover:border-[var(--color-accent-light)] hover:-translate-y-0.5"
                      style={{
                        background: 'var(--color-secondary-200)',
                        borderColor: 'var(--color-neutral-200)',
                      }}
                    >
                      <CheckIcon className="w-7 h-7 text-[var(--color-accent)]" />
                      <span className="font-sans text-[11px] font-medium text-[var(--color-primary)] leading-snug">{amenity}</span>
                    </div>
                  ))}
                </div>
              </section>
            ) : null}

            {showMapSection ? (
              <section
                id="property-map"
                className="rounded-[var(--radius-md)] border border-[var(--color-neutral-200)] bg-[var(--color-secondary-200)] p-4 sm:p-5 lg:p-6"
              >
                <div className="mb-4 sm:mb-5">
                  <h2 className="font-serif text-[22px] leading-tight text-[var(--color-primary)]">Prime Location Highlights</h2>
                  <p className="mt-1 font-sans text-sm text-[var(--color-neutral-500)]">
                    Close to key transit, schools, and daily essentials
                  </p>
                </div>

                <div className="flex flex-col lg:flex-row lg:items-start gap-5">
                  {property.nearbyLandmarks?.length > 0 ? (
                    <div className="lg:basis-[40%] lg:max-w-[40%] min-w-0">
                      <ul className="flex flex-col gap-2 rounded-xl border border-[var(--color-neutral-200)] bg-white p-2">
                        {property.nearbyLandmarks.slice(0, 6).map((lm, idx) => {
                          const iconSet = [TruckIcon, AcademicCapIcon, HeartIcon, BuildingOffice2Icon]
                          const LandmarkIcon = iconSet[idx % iconSet.length]
                          return (
                            <li
                              key={lm.name + (lm.distance || '')}
                              className="group flex items-center gap-3 rounded-lg px-2.5 py-2 transition-colors hover:bg-[var(--color-secondary-200)]"
                            >
                              <span
                                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border"
                                style={{
                                  background: 'var(--color-secondary-200)',
                                  borderColor: 'var(--color-neutral-200)',
                                }}
                              >
                                <LandmarkIcon className="h-4.5 w-4.5 text-[var(--color-accent)]" />
                              </span>
                              <span className="font-sans text-[13px] text-[var(--color-primary)] leading-snug flex-1">{lm.name}</span>
                              <span className="font-sans text-xs font-semibold text-[var(--color-neutral-500)] whitespace-nowrap">
                                {lm.distance || 'Nearby'}
                              </span>
                            </li>
                          )
                        })}
                      </ul>

                      <div className="mt-3 inline-flex items-center rounded-full border border-[var(--color-neutral-200)] bg-white px-3 py-1.5">
                        <span className="font-sans text-[11px] font-semibold uppercase tracking-wide text-[var(--color-primary)]">
                          Prime Location
                        </span>
                      </div>
                    </div>
                  ) : null}

                  <div className="lg:basis-[60%] lg:max-w-[60%] flex-1 min-w-0">
                    <div className="relative isolate overflow-hidden rounded-xl border border-[var(--color-neutral-200)] bg-white">
                      <div className="h-[240px] sm:h-[260px] bg-[var(--color-secondary-200)]">
                        {mapEmbedSrc ? (
                          <iframe
                            title="Property location"
                            src={mapEmbedSrc}
                            className="h-full w-full border-0"
                            loading="lazy"
                            allowFullScreen
                            referrerPolicy="no-referrer-when-downgrade"
                          />
                        ) : (
                          <div className="flex h-full flex-col items-center justify-center gap-3 p-6 text-center">
                            {hadMapIntent ? (
                              <>
                                <p className="font-sans text-sm text-[var(--color-neutral-500)]">
                                  Map preview isn&apos;t available for this link. Open the location in Google Maps
                                  instead.
                                </p>
                                {mapOpenUrl ? (
                                  <a
                                    href={mapOpenUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="font-sans text-sm font-medium text-[var(--color-accent)] underline-offset-2 hover:underline"
                                  >
                                    Open in Google Maps
                                  </a>
                                ) : hasLatLngFields ? (
                                  <p className="font-sans text-xs text-[var(--color-neutral-400)]">
                                    Check latitude and longitude in admin, or add an embeddable map URL.
                                  </p>
                                ) : null}
                              </>
                            ) : (
                              <p className="font-sans text-sm text-[var(--color-neutral-500)]">Map coming soon</p>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-black/60 via-black/35 to-transparent px-4 py-3">
                        <div className="text-white">
                          <div className="min-w-0">
                            <div className="truncate font-sans text-sm font-semibold">{property.title}</div>
                            <div className="truncate font-sans text-xs text-white/85">{property.addressLine || property.location}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            ) : null}

            {ytId ? (
              <section className="property-page-section__panel p-6 sm:p-8">
                <h2 className="font-serif text-xl text-[var(--color-primary)] mb-4 card-title-rule">Virtual tour</h2>
                <div className="aspect-video overflow-hidden rounded-lg border border-[var(--color-neutral-200)] bg-[var(--color-primary)]">
                  <iframe
                    src={`https://www.youtube.com/embed/${ytId}`}
                    title="Virtual tour"
                    className="h-full w-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              </section>
            ) : null}
          </div>

          <aside className="lg:sticky lg:top-24 space-y-6">
            <div
              className="bg-white rounded-xl p-5 border border-gray-200 transition-all duration-300 relative hover:-translate-y-1"
              style={{
                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.08), 0 2px 6px rgba(0, 0, 0, 0.05)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.12), 0 4px 10px rgba(0,0,0,0.08)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.08), 0 2px 6px rgba(0, 0, 0, 0.05)'
              }}
            >
              <h3 className="font-serif text-lg text-[var(--color-primary)] mb-1">Downloads &amp; actions</h3>
              <div className="flex flex-col gap-3 mt-4">
                {property.brochureUrl && isHttpUrl(property.brochureUrl) ? (
                  <button
                    type="button"
                    onClick={openBrochureModal}
                    className="flex items-center gap-3 rounded-lg border border-[var(--color-neutral-200)] bg-[var(--color-secondary-200)] px-3 py-3 text-left text-sm font-medium text-[var(--color-primary)] transition hover:border-[var(--color-accent)]"
                  >
                    <DocumentArrowDownIcon className="h-6 w-6 shrink-0 text-[var(--color-accent)]" />
                    <span>Project brochure</span>
                  </button>
                ) : null}
                {property.floorPlans?.some((fp) => isHttpUrl(fp)) ? (
                  <a
                    href={property.floorPlans.find((fp) => isHttpUrl(fp))}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-3 rounded-lg border border-[var(--color-neutral-200)] bg-[var(--color-secondary-200)] px-3 py-3 text-left text-sm font-medium text-[var(--color-primary)] transition hover:border-[var(--color-accent)]"
                  >
                    <RectangleStackIcon className="h-6 w-6 shrink-0 text-[var(--color-accent)]" />
                    <span>Floor plan</span>
                  </a>
                ) : null}

                <button
                  type="button"
                  onClick={scrollToSchedule}
                  className="flex w-full items-center gap-3 rounded-lg border border-[var(--color-neutral-200)] bg-[var(--color-secondary-200)] px-3 py-3 text-left text-sm font-medium text-[var(--color-primary)] transition hover:border-[var(--color-accent)]"
                >
                  <CalendarDaysIcon className="h-6 w-6 shrink-0 text-[var(--color-accent)]" />
                  <span>Book site visit</span>
                </button>

                <button
                  type="button"
                  // onClick={scrollToInquiry}
                  onClick={() => navigate('/contact')}
                  className="flex w-full items-center gap-3 rounded-lg border border-[var(--color-neutral-200)] bg-white px-3 py-3 text-left text-sm font-medium text-[var(--color-primary)] transition hover:border-[var(--color-accent)]"
                >
                  <PhoneIcon className="h-5 w-5 shrink-0 text-[var(--color-accent)]" />
                  <span>Contact us</span>
                </button>
              </div>
            </div>

            {/* {ytId ? (
              <a
                href={property.youtubeUrl}
                target="_blank"
                rel="noreferrer"
                className="block overflow-hidden rounded-[var(--radius-md)] border border-[var(--color-neutral-200)] shadow-[var(--shadow-prestige)] no-underline"
                style={{ background: 'var(--color-primary)' }}
              >
                <div className="relative flex aspect-video flex-col items-center justify-center gap-3 px-4">
                  <div className="flex h-[62px] w-[62px] items-center justify-center rounded-full bg-[#ff3b30] shadow-[0_0_0_10px_rgba(255,59,48,0.12)]">
                    <PlayIcon className="h-8 w-8 text-white ml-1" />
                  </div>
                  <span className="font-sans text-sm font-medium text-white/90">Property walkthrough</span>
                </div>
                <p className="border-t border-white/10 px-4 py-3 font-sans text-xs text-white/50 leading-relaxed">
                  Watch the full tour on YouTube — interiors, amenities &amp; location.
                </p>
              </a>
            ) : null} */}

            {/* <div id="property-inquiry" className="property-page-section__panel p-6 scroll-mt-28">
              <h3 className="font-serif text-lg text-[var(--color-primary)] mb-1">Send a message</h3>
              <p className="font-sans text-xs text-[var(--color-neutral-500)] mb-4 leading-relaxed">
                Share your details and we&apos;ll get back to you.
              </p>
              <ContactForm
                compact
                onSubmit={async () => {
                  await new Promise((r) => setTimeout(r, 700))
                }}
              />
            </div> */}

            <div id="property-schedule" className="property-page-section__panel p-6 scroll-mt-28">
              <h3 className="font-serif text-lg text-[var(--color-primary)] mb-1">Schedule a visit</h3>
              <p className="font-sans text-xs text-[var(--color-neutral-500)] mb-4 leading-relaxed">
                Book a private viewing at your convenience.
              </p>
              <ContactForm
                compact
                showDateTime
                onSubmit={async (form) => {
                  const schedulePayload = sanitizePayload({
                    name: form?.name,
                    email: form?.email,
                    phone: form?.phone,
                    message: form?.message,
                    date: form?.date,
                    time: form?.time,
                    propertyId: id,
                    propertyName: property?.title,
                    propertyLocation: property?.location,
                    propertyType: property?.type,
                    sheetName: 'Schedule a visit',
                  })
                  const response = await api.post('/api/contact', schedulePayload)
                  if (!response?.data?.success) {
                    throw new Error('Failed to submit schedule request')
                  }
                }}
              />
            </div>
          </aside>
        </div>
      </div>

      <WhatsAppButton phone={WA_PHONE} message={waMsg} />

      {brochureOpen ? (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4" role="dialog" aria-modal="true">
          <button
            type="button"
            className="absolute inset-0 bg-black/40"
            onClick={closeBrochureModal}
            aria-label="Close brochure form"
          />
          <div className="relative w-full max-w-md rounded-[var(--radius-md)] border border-[var(--color-neutral-200)] bg-white shadow-[var(--shadow-prestige)]">
            <div className="p-5 sm:p-6">
              <h3 className="font-serif text-xl text-[var(--color-primary)] mb-1">Download brochure</h3>
              <p className="font-sans text-xs text-[var(--color-neutral-500)] mb-4 leading-relaxed">
                Please share your details to download the project brochure.
              </p>

              <div className="space-y-3">
                <div>
                  <label className="font-sans text-[11px] font-semibold uppercase tracking-wider text-[var(--color-neutral-500)]">
                    Name
                  </label>
                  <input
                    value={brochureName}
                    onChange={(e) => {
                      setBrochureFieldErrors((s) => ({ ...s, name: '' }))
                      setBrochureName(e.target.value)
                    }}
                    className="mt-1 w-full rounded-lg border border-[var(--color-neutral-200)] px-3 py-2.5 text-sm outline-none focus:border-[var(--color-accent)]"
                    placeholder="Full name"
                    autoFocus
                    disabled={brochureSubmitting}
                    aria-invalid={Boolean(brochureFieldErrors.name)}
                  />
                  {brochureFieldErrors.name ? (
                    <p className="mt-1 text-xs text-red-600">{brochureFieldErrors.name}</p>
                  ) : null}
                </div>
                <div>
                  <label className="font-sans text-[11px] font-semibold uppercase tracking-wider text-[var(--color-neutral-500)]">
                    Mobile number
                  </label>
                  <input
                    value={brochureMobile}
                    onChange={(e) => {
                      setBrochureFieldErrors((s) => ({ ...s, phone: '' }))
                      setBrochureMobile(sanitizePhoneInputValue(e.target.value))
                    }}
                    onPaste={(e) => {
                      setBrochureFieldErrors((s) => ({ ...s, phone: '' }))
                      handlePhonePaste(e, (next) => setBrochureMobile(next))
                    }}
                    className="mt-1 w-full rounded-lg border border-[var(--color-neutral-200)] px-3 py-2.5 text-sm outline-none focus:border-[var(--color-accent)]"
                    placeholder="Phone number"
                    type="tel"
                    maxLength={20}
                    pattern={PHONE_PATTERN_ATTR}
                    title={PHONE_VALIDATION_MESSAGE}
                    disabled={brochureSubmitting}
                    aria-invalid={Boolean(brochureFieldErrors.phone)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') submitBrochureLead()
                    }}
                  />
                  {brochureFieldErrors.phone ? (
                    <p className="mt-1 text-xs text-red-600">{brochureFieldErrors.phone}</p>
                  ) : null}
                </div>

                {brochureFormError ? (
                  <div className="text-sm text-red-600">{brochureFormError}</div>
                ) : null}

                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={closeBrochureModal}
                    className="luxury-button luxury-button-secondary flex-1 justify-center border-[var(--color-neutral-200)] bg-white"
                    disabled={brochureSubmitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={submitBrochureLead}
                    className="luxury-button luxury-button-primary flex-1 justify-center"
                    disabled={brochureSubmitting}
                  >
                    {brochureSubmitting ? 'Please wait…' : 'Download'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
