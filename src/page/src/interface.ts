import type { VNode } from 'vue'
import type { PanelGroupHandle } from '../../panel/src/panelContext'

export interface PageSlots {
  default?: () => VNode[]
}

// methods of a page, they are available on the template ref of the page
export interface PageInst {
  getPanels: () => PanelGroupHandle[]
  getPanel: (name: string) => PanelGroupHandle | undefined
  bringToFront: (name: string) => boolean
}
