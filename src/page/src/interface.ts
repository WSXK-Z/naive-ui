import type { VNode } from 'vue'

export interface PageSlots {
  default?: () => VNode[]
}
