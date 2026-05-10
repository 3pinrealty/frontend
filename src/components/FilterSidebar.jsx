const TYPES = ['Apartment', 'Terrace', 'Detached', 'Semi-Detached', 'Duplex', 'Condo', 'Bungalow', 'Studio']
const STATUS_OPTIONS = ['Ready to Move', 'Under Construction']
const BEDROOM_OPTIONS = ['2 BHK', '3 BHK', '4 BHK']
const COMPLETION_YEAR_OPTIONS = [2026, 2027, 2028, 2029, 2030]

function CheckboxGroup({ label, options, selected, onChange }) {
  function handleToggle(value) {
    const next = selected.includes(value)
      ? selected.filter((v) => v !== value)
      : [...selected, value]
    onChange(next)
  }

  return (
    <div className="space-y-2">
      <label className="text-xs font-semibold text-[var(--color-primary)] uppercase tracking-wider">
        {label}
      </label>
      <div className="space-y-2">
        {options.map((option) => {
          const checked = selected.includes(option)
          return (
            <label key={option} className="flex items-center gap-2.5 cursor-pointer group">
              <span
                className={`flex-shrink-0 w-4 h-4 rounded border flex items-center justify-center transition-all ${
                  checked
                    ? 'bg-[var(--color-accent)] border-[var(--color-accent)]'
                    : 'border-[var(--color-neutral-300)] group-hover:border-[var(--color-accent)]'
                }`}
              >
                {checked && (
                  <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 12 12">
                    <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </span>
              <input
                type="checkbox"
                className="sr-only"
                checked={checked}
                onChange={() => handleToggle(option)}
              />
              <span className="text-sm text-[var(--color-primary)]">{option}</span>
            </label>
          )
        })}
      </div>
    </div>
  )
}

function NumberRangeInput({ minValue, maxValue, onMinChange, onMaxChange }) {
  const BUDGET_OPTIONS = [
    { label: '50L', value: 5_000_000 },
    { label: '1 Cr', value: 10_000_000 },
    { label: '1.5 Cr', value: 15_000_000 },
    { label: '2 Cr', value: 20_000_000 },
    { label: '2.5 Cr', value: 25_000_000 },
    { label: '3 Cr', value: 30_000_000 },
    { label: '3.5 Cr', value: 35_000_000 },
    { label: '4 Cr', value: 40_000_000 },
    { label: '4.5 Cr', value: 45_000_000 },
    { label: '5 Cr', value: 50_000_000 },
    { label: '5 Cr+', value: 50_000_000, openEnded: true },
  ]

  const selectedMin =
    minValue == null || minValue === '' ? null : Number.isFinite(Number(minValue)) ? Number(minValue) : null
  const selectedMax = maxValue && typeof maxValue === 'object' ? maxValue : null
  const selectedMaxValue = selectedMax
    ? Number(selectedMax.value)
    : maxValue == null || maxValue === ''
      ? null
      : Number.isFinite(Number(maxValue))
        ? Number(maxValue)
        : null
  const selectedMaxOpen = Boolean(selectedMax?.openEnded)

  const minOptions = selectedMaxValue == null || selectedMaxOpen
    ? BUDGET_OPTIONS
    : BUDGET_OPTIONS.filter((o) => o.value <= selectedMaxValue)

  const maxOptions = selectedMin == null
    ? BUDGET_OPTIONS
    : BUDGET_OPTIONS.filter((o) => o.value >= selectedMin)

  const maxSelectValue = selectedMax
    ? `${selectedMax.value}${selectedMax.openEnded ? '+' : ''}`
    : selectedMaxValue == null
      ? ''
      : String(selectedMaxValue)

  return (
    <div className="space-y-2">
      <label className="text-xs font-semibold text-[var(--color-primary)] uppercase tracking-wider">
        Budget (INR)
      </label>
      <div className="flex items-center gap-2">
        <select
          value={selectedMin == null ? '' : String(selectedMin)}
          onChange={(e) => {
            const raw = e.target.value
            const nextMin = raw === '' ? null : Number(raw)
            onMinChange(nextMin)
          }}
          className="w-full rounded-sm border border-[var(--color-neutral-200)] bg-white px-3 py-2.5 text-sm text-[var(--color-primary)] placeholder:text-[var(--color-neutral-400)] focus:outline-none focus:border-[var(--color-accent)] focus:shadow-[0_0_0_3px_rgba(198,168,75,0.15)] transition-all"
        >
          <option value="">Min</option>
          {minOptions.map((option) => (
            <option key={`min-${option.label}`} value={String(option.value)}>
              {option.label}
            </option>
          ))}
        </select>
        <span className="text-[var(--color-neutral-400)] text-xs">–</span>
        <select
          value={maxSelectValue}
          onChange={(e) => {
            const raw = e.target.value
            if (raw === '') {
              onMaxChange(null)
              return
            }
            const openEnded = raw.endsWith('+')
            const value = Number(openEnded ? raw.slice(0, -1) : raw)
            onMaxChange({ value, openEnded })
          }}
          className="w-full rounded-sm border border-[var(--color-neutral-200)] bg-white px-3 py-2.5 text-sm text-[var(--color-primary)] placeholder:text-[var(--color-neutral-400)] focus:outline-none focus:border-[var(--color-accent)] focus:shadow-[0_0_0_3px_rgba(198,168,75,0.15)] transition-all"
        >
          <option value="">Max</option>
          {maxOptions.map((option) => (
            <option
              key={`max-${option.label}`}
              value={`${option.value}${option.openEnded ? '+' : ''}`}
            >
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}

export function FilterSidebar({ filters, onChange, onApply, onReset, loading }) {
  function update(patch) {
    onChange?.({ ...filters, ...patch })
  }

  function handleMultiSelect(key, values) {
    update({ [key]: values })
  }

  return (
    <div className="space-y-6">
      {/* Location Filter */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-[var(--color-primary)] uppercase tracking-wider">Location</label>
        <input
          value={filters.location ?? ''}
          onChange={(e) => update({ location: e.target.value })}
          placeholder="e.g. Chennai, Mumbai"
          className="w-full rounded-sm border border-[var(--color-neutral-200)] bg-white px-4 py-3 text-sm text-[var(--color-primary)] placeholder:text-[var(--color-neutral-400)] focus:outline-none focus:border-[var(--color-accent)] focus:shadow-[0_0_0_3px_rgba(198,168,75,0.15)] transition-all"
        />
      </div>

      {/* Budget Range Filter */}
      <NumberRangeInput
        minValue={filters.minBudget}
        maxValue={filters.maxBudget}
        onMinChange={(val) => {
          const nextMin = val
          const currentMaxObj = filters.maxBudget
          if (!currentMaxObj || typeof currentMaxObj !== 'object') {
            update({ minBudget: nextMin })
            return
          }
          if (nextMin != null && Number(currentMaxObj.value) < Number(nextMin)) {
            update({ minBudget: nextMin, maxBudget: null })
            return
          }
          update({ minBudget: nextMin })
        }}
        onMaxChange={(val) => {
          const nextMax = val
          if (nextMax && filters.minBudget != null && Number(nextMax.value) < Number(filters.minBudget)) {
            update({ maxBudget: null })
            return
          }
          update({ maxBudget: nextMax })
        }}
      />

      {/* Property Type Filter */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-[var(--color-primary)] uppercase tracking-wider">Property type</label>
        <select
          value={filters.propertyType ?? ''}
          onChange={(e) => update({ propertyType: e.target.value })}
          className="w-full rounded-sm border border-[var(--color-neutral-200)] bg-white px-4 py-3 text-sm text-[var(--color-primary)] focus:outline-none focus:border-[var(--color-accent)] focus:shadow-[0_0_0_3px_rgba(198,168,75,0.15)] transition-all appearance-none cursor-pointer"
        >
          <option value="">Any</option>
          {TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>

      {/* Status Filter */}
      <CheckboxGroup
        label="Status"
        options={STATUS_OPTIONS}
        selected={filters.status ?? []}
        onChange={(vals) => handleMultiSelect('status', vals)}
      />

      {/* Bedrooms Filter */}
      <CheckboxGroup
        label="Bedrooms"
        options={BEDROOM_OPTIONS}
        selected={filters.bedrooms ?? []}
        onChange={(vals) => handleMultiSelect('bedrooms', vals)}
      />

      {/* Completion Year Filter */}
      <CheckboxGroup
        label="Completion Year"
        options={COMPLETION_YEAR_OPTIONS.map(String)}
        selected={(filters.completionYear ?? []).map(String)}
        onChange={(vals) => handleMultiSelect('completionYear', vals)}
      />

      {/* Apply & Reset Buttons */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => onApply?.(filters)}
          disabled={loading}
          className="flex-1 py-2.5 text-xs font-medium text-white bg-[var(--color-accent)] border border-[var(--color-accent)] rounded-sm hover:opacity-90 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
        >
          {loading ? (
            <>
              <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Applying...
            </>
          ) : (
            'Apply Filters'
          )}
        </button>
        <button
          type="button"
          onClick={onReset}
          className="flex-1 py-2.5 text-xs font-medium text-[var(--color-neutral-500)] border border-[var(--color-neutral-200)] rounded-sm hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] transition-all"
        >
          Clear
        </button>
      </div>
    </div>
  )
}