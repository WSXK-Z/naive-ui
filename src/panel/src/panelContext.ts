import { createInjectionKey } from '../../_utils'

export type PanelAnchor
  = | 'top-left'
    | 'top-center'
    | 'top-right'
    | 'center'
    | 'bottom-left'
    | 'bottom-center'
    | 'bottom-right'
  // a page may register anchors of its own
    | (string & {})

export const panelAnchors: readonly PanelAnchor[] = [
  'top-left',
  'top-center',
  'top-right',
  'center',
  'bottom-left',
  'bottom-center',
  'bottom-right'
]

export type PanelId = string

// The handle of a panel inside the panel group of a page. The page and the
// other panels operate a panel through it.
export interface PanelGroupHandle {
  id: PanelId
  name: string | undefined
  getRect: () => DOMRect | null
  getZIndex: () => number | null
  reset: () => void
  collapse: () => void
  expand: () => void
  bringToFront: () => void
}

export interface PanelStorage {
  getItem: (key: string) => string | null | undefined
  setItem: (key: string, value: string) => void
}

export interface PanelPersistContext {
  namespace?: string
  storage?: PanelStorage
}

export interface PanelContext {
  register: (anchor: PanelAnchor, element: HTMLElement | null) => void
  getAnchor: (anchor: PanelAnchor) => HTMLElement | null
  // The root element of the page. Panels use it as the drag boundary and the
  // scope of the panel group.
  getContainer: () => HTMLElement | null
  registerPanel: (panel: PanelGroupHandle) => void
  unregisterPanel: (id: PanelId) => void
  getPanels: () => PanelGroupHandle[]
  getPanel: (name: string) => PanelGroupHandle | undefined
  bringToFront: (id: PanelId) => number | null
  persist: PanelPersistContext
}

export const panelContextInjectionKey
  = createInjectionKey<PanelContext>('n-panel-context')
