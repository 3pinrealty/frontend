import { useMemo, useState, useEffect, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { FunnelIcon, MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { FilterSidebar } from '../components/FilterSidebar'
import { PropertyCard } from '../components/PropertyCard'
import { api, normalizeProperty } from '../services/api'

function includes(haystack, needle) {
  return String(haystack || '').toLowerCase().includes(String(needle || '').toLowerCase())
}

function buildQueryParams(filters) {
  const params = new URLSearchParams()

  if (filters.location) params.set('location', filters.location)
  if (filters.minBudget != null && filters.minBudget !== '') params.set('minBudget', String(filters.minBudget))
  if (filters.maxBudget && typeof filters.maxBudget === 'object') {
    if (filters.maxBudget.value != null && filters.maxBudget.value !== '') {
      params.set('maxBudget', String(filters.maxBudget.value))
      if (filters.maxBudget.openEnded) params.set('maxBudgetOpen', '1')
    }
  } else if (filters.maxBudget != null && filters.maxBudget !== '') {
    params.set('maxBudget', String(filters.maxBudget))
  }
  if (filters.propertyType) params.set('type', filters.propertyType)
  if (filters.status?.length) params.set('status', filters.status.join(','))
  if (filters.bedrooms?.length) params.set('bedrooms', filters.bedrooms.join(','))
  if (filters.completionYear?.length) params.set('completionYear', filters.completionYear.map(String).join(','))

  return params
}

const DEFAULT_FILTERS = {
  location: '',
  minBudget: null,
  maxBudget: null,
  propertyType: '',
  status: [],
  bedrooms: [],
  completionYear: [],
}

function UnifiedListingSearch({ value, suggestions, onSearch }) {
  const wrapperRef = useRef(null)
  const inputRef = useRef(null)
  const [inputValue, setInputValue] = useState(value || '')
  const [debouncedValue, setDebouncedValue] = useState(value || '')
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1)

  useEffect(() => {
    setInputValue(value || '')
    setDebouncedValue(value || '')
  }, [value])

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(inputValue.trim())
    }, 300)
    return () => clearTimeout(timer)
  }, [inputValue])

  useEffect(() => {
    const onClickOutside = (event) => {
      if (!wrapperRef.current?.contains(event.target)) {
        setIsDropdownOpen(false)
        setActiveSuggestionIndex(-1)
      }
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  const filteredSuggestions = useMemo(() => {
    const query = debouncedValue.toLowerCase()
    if (!query) return suggestions.slice(0, 12)
    return suggestions.filter((item) => item.toLowerCase().includes(query)).slice(0, 12)
  }, [debouncedValue, suggestions])

  const runSearch = (nextValue) => {
    onSearch?.(nextValue.trim())
    setIsDropdownOpen(false)
    setActiveSuggestionIndex(-1)
  }

  const handleSuggestionSelect = (nextValue) => {
    setInputValue(nextValue)
    setDebouncedValue(nextValue)
    runSearch(nextValue)
  }

  const handleInputKeyDown = (event) => {
    if (!isDropdownOpen && (event.key === 'ArrowDown' || event.key === 'ArrowUp')) {
      setIsDropdownOpen(true)
      return
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault()
      if (!filteredSuggestions.length) return
      setActiveSuggestionIndex((prev) => (prev + 1) % filteredSuggestions.length)
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault()
      if (!filteredSuggestions.length) return
      setActiveSuggestionIndex((prev) => (prev <= 0 ? filteredSuggestions.length - 1 : prev - 1))
    }

    if (event.key === 'Enter') {
      event.preventDefault()
      if (isDropdownOpen && activeSuggestionIndex >= 0 && filteredSuggestions[activeSuggestionIndex]) {
        handleSuggestionSelect(filteredSuggestions[activeSuggestionIndex])
        return
      }
      runSearch(inputValue)
    }

    if (event.key === 'Escape') {
      setIsDropdownOpen(false)
      setActiveSuggestionIndex(-1)
    }
  }

  return (
    <div className="listing-search-wrapper" ref={wrapperRef}>
      <div className="listing-search-field">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          placeholder="Search location, property, or area"
          onFocus={() => setIsDropdownOpen(true)}
          onChange={(event) => {
            const nextValue = event.target.value
            setInputValue(nextValue)
            setIsDropdownOpen(true)
            setActiveSuggestionIndex(-1)
            if (!nextValue.trim() && inputValue.trim()) {
              runSearch('')
            }
          }}
          onKeyDown={handleInputKeyDown}
          className="listing-search-input"
        />
        {inputValue && (
          <button
            type="button"
            className="listing-search-clear"
            aria-label="Clear search"
            onClick={() => {
              setInputValue('')
              setDebouncedValue('')
              runSearch('')
              inputRef.current?.focus()
            }}
          >
            <XMarkIcon className="w-4 h-4" />
          </button>
        )}
        <MagnifyingGlassIcon className="listing-search-icon" aria-hidden="true" />
      </div>

      {isDropdownOpen && (
        <div className="listing-search-dropdown" role="listbox">
          {filteredSuggestions.length ? (
            <ul className="listing-search-list">
              {filteredSuggestions.map((item, optionIndex) => (
                <li key={item}>
                  <button
                    type="button"
                    className={`listing-search-option ${optionIndex === activeSuggestionIndex ? 'active' : ''}`}
                    onMouseEnter={() => setActiveSuggestionIndex(optionIndex)}
                    onClick={() => handleSuggestionSelect(item)}
                  >
                    {item}
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="listing-search-empty">No suggestions found</p>
          )}
        </div>
      )}
    </div>
  )
}

export function ListingsPage() {
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const [properties, setProperties] = useState([])
  const [loading, setLoading] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [isMobileFilterView, setIsMobileFilterView] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth < 1024 : true,
  )
  const filtersRef = useRef(DEFAULT_FILTERS)

  const q = params.get('q') || ''
  const loc = params.get('loc') || ''

  const [filters, setFilters] = useState(DEFAULT_FILTERS)

  const fetchProperties = (f) => {
    setLoading(true)
    const qs = buildQueryParams(f)
    api.get(`/api/property?${qs}`)
      .then((res) => setProperties((res.data?.data || []).map(normalizeProperty)))
      .catch(() => setProperties([]))
      .finally(() => setLoading(false))
  }

  const handleFilterChange = (next) => {
    setFilters(next)
    filtersRef.current = next
  }

  const handleApplyFilters = (appliedFilters) => {
    const nextFilters = appliedFilters || filtersRef.current
    setShowFilters(false)
    fetchProperties(nextFilters)
  }

  const handleReset = () => {
    setFilters(DEFAULT_FILTERS)
    filtersRef.current = DEFAULT_FILTERS
    fetchProperties(DEFAULT_FILTERS)
  }

  useEffect(() => {
    fetchProperties(filters)
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return undefined
    const media = window.matchMedia('(max-width: 1023px)')
    const sync = (event) => {
      const nextMobile = Boolean(event.matches)
      setIsMobileFilterView(nextMobile)
      if (!nextMobile) setShowFilters(false)
    }
    sync(media)
    if (typeof media.addEventListener === 'function') {
      media.addEventListener('change', sync)
      return () => media.removeEventListener('change', sync)
    }
    media.addListener(sync)
    return () => media.removeListener(sync)
  }, [])

  const unifiedQuery = q || loc

  const searchSuggestions = useMemo(() => {
    const unique = new Set()
    properties.forEach((property) => {
      if (property.location) unique.add(property.location)
      if (property.type) unique.add(property.type)
      if (property.title) unique.add(property.title)
      if (property.projectName) unique.add(property.projectName)
    })
    return [...unique].filter(Boolean)
  }, [properties])

  const results = useMemo(() => {
    if (q || loc) {
      return properties.filter((p) => {
        if (q && !(includes(p.title, q) || includes(p.type, q) || includes(p.description, q) || includes(p.location, q)))
          return false
        if (loc && !includes(p.location, loc)) return false
        return true
      })
    }
    return properties
  }, [q, loc, properties])

  return (
    <div className="min-h-screen bg-[var(--color-secondary)]">
      {/* Page Header */}
      <div className="bg-[var(--color-secondary-200)] py-16 sm:py-20 border-b border-[var(--color-neutral-200)]">
        <div className="luxury-container">
          <div className="max-w-2xl">
            <p className="font-sans text-xs uppercase tracking-[0.2em] text-[var(--color-accent)] mb-3 font-medium">
              Property Listings
            </p>
            <h1 className="font-serif text-3xl sm:text-4xl text-[var(--color-primary)] mb-4">
              Find Your Perfect Property
            </h1>
            <p className="font-sans text-sm text-[var(--color-neutral-500)]">
              Browse our curated collection of exceptional homes and investment opportunities.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <section className="properties-section">
        {/* Floating Filter Panel */}
        <div className="luxury-container">
          <div className="properties-filter-panel -mt-6 relative z-10">
            <div className="flex flex-col lg:flex-row gap-4 lg:items-center">
              <div className="flex-1 min-w-0">
                <div className="py-2 sm:py-3">
                  <UnifiedListingSearch
                    value={unifiedQuery}
                    suggestions={searchSuggestions}
                    onSearch={(term) => {
                      const next = new URLSearchParams(params)
                      if (term) {
                        next.set('q', term)
                        next.set('loc', term)
                      } else {
                        next.delete('q')
                        next.delete('loc')
                      }
                      setParams(next)
                    }}
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={() => {
                    if (!isMobileFilterView) return
                    setShowFilters((prev) => !prev)
                  }}
                  className="luxury-button luxury-button-secondary properties-section__filter-button text-xs py-2.5 px-4"
                >
                  <FunnelIcon className="w-4 h-4 mr-1.5" />
                  Filters
                  {loading && (
                    <span className="ml-1.5 w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  )}
                </button>

                <span className="font-sans text-xs text-[var(--color-neutral-500)]">
                  {results.length} properties
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="luxury-container py-10">
          <div className="flex gap-8">
            {/* Desktop Sidebar */}
            <aside className="w-72 flex-shrink-0 hidden lg:block">
              <div className="properties-section__sidebar p-6 sticky top-28">
                <h3 className="font-serif text-lg text-[var(--color-primary)] mb-6">Filters</h3>
                <FilterSidebar
                  filters={filters}
                  onChange={handleFilterChange}
                  onApply={handleApplyFilters}
                  onReset={handleReset}
                  loading={loading}
                />
              </div>
            </aside>

            {/* Mobile Drawer */}
            {isMobileFilterView && showFilters && (
              <>
                <div
                  className="mobile-filter-backdrop"
                  onClick={() => setShowFilters(false)}
                />
                <div className={`mobile-filter-drawer${showFilters ? ' open' : ''}`}>
                  <div className="mobile-filter-drawer__header">
                    <h3 className="font-serif text-lg text-[var(--color-primary)]">Filters</h3>
                    <button
                      onClick={() => setShowFilters(false)}
                      className="p-1.5 rounded-md hover:bg-[var(--color-neutral-100)] transition-colors"
                      aria-label="Close filters"
                    >
                      <XMarkIcon className="w-5 h-5 text-[var(--color-primary)]" />
                    </button>
                  </div>
                  <div className="p-6">
                    <FilterSidebar
                      filters={filters}
                      onChange={handleFilterChange}
                      onApply={handleApplyFilters}
                      onReset={handleReset}
                      loading={loading}
                    />
                  </div>
                </div>
              </>
            )}

            {/* Property Grid */}
            <div className={`flex-1 ${isMobileFilterView && showFilters ? '' : 'w-full'}`}>
              {loading && results.length === 0 ? (
                <div className="flex items-center justify-center py-24">
                  <div className="w-8 h-8 border-2 border-[var(--color-accent)] border-t-transparent rounded-full animate-spin" />
                </div>
              ) : results.length === 0 ? (
                <div className="text-center py-24 bg-white rounded-md border border-[var(--color-neutral-200)]">
                  <div className="w-16 h-px bg-[var(--color-accent)] mx-auto mb-6" />
                  <h3 className="font-serif text-xl text-[var(--color-primary)] mb-2">No properties found</h3>
                  <p className="font-sans text-sm text-[var(--color-neutral-500)] mb-8">
                    Try adjusting your search criteria or filters.
                  </p>
                  <button
                    onClick={() => {
                      handleReset()
                      setParams(new URLSearchParams())
                    }}
                    className="luxury-button luxury-button-secondary properties-section__filter-button"
                  >
                    Clear all filters
                  </button>
                </div>
              ) : (
                <div className="prop-grid">
                  {results.map((p) => (
                    <PropertyCard key={p.id || p._id} property={p} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <style>{`
        .listing-search-wrapper {
          position: relative;
          width: 100%;
          max-width: 100%;
        }
        .listing-search-field {
          position: relative;
          display: flex;
          align-items: center;
          border-radius: 999px;
          border: 1px solid rgba(0, 0, 0, 0.08);
          background: #ffffff;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
          min-height: 56px;
        }
        .listing-search-input {
          width: 100%;
          border: 0;
          outline: none;
          background: transparent;
          font-size: 0.95rem;
          color: #111111;
          padding: 0.95rem 5.2rem 0.95rem 1.15rem;
          border-radius: 999px;
        }
        .listing-search-clear {
          position: absolute;
          right: 2.7rem;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 1.6rem;
          height: 1.6rem;
          border: 0;
          border-radius: 999px;
          background: #f3f4f6;
          color: #6b7280;
          cursor: pointer;
          transition: background-color 160ms ease, color 160ms ease;
        }
        .listing-search-clear:hover {
          background: #e5e7eb;
          color: #374151;
        }
        .listing-search-input::placeholder {
          color: #8a8a8a;
        }
        .listing-search-icon {
          width: 18px;
          height: 18px;
          position: absolute;
          right: 1rem;
          color: #9ca3af;
          pointer-events: none;
        }
        .listing-search-dropdown {
          position: absolute;
          top: calc(100% + 10px);
          width: 100%;
          z-index: 30;
          max-height: 280px;
          overflow-y: auto;
          border-radius: 12px;
          background: #ffffff;
          border: 1px solid rgba(0, 0, 0, 0.08);
          box-shadow: 0 8px 22px rgba(0, 0, 0, 0.12);
          padding: 0.3rem;
        }
        .listing-search-list {
          list-style: none;
          margin: 0;
          padding: 0;
        }
        .listing-search-option {
          width: 100%;
          text-align: left;
          border: 0;
          background: transparent;
          border-radius: 8px;
          padding: 0.7rem 0.85rem;
          font-size: 0.92rem;
          color: #111111;
          cursor: pointer;
          transition: background-color 160ms ease;
        }
        .listing-search-option:hover,
        .listing-search-option.active {
          background: #f5f5f5;
        }
        .listing-search-empty {
          margin: 0;
          padding: 0.7rem 0.85rem;
          color: #666666;
          font-size: 0.87rem;
        }
        @media (max-width: 640px) {
          .listing-search-input {
            font-size: 0.92rem;
            padding: 0.9rem 4.8rem 0.9rem 1rem;
          }
          .listing-search-clear {
            right: 2.5rem;
          }
          .listing-search-dropdown {
            left: 0;
            right: 0;
            max-width: 100%;
          }
        }

        /* Mobile filter drawer */
        .mobile-filter-backdrop {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.4);
          z-index: 9998;
        }

        .mobile-filter-drawer {
          position: fixed;
          top: 0;
          right: 0;
          width: min(85vw, 360px);
          height: 100%;
          background: #ffffff;
          z-index: 9999;
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          overflow-y: auto;
          box-shadow: -4px 0 24px rgba(0, 0, 0, 0.15);
          transform: translateX(100%);
        }

        .mobile-filter-drawer.open {
          transform: translateX(0);
        }

        .mobile-filter-drawer__header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1.25rem 1.5rem;
          border-bottom: 1px solid var(--color-neutral-200, #e5e7eb);
          position: sticky;
          top: 0;
          background: #ffffff;
          z-index: 1;
        }
      `}</style>
    </div>
  )
}
