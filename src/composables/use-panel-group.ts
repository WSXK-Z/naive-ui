import type { PanelContext, PanelGroupHandle } from '../panel/src/panelContext'
import { inject } from 'vue'
import { panelContextInjectionKey } from '../panel/src/panelContext'

export interface PanelGroup {
  // all panels registered in the page
  getPanels: () => PanelGroupHandle[]
  getPanel: (name: string) => PanelGroupHandle | undefined
  bringToFront: (name: string) => boolean
}

export function createPanelGroup(context: PanelContext): PanelGroup {
  return {
    getPanels: () => context.getPanels(),
    getPanel: name => context.getPanel(name),
    bringToFront: (name) => {
      const panel = context.getPanel(name)
      if (!panel)
        return false
      panel.bringToFront()
      return true
    }
  }
}

// Returns the panel group of the page a component is in. Panels of the same
// page use it to reach each other, it is `null` outside of a page.
export function usePanelGroup(): PanelGroup | null {
  const context = inject(panelContextInjectionKey, null)
  if (!context)
    return null
  return createPanelGroup(context)
}
