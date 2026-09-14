import type { ComponentPublicInstance, SlotsType } from 'vue'
import type {
  PanelAnchor,
  PanelAnchorRegistry
} from '../../panel/src/panelContext'
import type { PageSlots } from './interface'
import { defineComponent, h, provide, shallowReactive } from 'vue'
import { useConfig, useStyle } from '../../_mixins'
import {
  panelAnchorInjectionKey,
  panelAnchors
} from '../../panel/src/panelContext'
import style from './styles/index.cssr'

export default defineComponent({
  name: 'Page',
  slots: Object as SlotsType<PageSlots>,
  setup() {
    const { mergedClsPrefixRef } = useConfig()
    useStyle('-page', style, mergedClsPrefixRef)
    // the anchor elements are reactive so a panel can move into its anchor
    // as soon as the anchor is registered
    const anchorElements = shallowReactive<
      Partial<Record<PanelAnchor, HTMLElement>>
    >({})
    const registry: PanelAnchorRegistry = {
      register(anchor, element) {
        if (element)
          anchorElements[anchor] = element
        else delete anchorElements[anchor]
      },
      getAnchor(anchor) {
        return anchorElements[anchor] ?? null
      }
    }
    provide(panelAnchorInjectionKey, registry)
    // stable ref setters, otherwise every re-render would unregister and
    // register the anchors again
    const anchorRefSetters = {} as Record<
      PanelAnchor,
      (element: Element | ComponentPublicInstance | null) => void
    >
    panelAnchors.forEach((anchor) => {
      anchorRefSetters[anchor] = (element) => {
        registry.register(anchor, (element as HTMLElement | null) ?? null)
      }
    })
    return {
      mergedClsPrefix: mergedClsPrefixRef,
      anchorRefSetters
    }
  },
  render() {
    const { mergedClsPrefix, anchorRefSetters } = this
    return (
      <div class={`${mergedClsPrefix}-page`}>
        <div class={`${mergedClsPrefix}-page-anchors`}>
          {panelAnchors.map(anchor => (
            <div
              key={anchor}
              ref={anchorRefSetters[anchor]}
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
