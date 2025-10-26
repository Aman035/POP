import { Platform } from '@/lib/types'

const PLATFORM_VALUES = new Set<Platform>([
  Platform.Twitter,
  Platform.Farcaster,
  Platform.Lens,
  Platform.Other
])

const PLATFORM_KEYWORDS: Record<string, Platform> = {
  'twitter': Platform.Twitter,
  'x': Platform.Twitter,
  'twitter / x': Platform.Twitter,
  'twitter/x': Platform.Twitter,
  'twitterx': Platform.Twitter,
  'farcaster': Platform.Farcaster,
  'lens': Platform.Lens,
  'other': Platform.Other
}

const PLATFORM_META: Record<Platform, { label: string; color: string }> = {
  [Platform.Twitter]: { label: 'Twitter / X', color: '#1DA1F2' },
  [Platform.Farcaster]: { label: 'Farcaster', color: '#8A63D2' },
  [Platform.Lens]: { label: 'Lens', color: '#00D4AA' },
  [Platform.Other]: { label: 'Other', color: '#6B7280' }
}

function normalizePlatformString(value: string) {
  return value.trim().toLowerCase()
}

export function resolvePlatformMetadata(value?: string | number | null): Platform {
  if (value === null || value === undefined) {
    return Platform.Other
  }

  if (typeof value === 'number') {
    return PLATFORM_VALUES.has(value) ? value : Platform.Other
  }

  const numericValue = Number(value)
  if (!Number.isNaN(numericValue)) {
    const platformFromNumber = numericValue as Platform
    if (PLATFORM_VALUES.has(platformFromNumber)) {
      return platformFromNumber
    }
  }

  const normalized = normalizePlatformString(String(value))
  return PLATFORM_KEYWORDS[normalized] ?? Platform.Other
}

export function getPlatformLabel(platform: Platform): string {
  return PLATFORM_META[platform]?.label ?? PLATFORM_META[Platform.Other].label
}

export function getPlatformColor(platform: Platform): string {
  return PLATFORM_META[platform]?.color ?? PLATFORM_META[Platform.Other].color
}

export function getPlatformMeta(platform: Platform) {
  return PLATFORM_META[platform] ?? PLATFORM_META[Platform.Other]
}
