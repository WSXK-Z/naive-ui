import type { PanelStorage } from './panelContext'
import { isBrowser } from '../../_utils'

// Bump it when the layout of the persisted state changes, an outdated value is
// ignored instead of being applied.
const panelPersistStateVersion = 1

export interface PanelPersistState {
  offset?: [number, number]
  scale?: number
  width?: number
  height?: number
  collapsed?: boolean
}

export function resolvePanelStorage(
  storage: PanelStorage | undefined
): PanelStorage | null {
  if (storage)
    return storage
  if (!isBrowser)
    return null
  return window.localStorage
}

export function resolvePanelPersistKey(
  namespace: string | undefined,
  key: string
): string {
  return namespace ? `${namespace}:${key}` : key
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value)
}

function normalizeOffset(value: unknown): [number, number] | null {
  if (!Array.isArray(value) || value.length !== 2)
    return null
  const [x, y] = value as unknown[]
  if (!isFiniteNumber(x) || !isFiniteNumber(y))
    return null
  return [x, y]
}

function normalizeState(value: unknown): PanelPersistState | null {
  if (typeof value !== 'object' || value === null)
    return null
  const { version, offset, scale, width, height, collapsed } = value as Record<
    string,
    unknown
  >
  if (version !== panelPersistStateVersion)
    return null
  const state: PanelPersistState = {}
  const normalizedOffset = normalizeOffset(offset)
  if (normalizedOffset)
    state.offset = normalizedOffset
  if (isFiniteNumber(scale))
    state.scale = scale
  if (isFiniteNumber(width) && width > 0)
    state.width = width
  if (isFiniteNumber(height) && height > 0)
    state.height = height
  if (typeof collapsed === 'boolean')
    state.collapsed = collapsed
  return state
}

export function readPanelPersistState(
  storage: PanelStorage,
  key: string
): PanelPersistState | null {
  try {
    const raw = storage.getItem(key)
    if (!raw)
      return null
    return normalizeState(JSON.parse(raw))
  }
  catch {
    // an unreadable or invalid value never breaks the panel
    return null
  }
}

export function writePanelPersistState(
  storage: PanelStorage,
  key: string,
  state: PanelPersistState
): void {
  try {
    storage.setItem(
      key,
      JSON.stringify({ version: panelPersistStateVersion, ...state })
    )
  }
  catch {
    // a full or unavailable storage is not an error for the panel
  }
}
