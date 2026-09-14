import type { VNode } from 'vue'

export type PanelOffset = readonly [number, number]

export interface PanelSize {
  width?: number
  height?: number
}

export interface PanelToolsSlotProps {
  scale: number
  offset: PanelOffset
  setScale: (scale: number) => void
  setOffset: (offset: PanelOffset) => void
  reset: () => void
  collapse: () => void
  exit: () => void
}

export interface PanelSlots {
  default?: () => VNode[]
  tools?: (props: PanelToolsSlotProps) => VNode[]
}

// methods of a panel, they are available on the template ref of a panel and on
// the handle inside the panel group
export interface PanelInst {
  reset: () => void
  collapse: () => void
  expand: () => void
  bringToFront: () => void
  setOffset: (offset: PanelOffset) => void
  setScale: (scale: number) => void
  setSize: (size: PanelSize) => void
  getRect: () => DOMRect | null
}
