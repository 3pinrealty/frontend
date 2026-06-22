import { createElement, forwardRef } from 'react'
import {
  AcademicCapIcon,
  BuildingOffice2Icon,
  HomeIcon,
  MapPinIcon,
  PaperAirplaneIcon,
  ShoppingBagIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline'

const OUTLINE_SVG_PROPS = {
  xmlns: 'http://www.w3.org/2000/svg',
  fill: 'none',
  viewBox: '0 0 24 24',
  strokeWidth: 1.5,
  stroke: 'currentColor',
}

function makeOutlineIcon(paths) {
  return forwardRef(function OutlineIcon({ className, ...props }, ref) {
    return createElement(
      'svg',
      { ...OUTLINE_SVG_PROPS, ref, className, ...props },
      ...paths.map((d) =>
        createElement('path', {
          key: d,
          strokeLinecap: 'round',
          strokeLinejoin: 'round',
          d,
        })
      )
    )
  })
}

function makeOutlineIconMixed(children) {
  return forwardRef(function OutlineIcon({ className, ...props }, ref) {
    return createElement('svg', { ...OUTLINE_SVG_PROPS, ref, className, ...props }, ...children)
  })
}

/** Metro / railway front-view glyph (Heroicons outline style). */
export const TrainIcon = makeOutlineIcon([
  'M6 5h12v11H6V5z',
  'M8 5V3',
  'M16 5V3',
  'M4 10h16',
  'M8 19v2',
  'M16 19v2',
  'M9 14h.01',
  'M15 14h.01',
])

/** Bus / road-transport glyph (Heroicons outline style). */
export const BusIcon = makeOutlineIcon([
  'M5 6h14v10H5V6z',
  'M5 11h14',
  'M8 19v2',
  'M16 19v2',
  'M9 14h.01',
  'M15 14h.01',
])

/** Medical cross in circle (Heroicons outline style). */
export const MedicalIcon = makeOutlineIconMixed([
  createElement('path', {
    key: 'circle',
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    d: 'M12 21a9 9 0 100-18 9 9 0 000 18z',
  }),
  createElement('path', {
    key: 'cross-v',
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    d: 'M12 8v8',
  }),
  createElement('path', {
    key: 'cross-h',
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    d: 'M8 12h8',
  }),
])

/** Highway / road-access glyph — perspective road with centre lane markings. */
export const RoadIcon = makeOutlineIconMixed([
  createElement('path', {
    key: 'edge-left',
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    d: 'M8 20 10.5 6',
  }),
  createElement('path', {
    key: 'edge-right',
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    d: 'M16 20 13.5 6',
  }),
  createElement('path', {
    key: 'dash-1',
    strokeLinecap: 'round',
    d: 'M11.6 16.5 12 14',
  }),
  createElement('path', {
    key: 'dash-2',
    strokeLinecap: 'round',
    d: 'M12 11.5 12.3 9.5',
  }),
  createElement('path', {
    key: 'dash-3',
    strokeLinecap: 'round',
    d: 'M12.4 7 12.6 6',
  }),
])

/** @deprecated Use RoadIcon — kept as alias for any external imports. */
export const RouteIcon = RoadIcon

/**
 * Explicit category keys for optional backend/admin overrides.
 * Keys are matched case-insensitively.
 */
export const LANDMARK_CATEGORY_ICONS = {
  airport: PaperAirplaneIcon,
  flight: PaperAirplaneIcon,
  bus: BusIcon,
  transport: BusIcon,
  metro: TrainIcon,
  railway: TrainIcon,
  train: TrainIcon,
  rail: TrainIcon,
  station: TrainIcon,
  education: AcademicCapIcon,
  school: AcademicCapIcon,
  shopping: ShoppingBagIcon,
  mall: ShoppingBagIcon,
  leisure: SparklesIcon,
  attraction: SparklesIcon,
  medical: MedicalIcon,
  hospital: MedicalIcon,
  road: RoadIcon,
  connectivity: RoadIcon,
  route: RoadIcon,
  residential: HomeIcon,
  office: BuildingOffice2Icon,
}

/**
 * Keyword rules are evaluated top-to-bottom; first match wins.
 * More specific phrases (e.g. "bus stand") are listed before generic ones (e.g. "station").
 */
const LANDMARK_ICON_RULES = [
  {
    category: 'airport',
    keywords: ['airport', 'aerodrome', 'flight terminal', 'air terminal'],
    icon: PaperAirplaneIcon,
  },
  {
    category: 'bus',
    keywords: [
      'bus depot',
      'bus stand',
      'bus terminal',
      'bus stop',
      'bus station',
      'transport hub',
      'intercity bus',
    ],
    icon: BusIcon,
  },
  {
    category: 'metro',
    keywords: ['metro', 'railway', 'train', 'rail', 'subway', 'mrt', 'monorail', 'light rail'],
    icon: TrainIcon,
  },
  {
    category: 'metro',
    keywords: ['station'],
    icon: TrainIcon,
  },
  {
    category: 'education',
    keywords: [
      'school',
      'college',
      'university',
      'academy',
      'institute',
      'campus',
      'kindergarten',
      'preschool',
    ],
    icon: AcademicCapIcon,
  },
  {
    category: 'shopping',
    keywords: [
      'mall',
      'shopping center',
      'shopping centre',
      'shopping complex',
      'shopping',
      'retail',
      'bazaar',
      'market',
      'supermarket',
      'hypermarket',
      'department store',
      'plaza',
    ],
    icon: ShoppingBagIcon,
  },
  {
    category: 'medical',
    keywords: [
      'hospital',
      'clinic',
      'medical',
      'healthcare',
      'health centre',
      'health center',
      'pharmacy',
      'diagnostic',
    ],
    icon: MedicalIcon,
  },
  {
    category: 'leisure',
    keywords: [
      'beach',
      'park',
      'garden',
      'tourist',
      'attraction',
      'monument',
      'museum',
      'zoo',
      'resort',
      'lake',
      'waterfront',
      'marina',
      'sea',
      'ocean',
      'coast',
      'bay',
      'stadium',
      'theatre',
      'theater',
      'amusement',
    ],
    icon: SparklesIcon,
  },
  {
    category: 'road',
    keywords: [
      'road',
      'highway',
      'expressway',
      'freeway',
      'bypass',
      'salai',
      'avenue',
      'connectivity',
      'easy access',
      'access to',
      'route',
      'corridor',
      'link road',
      'nh ',
      'nh-',
    ],
    icon: RoadIcon,
  },
  {
    category: 'residential',
    keywords: [
      'township',
      'neighborhood',
      'neighbourhood',
      'residential',
      'community',
      'housing',
      'apartment',
      'villa',
      'gated',
      'enclave',
      'layout',
    ],
    icon: HomeIcon,
  },
  {
    category: 'office',
    keywords: [
      'it park',
      'tech park',
      'software park',
      'business park',
      'office hub',
      'office park',
      'corporate',
      'sez',
      'special economic zone',
      'cbd',
      'financial district',
    ],
    icon: BuildingOffice2Icon,
  },
  {
    category: 'office',
    keywords: ['office'],
    icon: BuildingOffice2Icon,
  },
]

function normalizeLabel(value) {
  return (value || '').toLowerCase().trim()
}

/**
 * Resolves the icon component for a nearby landmark or location highlight.
 * Uses an optional explicit category first, then keyword matching on the title.
 *
 * @param {string} title - Landmark or amenity display name
 * @param {string} [category] - Optional category key (e.g. "metro", "shopping")
 * @returns {import('react').ForwardRefExoticComponent} Heroicon-compatible SVG component
 */
export function getLandmarkIcon(title, category) {
  const normalizedCategory = normalizeLabel(category)
  if (normalizedCategory && LANDMARK_CATEGORY_ICONS[normalizedCategory]) {
    return LANDMARK_CATEGORY_ICONS[normalizedCategory]
  }

  const normalizedTitle = normalizeLabel(title)
  for (const rule of LANDMARK_ICON_RULES) {
    if (rule.keywords.some((keyword) => normalizedTitle.includes(keyword))) {
      return rule.icon
    }
  }

  return MapPinIcon
}

/** Alias for reuse in amenity-style lists that share the same keyword logic. */
export const getAmenityIcon = getLandmarkIcon
