import { createInjectionKey } from '../../_utils'

export type PanelAnchor
  = | 'top-left'
    | 'top-center'
    | 'top-right'
    | 'center'
    | 'bottom-left'
    | 'bottom-center'
    | 'bottom-right'

export const panelAnchors: readonly PanelAnchor[] = [
  'top-left',
  'top-center',
  'top-right',
  'center',
  'bottom-left',
  'bottom-center',
  'bottom-right'
]

export interface PanelAnchorRegistry {
  register: (anchor: PanelAnchor, element: HTMLElement | null) => void
  getAnchor: (anchor: PanelAnchor) => HTMLElement | null
}

export const panelAnchorInjectionKey
  = createInjectionKey<PanelAnchorRegistry>('n-panel-anchor')
