const img = (seed) => `https://picsum.photos/seed/${seed}/1200/800`

export const properties = [
  {
    id: 'p-101',
    title: 'Modern 3-Bed Apartment in Ikoyi',
    price: 250000000,
    currency: 'INR',
    location: 'Ikoyi, Lagos',
    type: 'Apartment',
    bedrooms: 3,
    bathrooms: 3,
    areaSqm: 165,
    featured: true,
    isNewDevelopment: false,
    builder: 'Harbourstone Developments',
    minPrice: 240000000,
    maxPrice: 260000000,
    createdAt: '2025-01-15',
    deliveryDate: null,
    amenities: ['24/7 power', 'Elevator', 'Security', 'Parking', 'Fitted kitchen'],
    floorPlans: ['Typical 3-bed layout', 'Penthouse variant'],
    mapUrl: 'https://www.google.com/maps?q=Ikoyi,Lagos',
    youtubeId: 'ysz5P6l8-0A',
    images: [img('ikoyi-1'), img('ikoyi-2'), img('ikoyi-3'), img('ikoyi-4')],
    description:
      'Bright, secure apartment with elevator access, fitted kitchen, and city views. Close to major business districts.',
  },
  {
    id: 'p-102',
    title: 'New Development: Luxury Terraces (Off-Plan)',
    price: 420000000,
    currency: 'INR',
    location: 'Lekki Phase 1, Lagos',
    type: 'Terrace',
    bedrooms: 4,
    bathrooms: 5,
    areaSqm: 240,
    featured: true,
    isNewDevelopment: true,
    builder: 'Lekki Prime Builders',
    minPrice: 400000000,
    maxPrice: 450000000,
    createdAt: '2025-02-10',
    deliveryDate: '2026-06-01',
    amenities: ['Gated estate', 'Swimming pool', 'Gym', 'Smart home ready', '24/7 security'],
    floorPlans: ['4-bed terrace', 'Corner unit'],
    mapUrl: 'https://www.google.com/maps?q=Lekki+Phase+1,Lagos',
    youtubeId: 'dQw4w9WgXcQ',
    images: [img('lekki-dev-1'), img('lekki-dev-2'), img('lekki-dev-3'), img('lekki-dev-4')],
    description:
      'Contemporary terraces in a gated estate. Flexible payment plan, smart home options, and premium finishing.',
  },
  {
    id: 'p-103',
    title: 'Fully Detached 5-Bed with BQ',
    price: 950000000,
    currency: 'INR',
    location: 'Chevron, Lagos',
    type: 'Detached',
    bedrooms: 5,
    bathrooms: 6,
    areaSqm: 420,
    featured: false,
    isNewDevelopment: false,
    builder: 'Chevron Homes',
    minPrice: 930000000,
    maxPrice: 970000000,
    createdAt: '2025-01-05',
    deliveryDate: null,
    amenities: ['BQ', 'Parking for 4 cars', 'Family lounge', 'Security', 'Water treatment'],
    floorPlans: ['Ground floor', 'First floor'],
    mapUrl: 'https://www.google.com/maps?q=Chevron+Drive,Lagos',
    youtubeId: null,
    images: [img('chevron-1'), img('chevron-2'), img('chevron-3')],
    description:
      'Spacious detached home with ample parking, family lounge, and BQ. Excellent for large families.',
  },
  {
    id: 'p-104',
    title: 'Waterfront 2-Bed Condo',
    price: 310000000,
    currency: 'INR',
    location: 'Victoria Island, Lagos',
    type: 'Condo',
    bedrooms: 2,
    bathrooms: 2,
    areaSqm: 120,
    featured: true,
    isNewDevelopment: false,
    builder: 'Island Realty Projects',
    minPrice: 300000000,
    maxPrice: 330000000,
    createdAt: '2025-03-02',
    deliveryDate: null,
    amenities: ['Waterfront', 'Concierge', 'Backup power', 'Gym', 'Pool'],
    floorPlans: ['2-bed waterfront'],
    mapUrl: 'https://www.google.com/maps?q=Victoria+Island,Lagos',
    youtubeId: 'ysz5P6l8-0A',
    images: [img('vi-1'), img('vi-2'), img('vi-3'), img('vi-4')],
    description:
      'A calm waterfront lifestyle with backup power, concierge, and top-tier security. Ideal as an investment unit.',
  },
  {
    id: 'p-105',
    title: 'New Development: Serviced Studios',
    price: 85000000,
    currency: 'INR',
    location: 'Ajah, Lagos',
    type: 'Studio',
    bedrooms: 1,
    bathrooms: 1,
    areaSqm: 48,
    featured: false,
    isNewDevelopment: true,
    builder: 'Ajah Heights',
    minPrice: 80000000,
    maxPrice: 90000000,
    createdAt: '2025-03-20',
    deliveryDate: '2026-03-01',
    amenities: ['Serviced', 'Parking', 'Security', 'Rooftop terrace'],
    floorPlans: ['Studio layout'],
    mapUrl: 'https://www.google.com/maps?q=Ajah,Lagos',
    youtubeId: null,
    images: [img('ajah-1'), img('ajah-2'), img('ajah-3')],
    description:
      'Compact, serviced studios with strong rental demand. Great entry point for first-time investors.',
  },
  {
    id: 'p-106',
    title: '4-Bed Semi-Detached with Private Garden',
    price: 520000000,
    currency: 'INR',
    location: 'Osapa, Lagos',
    type: 'Semi-Detached',
    bedrooms: 4,
    bathrooms: 5,
    areaSqm: 280,
    featured: false,
    isNewDevelopment: false,
    builder: 'Osapa Gardens',
    minPrice: 500000000,
    maxPrice: 540000000,
    createdAt: '2025-02-05',
    deliveryDate: null,
    amenities: ['Private garden', 'Security', 'Parking', 'Fitted kitchen'],
    floorPlans: ['4-bed semi-detached'],
    mapUrl: 'https://www.google.com/maps?q=Osapa,Lagos',
    youtubeId: null,
    images: [img('osapa-1'), img('osapa-2'), img('osapa-3')],
    description:
      'Comfortable semi-detached home with green space, fitted wardrobes, and multiple lounges.',
  },
  {
    id: 'p-107',
    title: 'Serviced 3-Bed Shortlet-Friendly Apartment',
    price: 220000000,
    currency: 'INR',
    location: 'Oniru, Lagos',
    type: 'Apartment',
    bedrooms: 3,
    bathrooms: 3,
    areaSqm: 150,
    featured: true,
    isNewDevelopment: false,
    builder: 'Oniru Suites',
    minPrice: 210000000,
    maxPrice: 230000000,
    createdAt: '2025-04-12',
    deliveryDate: null,
    amenities: ['Serviced', 'Shortlet friendly', 'Beach proximity', '24/7 power'],
    floorPlans: ['3-bed shortlet layout'],
    mapUrl: 'https://www.google.com/maps?q=Oniru,Lagos',
    youtubeId: null,
    images: [img('oniru-1'), img('oniru-2'), img('oniru-3')],
    description:
      'Move-in-ready apartment with strong shortlet potential, good access roads, and proximity to the beach.',
  },
  {
    id: 'p-108',
    title: '3-Bed Bungalow on Corner Piece',
    price: 135000000,
    currency: 'INR',
    location: 'Abuja, Gwarinpa',
    type: 'Bungalow',
    bedrooms: 3,
    bathrooms: 3,
    areaSqm: 210,
    featured: false,
    isNewDevelopment: false,
    builder: 'Gwarinpa Homes',
    minPrice: 130000000,
    maxPrice: 140000000,
    createdAt: '2025-01-28',
    deliveryDate: null,
    amenities: ['Corner piece', 'Parking', 'Green space'],
    floorPlans: ['3-bed bungalow'],
    mapUrl: 'https://www.google.com/maps?q=Gwarinpa,Abuja',
    youtubeId: null,
    images: [img('gwarinpa-1'), img('gwarinpa-2'), img('gwarinpa-3')],
    description:
      'Quiet neighborhood, generous outdoor space, and solid construction. Suitable for upgrades and extensions.',
  },
  {
    id: 'p-109',
    title: 'New Development: Smart 4-Bed Duplexes',
    price: 680000000,
    currency: 'INR',
    location: 'Eko Atlantic, Lagos',
    type: 'Duplex',
    bedrooms: 4,
    bathrooms: 5,
    areaSqm: 310,
    featured: true,
    isNewDevelopment: true,
    builder: 'Eko Atlantic Residences',
    minPrice: 650000000,
    maxPrice: 700000000,
    createdAt: '2025-05-01',
    deliveryDate: '2026-09-15',
    amenities: ['Smart home', 'Concierge', 'Sea views', 'Backup power', 'Security'],
    floorPlans: ['4-bed duplex', 'Penthouse'],
    mapUrl: 'https://www.google.com/maps?q=Eko+Atlantic,Lagos',
    youtubeId: 'ysz5P6l8-0A',
    images: [img('eko-1'), img('eko-2'), img('eko-3')],
    description:
      'Smart duplexes in a premium district with concierge services and top infrastructure. Limited units available.',
  },
  {
    id: 'p-110',
    title: 'Affordable 2-Bed Starter Home',
    price: 65000000,
    currency: 'INR',
    location: 'Ibadan, Oyo',
    type: 'Apartment',
    bedrooms: 2,
    bathrooms: 2,
    areaSqm: 95,
    featured: false,
    isNewDevelopment: false,
    builder: 'Ibadan Homes',
    minPrice: 60000000,
    maxPrice: 70000000,
    createdAt: '2025-02-22',
    deliveryDate: null,
    amenities: ['Parking', 'Quiet street'],
    floorPlans: ['2-bed starter home'],
    mapUrl: 'https://www.google.com/maps?q=Ibadan,Oyo',
    youtubeId: null,
    images: [img('ibadan-1'), img('ibadan-2'), img('ibadan-3')],
    description:
      'Great value starter home with easy access to major roads. Clean finishes and good ventilation.',
  },
]

const PRICE_UNITS = {
  k: 1_000,
  thousand: 1_000,
  lakh: 100_000,
  lakhs: 100_000,
  lac: 100_000,
  lacs: 100_000,
  cr: 10_000_000,
  crore: 10_000_000,
  crores: 10_000_000,
  m: 1_000_000,
  million: 1_000_000,
}

export function parsePriceToNumber(value) {
  if (value == null) return null
  if (typeof value === 'number') return Number.isFinite(value) ? value : null

  const text = String(value).trim()
  if (!text) return null

  const normalized = text.replace(/,/g, '').toLowerCase()
  const match = normalized.match(/^(\d+(?:\.\d+)?)\s*([a-z]+)?$/)
  if (!match) return null

  const amount = Number(match[1])
  if (!Number.isFinite(amount)) return null

  const unit = match[2]
  if (!unit) return amount

  const multiplier = PRICE_UNITS[unit]
  if (!multiplier) return null
  return amount * multiplier
}

export function formatPrice(value, currency = 'INR') {
  if (value == null || value === '') return '—'

  if (typeof value === 'string') {
    const raw = value.trim()
    if (!raw) return '—'
    // Keep authored labels like "80 Lakhs" as-is.
    if (/[a-zA-Z]/.test(raw)) return raw

    const parsed = parsePriceToNumber(raw)
    if (!Number.isFinite(parsed)) return raw
    try {
      return new Intl.NumberFormat('en-IN', { style: 'currency', currency, maximumFractionDigits: 0 }).format(parsed)
    } catch {
      return `${currency} ${raw}`
    }
  }

  const parsed = parsePriceToNumber(value)
  if (!Number.isFinite(parsed)) return String(value)
  try {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency, maximumFractionDigits: 0 }).format(parsed)
  } catch {
    return `${currency} ${parsed.toLocaleString()}`
  }
}

function hasDisplayablePrice(value) {
  if (value == null) return false
  if (typeof value === 'number') return Number.isFinite(value) && value > 0

  const raw = String(value).trim()
  if (!raw) return false

  const parsed = parsePriceToNumber(raw)
  if (Number.isFinite(parsed)) return parsed > 0

  const numericMatch = raw.replace(/,/g, '').match(/(\d+(?:\.\d+)?)/)
  if (numericMatch) return Number(numericMatch[1]) > 0

  return false
}

export function formatPropertyDisplayPrice(property, currencyFallback = 'INR') {
  const minExists = hasDisplayablePrice(property?.minPrice)
  const maxExists = hasDisplayablePrice(property?.maxPrice)
  const currency = property?.currency || currencyFallback

  if (minExists && maxExists) {
    return `${formatPrice(property.minPrice, currency)} – ${formatPrice(property.maxPrice, currency)}`
  }
  if (minExists) return formatPrice(property.minPrice, currency)
  if (maxExists) return formatPrice(property.maxPrice, currency)
  if (hasDisplayablePrice(property?.price)) return formatPrice(property.price, currency)
  return '—'
}

