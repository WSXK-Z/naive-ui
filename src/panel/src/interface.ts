import type { VNode } from 'vue'

export type PanelOffset = readonly [number, number]

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
