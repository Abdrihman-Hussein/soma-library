import type { JacketSpec } from '../types'

// ── Real cover art ─────────────────────────────────────────────────
// Verified Open Library cover ids. Served from covers.openlibrary.org.
// Requesting a missing id returns HTTP 404, which the Cover component
// catches and swaps to the designed jacket below.

export const OPEN_LIBRARY_COVERS = 'https://covers.openlibrary.org'

export type CoverSize = 'S' | 'M' | 'L'

/**
 * Build a cover URL. `default=false` makes Open Library return a real 404
 * instead of a blank placeholder, so `onError` fires and the designed
 * jacket takes over cleanly.
 */
export function openLibraryCoverUrl(
  source: { coverId?: number; isbn?: string },
  size: CoverSize = 'L',
): string | null {
  const { coverId, isbn } = source
  if (coverId) return `${OPEN_LIBRARY_COVERS}/b/id/${coverId}-${size}.jpg?default=false`
  if (isbn) return `${OPEN_LIBRARY_COVERS}/b/isbn/${isbn}-${size}.jpg?default=false`
  return null
}

// ── Designed jackets ───────────────────────────────────────────────
// Used for the Somali-language catalogue and anything without real
// cover art. These are full typographic jackets, not gradient boxes:
// a printed ground, a geometric motif and set type.

/** Warm, print-safe palettes. Each is ground / type / accent. */
export const jacketPresets = {
  // Grounds are dark enough that light ink reaches ~4.5:1. The original
  // ochre (#B5791F) was too light — no ink colour could clear 4.5:1 on it,
  // which made the jacket title hard to read at thumbnail size.
  ochre: { ground: '#8F5C12', ink: '#FFF7E6', accent: '#EFD5A2', motif: 'arch' },
  clay: { ground: '#A8452F', ink: '#FDF1E7', accent: '#F0BFA6', motif: 'chevron' },
  deepTeal: { ground: '#0F5148', ink: '#EAF5F1', accent: '#93C9B9', motif: 'wave' },
  slate: { ground: '#22333B', ink: '#F2EDE3', accent: '#9CC0B8', motif: 'grid' },
  plum: { ground: '#5B3550', ink: '#F6ECF3', accent: '#D3A9C4', motif: 'rings' },
  olive: { ground: '#5C6338', ink: '#F5F3E2', accent: '#C7CE9A', motif: 'moon' },
  indigo: { ground: '#2B3F6B', ink: '#EDF1FA', accent: '#A9BEE4', motif: 'star' },
  sand: { ground: '#CDAE83', ink: '#2E2415', accent: '#6B563A', motif: 'arch' },
  charcoal: { ground: '#2A2622', ink: '#F5EFE5', accent: '#C79A54', motif: 'rings' },
  rust: { ground: '#8C3B21', ink: '#FBE9DD', accent: '#E0A183', motif: 'wave' },
} as const satisfies Record<string, JacketSpec>

export type JacketPresetName = keyof typeof jacketPresets

/** Pick the most readable type colour for an arbitrary ground, if needed. */
export function readableInk(ground: string): string {
  const hex = ground.replace('#', '')
  const r = parseInt(hex.slice(0, 2), 16)
  const g = parseInt(hex.slice(2, 4), 16)
  const b = parseInt(hex.slice(4, 6), 16)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return luminance > 0.62 ? '#2A2418' : '#FBF6EC'
}
