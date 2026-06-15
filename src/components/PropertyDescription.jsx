import { BuildingOffice2Icon, CheckIcon } from '@heroicons/react/24/solid'

const CHECK_PREFIX = /^[\s]*(?:✔️|✔|✓|☑|✅)\s*/u
const FLOOR_PREFIX = /^[\s]*(?:🔹|◆|▪|•)\s*/u
const HIGHLIGHT_PREFIX = /^[\s]*💰\s*/u
const BUILDING_PREFIX = /^[\s]*(?:🏗️|🏗|🏢)\s*/u
const STRUCTURED_MARKER = /(?:✔️|✔|✓|☑|✅|🔹|◆|▪|•|💰|🏗️|🏗|🏢|floor\s*description)/iu

function classifyLine(line) {
  const trimmed = line.trim()
  if (!trimmed) return { type: 'blank' }

  if (CHECK_PREFIX.test(trimmed)) {
    return { type: 'check', text: trimmed.replace(CHECK_PREFIX, '').trim() }
  }
  if (FLOOR_PREFIX.test(trimmed)) {
    return { type: 'floor', text: trimmed.replace(FLOOR_PREFIX, '').trim() }
  }
  if (HIGHLIGHT_PREFIX.test(trimmed)) {
    return { type: 'highlight', text: trimmed.replace(HIGHLIGHT_PREFIX, '').trim() }
  }
  if (BUILDING_PREFIX.test(trimmed) || /floor\s*description/i.test(trimmed)) {
    return {
      type: 'section',
      text: trimmed.replace(BUILDING_PREFIX, '').replace(HIGHLIGHT_PREFIX, '').trim(),
    }
  }

  return { type: 'plain', text: trimmed }
}

function parseDescription(text) {
  if (!text || !String(text).trim()) return []
  return String(text)
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map(classifyLine)
}

function PipeText({ text, className = '' }) {
  const parts = String(text)
    .split(/\s*\|\s*/)
    .map((part) => part.trim())
    .filter(Boolean)

  if (parts.length <= 1) {
    return <span className={className}>{text}</span>
  }

  return (
    <span className={className}>
      {parts.map((part, index) => (
        <span key={`${part}-${index}`}>
          {index > 0 ? <span className="text-[var(--color-neutral-400)] mx-1.5">|</span> : null}
          {part}
        </span>
      ))}
    </span>
  )
}

function DiamondIcon({ className = '' }) {
  return (
    <span className={`text-sm leading-none shrink-0 ${className}`} aria-hidden>
      🔹
    </span>
  )
}

function DescriptionLine({ line }) {
  if (line.type === 'blank') {
    return <div className="h-3" aria-hidden />
  }

  if (line.type === 'check') {
    return (
      <div className="flex items-start gap-2.5">
        <CheckIcon className="w-4 h-4 mt-0.5 shrink-0 text-[#7C3AED]" aria-hidden />
        <PipeText text={line.text} className="font-sans text-[15px] text-[var(--color-neutral-700)] leading-relaxed" />
      </div>
    )
  }

  if (line.type === 'section') {
    return (
      <div className="flex items-center gap-2 mt-1 mb-0.5">
        <BuildingOffice2Icon className="w-4 h-4 shrink-0 text-[var(--color-neutral-600)]" aria-hidden />
        <span className="font-sans text-[15px] font-semibold text-[var(--color-neutral-800)]">{line.text}</span>
      </div>
    )
  }

  if (line.type === 'floor') {
    return (
      <div className="flex items-start gap-2.5 pl-1">
        <DiamondIcon className="mt-0.5" />
        <PipeText text={line.text} className="font-sans text-[15px] text-[var(--color-neutral-700)] leading-relaxed" />
      </div>
    )
  }

  if (line.type === 'highlight') {
    return (
      <div className="flex items-start gap-2.5 mt-1">
        <span className="text-base leading-none mt-0.5 shrink-0" aria-hidden>
          💰
        </span>
        <span className="font-sans text-[15px] font-medium text-[var(--color-neutral-800)] leading-relaxed">
          {line.text}
        </span>
      </div>
    )
  }

  return (
    <p className="font-sans text-[15px] text-[var(--color-neutral-600)] leading-relaxed">
      <PipeText text={line.text} />
    </p>
  )
}

export function PropertyDescription({ description, className = '' }) {
  const lines = parseDescription(description)
  const isStructured = STRUCTURED_MARKER.test(String(description || ''))

  if (!lines.length) return null

  if (!isStructured) {
    return (
      <div className={`font-sans text-[15px] text-[var(--color-neutral-600)] leading-relaxed whitespace-pre-line ${className}`}>
        {description}
      </div>
    )
  }

  return (
    <div className={`space-y-1.5 ${className}`}>
      {lines.map((line, index) => (
        <DescriptionLine key={`${line.type}-${index}`} line={line} />
      ))}
    </div>
  )
}
