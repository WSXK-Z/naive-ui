import type {
  ComponentPublicInstance,
  CSSProperties,
  PropType,
  SlotsType
} from 'vue'
import type { ExtractPublicPropTypes } from '../../_utils'
import type {
  PanelAnchor,
  PanelContext,
  PanelGroupHandle,
  PanelStorage
} from '../../panel/src/panelContext'
import type { PageSlots } from './interface'
import { defineComponent, h, provide, ref, shallowReactive } from 'vue'
import { useConfig, useStyle } from '../../_mixins'
import {
  panelAnchors,
  panelContextInjectionKey
} from '../../panel/src/panelContext'
import style from './styles/index.cssr'

// the panel group of a page starts its z-index here, it is above the anchors
// overlay
const pagePanelZIndexBase = 100

export const pageProps = {
  anchors: {
    type: Array as unknown as PropType<readonly PanelAnchor[]>,
    default: () => panelAnchors
  },
  anchorGap: {
    type: [Number, String] as PropType<number | string>,
    default: 10
  },
  anchorDirection: {
    type: String as PropType<'vertical' | 'horizontal'>,
    default: 'vertical'
  },
  anchorWrap: Boolean,
  persistNamespace: String,
  persistStorage: Object as PropType<PanelStorage | undefined>
} as const

export type PageProps = ExtractPublicPropTypes<typeof pageProps>

function resolveAnchorGap(gap: number | string): string {
  return typeof gap === 'number' ? `${gap}px` : gap
}

export default defineComponent({
  name: 'Page',
  props: pageProps,
  slots: Object as SlotsType<PageSlots>,
  setup(props) {
    const { mergedClsPrefixRef } = useConfig()
    useStyle('-page', style, mergedClsPrefixRef)
    const pageElRef = ref<HTMLElement | null>(null)
    // the anchor elements are reactive so a panel can move into its anchor
    // as soon as the anchor is registered
    const anchorElements = shallowReactive<
      Partial<Record<PanelAnchor, HTMLElement>>
    >({})
    // the panel group of the page, panels and the page collaborate through it
    const panels = shallowReactive<PanelGroupHandle[]>([])
    let panelZIndex = pagePanelZIndexBase

    const context: PanelContext = {
      register(anchor, element) {
        if (element)
          anchorElements[anchor] = element
        else delete anchorElements[anchor]
      },
      getAnchor(anchor) {
        return anchorElements[anchor] ?? null
      },
      getContainer() {
        return pageElRef.value
      },
      registerPanel(panel) {
        if (!panels.some(({ id }) => id === panel.id))
          panels.push(panel)
      },
      unregisterPanel(id) {
        const index = panels.findIndex(panel => panel.id === id)
        if (index !== -1)
          panels.splice(index, 1)
      },
      getPanels() {
        return panels
      },
      getPanel(name) {
        return panels.find(panel => panel.name === name)
      },
      bringToFront(id) {
        if (!panels.some(panel => panel.id === id))
          return null
        panelZIndex += 1
        return panelZIndex
      },
      get persist() {
        return {
          namespace: props.persistNamespace,
          storage: props.persistStorage
        }
      }
    }
    provide(panelContextInjectionKey, context)
    // stable ref setters, otherwise every re-render would unregister and
    // register the anchors again
    const anchorRefSetters = new Map<
      PanelAnchor,
      (element: Element | ComponentPublicInstance | null) => void
    >()
    function getAnchorRefSetter(
      anchor: PanelAnchor
    ): (element: Element | ComponentPublicInstance | null) => void {
      let refSetter = anchorRefSetters.get(anchor)
      if (!refSetter) {
        refSetter = (element) => {
          context.register(anchor, (element as HTMLElement | null) ?? null)
        }
        anchorRefSetters.set(anchor, refSetter)
      }
      return refSetter
    }

    function getPanels(): PanelGroupHandle[] {
      return panels
    }

    function getPanel(name: string): PanelGroupHandle | undefined {
      return panels.find(panel => panel.name === name)
    }

    function bringToFront(name: string): boolean {
      const panel = getPanel(name)
      if (!panel)
        return false
      panel.bringToFront()
      return true
    }

    // a custom anchor is positioned by the usage, the built-in ones keep
    // their place
    return {
      mergedClsPrefix: mergedClsPrefixRef,
      pageElRef,
      getAnchorRefSetter,
      getPanels,
      getPanel,
      bringToFront
    }
  },
  render() {
    const { mergedClsPrefix, anchors } = this
    return (
      <div ref="pageElRef" class={`${mergedClsPrefix}-page`}>
        <div
          class={[
            `${mergedClsPrefix}-page-anchors`,
            {
              [`${mergedClsPrefix}-page-anchors--horizontal`]:
                this.anchorDirection === 'horizontal',
              [`${mergedClsPrefix}-page-anchors--wrap`]: this.anchorWrap
            }
          ]}
          style={
            {
              '--n-page-anchor-gap': resolveAnchorGap(this.anchorGap)
            } as CSSProperties
          }
        >
          {(anchors ?? panelAnchors).map(anchor => (
            <div
              key={anchor}
              ref={this.getAnchorRefSetter(anchor)}
              class={[
                `${mergedClsPrefix}-page-anchor`,
                `${mergedClsPrefix}-page-anchor--${anchor}`
              ]}
            />
          ))}
        </div>
        {this.$slots.default?.()}
      </div>
    )
  }
})
