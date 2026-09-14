import type { CSSProperties, PropType, Ref, SlotsType, VNode } from 'vue'
import type { ThemeProps } from '../../_mixins'
import type { ExtractPublicPropTypes, MaybeArray } from '../../_utils'
import type { PanelTheme, PanelThemeOverrides } from '../styles'
import type { PanelOffset, PanelSlots, PanelToolsSlotProps } from './interface'
import type { PanelAnchor } from './panelContext'
import { off, on } from 'evtd'
import {
  computed,
  defineComponent,
  Fragment,
  h,
  inject,
  mergeProps,
  onBeforeUnmount,
  ref,
  Teleport,
  watch
} from 'vue'
import { NBaseIcon } from '../../_internal'
import {
  CheckmarkIcon,
  ResizeSmallIcon,
  RetryIcon,
  ZoomInIcon,
  ZoomOutIcon
} from '../../_internal/icons'
import { useConfig, useTheme, useThemeClass } from '../../_mixins'
import { call, resolveSlotWithTypedProps } from '../../_utils'
import { NButton } from '../../button'
import { NTag } from '../../tag'
import { panelLight } from '../styles'
import { panelAnchorInjectionKey } from './panelContext'
import style from './styles/index.cssr'

const panelScaleMin = 0.3
const panelScaleMax = 3
const panelScaleStep = 0.1
const panelWheelScaleStep = 0.05

function resolveClosest(
  target: EventTarget | null,
  selector: string
): Element | null {
  const element = target as HTMLElement | null
  if (!element || typeof element.closest !== 'function') {
    return null
  }
  try {
    return element.closest(selector)
  }
  catch {
    // an invalid `operate-trigger` selector never matches
    return null
  }
}

function renderIconButton(
  clsPrefix: string,
  icon: VNode,
  onClick: () => void,
  disabled?: boolean
): VNode {
  return (
    <NButton
      text
      size="tiny"
      focusable={false}
      disabled={disabled}
      onClick={onClick}
    >
      {{
        default: () => (
          <NBaseIcon clsPrefix={clsPrefix}>{{ default: () => icon }}</NBaseIcon>
        )
      }}
    </NButton>
  )
}

export const panelProps = {
  ...(useTheme.props as ThemeProps<PanelTheme, PanelThemeOverrides>),
  title: String,
  fixed: Boolean,
  anchor: {
    type: String as PropType<PanelAnchor>,
    default: 'top-right'
  },
  occupiesSpace: {
    type: Boolean,
    default: true
  },
  movable: Boolean,
  collapsible: Boolean,
  collapseTarget: String as PropType<PanelAnchor | undefined>,
  scalable: Boolean,
  scale: Number,
  scaleTransform: {
    type: Boolean,
    default: true
  },
  offset: Array as unknown as PropType<PanelOffset | undefined>,
  operateTrigger: {
    type: String,
    default: 'self'
  },
  operateOutline: {
    type: Boolean,
    default: true
  },
  operateTools: {
    type: Boolean,
    default: true
  },
  wheelScale: {
    type: Boolean,
    default: true
  },
  operating: {
    type: Boolean,
    default: undefined
  },
  'onUpdate:operating': [Function, Array] as PropType<
    MaybeArray<(operating: boolean) => void>
  >,
  onUpdateOperating: [Function, Array] as PropType<
    MaybeArray<(operating: boolean) => void>
  >,
  'onUpdate:offset': [Function, Array] as PropType<
    MaybeArray<(offset: PanelOffset) => void>
  >,
  onUpdateOffset: [Function, Array] as PropType<
    MaybeArray<(offset: PanelOffset) => void>
  >,
  'onUpdate:scale': [Function, Array] as PropType<
    MaybeArray<(scale: number) => void>
  >,
  onUpdateScale: [Function, Array] as PropType<
    MaybeArray<(scale: number) => void>
  >,
  onCollapse: Function as PropType<() => void>,
  onExpand: Function as PropType<() => void>
} as const

export type PanelProps = ExtractPublicPropTypes<typeof panelProps>

export default defineComponent({
  name: 'Panel',
  // the root is a fragment of teleports, so attributes are bound manually
  inheritAttrs: false,
  props: panelProps,
  slots: Object as SlotsType<PanelSlots>,
  setup(props) {
    const { mergedClsPrefixRef, inlineThemeDisabled } = useConfig(props)
    const themeRef = useTheme(
      'Panel',
      '-panel',
      style,
      panelLight,
      props,
      mergedClsPrefixRef
    )
    const panelAnchorRegistry = inject(panelAnchorInjectionKey, null)

    const panelElRef = ref<HTMLElement | null>(null)
    const collapsedRef = ref(false)
    const operatingRef = ref(false)
    const draggingRef = ref(false)
    const uncontrolledOffsetRef = ref<[number, number]>([0, 0])
    const uncontrolledScaleRef = ref(1)
    // scale written by the panel before its parent responds to the update event
    const pendingScaleRef = ref<number | null>(null)

    const mergedOperatingRef = computed(() => {
      return props.operating ?? operatingRef.value
    })
    const mergedOffsetRef = computed<[number, number]>(() => {
      const { offset } = props
      return offset ? [offset[0], offset[1]] : uncontrolledOffsetRef.value
    })
    const mergedScaleRef = computed(() => {
      return pendingScaleRef.value ?? props.scale ?? uncontrolledScaleRef.value
    })
    const hasTransformRef = computed(() => {
      const [x, y] = mergedOffsetRef.value
      return x !== 0 || y !== 0 || mergedScaleRef.value !== 1
    })
    const collapseTargetRef = computed(() => {
      return props.collapseTarget ?? props.anchor
    })
    const teleportTargetRef = computed(() => {
      if (!props.fixed)
        return null
      return panelAnchorRegistry?.getAnchor(props.anchor) ?? null
    })
    const chipTeleportTargetRef = computed(() => {
      if (!collapsedRef.value)
        return null
      return panelAnchorRegistry?.getAnchor(collapseTargetRef.value) ?? null
    })

    const cssVarsRef = computed(() => {
      const {
        common: { cubicBezierEaseInOut, fontFamily },
        self: {
          textColor,
          fontSize,
          borderRadius,
          toolsColor,
          toolsBorderColor,
          toolsBoxShadow,
          outlineColor
        }
      } = themeRef.value
      return {
        '--n-bezier': cubicBezierEaseInOut,
        '--n-font-family': fontFamily,
        '--n-font-size': fontSize,
        '--n-text-color': textColor,
        '--n-border-radius': borderRadius,
        '--n-tools-color': toolsColor,
        '--n-tools-border-color': toolsBorderColor,
        '--n-tools-box-shadow': toolsBoxShadow,
        '--n-outline-color': outlineColor
      }
    })

    const panelStyleRef = computed(() => {
      const [x, y] = mergedOffsetRef.value
      return {
        '--n-panel-x': `${x}px`,
        '--n-panel-y': `${y}px`,
        '--n-panel-scale': String(mergedScaleRef.value),
        display: collapsedRef.value ? 'none' : undefined
      }
    })

    function doUpdateOffset(offset: PanelOffset): void {
      uncontrolledOffsetRef.value = [offset[0], offset[1]]
      if (props.onUpdateOffset)
        call(props.onUpdateOffset, offset)
      const _onUpdateOffset = props['onUpdate:offset']
      if (_onUpdateOffset)
        call(_onUpdateOffset, offset)
    }

    function doUpdateScale(scale: number): void {
      const nextScale
        = Math.round(
          Math.min(Math.max(scale, panelScaleMin), panelScaleMax) * 100
        ) / 100
      pendingScaleRef.value = nextScale
      uncontrolledScaleRef.value = nextScale
      if (props.onUpdateScale)
        call(props.onUpdateScale, nextScale)
      const _onUpdateScale = props['onUpdate:scale']
      if (_onUpdateScale)
        call(_onUpdateScale, nextScale)
    }

    function stepScale(step: number): void {
      doUpdateScale(mergedScaleRef.value + step)
    }

    function reset(): void {
      doUpdateOffset([0, 0])
      doUpdateScale(1)
    }

    function doUpdateOperating(operating: boolean): void {
      if (operating === mergedOperatingRef.value)
        return
      operatingRef.value = operating
      if (props.onUpdateOperating)
        call(props.onUpdateOperating, operating)
      const _onUpdateOperating = props['onUpdate:operating']
      if (_onUpdateOperating)
        call(_onUpdateOperating, operating)
    }

    function doCollapse(): void {
      if (collapsedRef.value)
        return
      collapsedRef.value = true
      doUpdateOperating(false)
      if (props.onCollapse)
        props.onCollapse()
    }

    function doExpand(): void {
      if (!collapsedRef.value)
        return
      collapsedRef.value = false
      if (props.onExpand)
        props.onExpand()
    }

    function exitOperating(): void {
      doUpdateOperating(false)
    }

    // there may be more than one pointer event at the same time, only the
    // pointer which started dragging can move the panel
    let dragPointerId: number | null = null
    let dragStartX = 0
    let dragStartY = 0
    let dragStartOffset: PanelOffset = [0, 0]

    function handlePointerMove(e: PointerEvent): void {
      if (dragPointerId === null || e.pointerId !== dragPointerId)
        return
      doUpdateOffset([
        Math.round(dragStartOffset[0] + e.clientX - dragStartX),
        Math.round(dragStartOffset[1] + e.clientY - dragStartY)
      ])
    }

    function endDrag(): void {
      const pointerId = dragPointerId
      if (pointerId === null)
        return
      dragPointerId = null
      draggingRef.value = false
      off('pointermove', window, handlePointerMove)
      off('pointerup', window, handlePointerUp)
      off('pointercancel', window, handlePointerUp)
      const panelEl = panelElRef.value
      if (panelEl) {
        // the capturing pointer may be gone already
        try {
          panelEl.releasePointerCapture(pointerId)
        }
        catch {}
      }
    }

    function handlePointerUp(e: PointerEvent): void {
      if (dragPointerId === null || e.pointerId !== dragPointerId)
        return
      endDrag()
    }

    function handlePointerdown(e: PointerEvent): void {
      if (!mergedOperatingRef.value || !props.movable || e.button !== 0)
        return
      if (
        resolveClosest(e.target, `.${mergedClsPrefixRef.value}-panel-tools`)
      ) {
        return
      }
      dragPointerId = e.pointerId
      dragStartX = e.clientX
      dragStartY = e.clientY
      dragStartOffset = mergedOffsetRef.value
      draggingRef.value = true
      on('pointermove', window, handlePointerMove)
      on('pointerup', window, handlePointerUp)
      on('pointercancel', window, handlePointerUp)
      const panelEl = panelElRef.value
      if (panelEl) {
        // synthetic pointers and detached elements cannot be captured
        try {
          panelEl.setPointerCapture(e.pointerId)
        }
        catch {}
      }
    }

    function handleWheel(e: WheelEvent): void {
      if (!mergedOperatingRef.value || !props.scalable || !props.wheelScale) {
        return
      }
      // don't scroll the page while scaling
      e.preventDefault()
      stepScale(e.deltaY > 0 ? -panelWheelScaleStep : panelWheelScaleStep)
    }

    function handleDblclick(e: MouseEvent): void {
      // the tools of a collapsible panel are its only way to be collapsed
      if (!props.movable && !props.scalable && !props.collapsible)
        return
      if (mergedOperatingRef.value) {
        doUpdateOperating(false)
        return
      }
      const { operateTrigger } = props
      if (
        resolveClosest(e.target, `.${mergedClsPrefixRef.value}-panel-tools`)
      ) {
        return
      }
      if (
        operateTrigger !== 'self'
        && !resolveClosest(e.target, operateTrigger)
      ) {
        return
      }
      doUpdateOperating(true)
    }

    function handleKeydown(e: KeyboardEvent): void {
      if (e.key === 'Escape')
        doUpdateOperating(false)
    }

    function handleDocumentPointerdown(e: PointerEvent): void {
      const panelEl = panelElRef.value
      if (!panelEl)
        return
      const target = e.target
      if (target instanceof Node && panelEl.contains(target))
        return
      doUpdateOperating(false)
    }

    function handleChipClick(): void {
      doExpand()
    }

    function handleChipKeydown(e: KeyboardEvent): void {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        doExpand()
      }
    }

    watch(
      mergedOperatingRef,
      (operating) => {
        if (operating) {
          on('keydown', document, handleKeydown)
          // captured, so it isn't swallowed by inner `stopPropagation`
          on('pointerdown', document, handleDocumentPointerdown, true)
        }
        else {
          off('keydown', document, handleKeydown)
          off('pointerdown', document, handleDocumentPointerdown, true)
          endDrag()
        }
      },
      { immediate: true }
    )

    watch(
      () => props.scale,
      () => {
        pendingScaleRef.value = null
      }
    )

    onBeforeUnmount(() => {
      off('keydown', document, handleKeydown)
      off('pointerdown', document, handleDocumentPointerdown, true)
      endDrag()
    })

    const themeClassHandle = inlineThemeDisabled
      ? useThemeClass('panel', undefined, cssVarsRef, props)
      : undefined

    const toolsSlotPropsRef = computed<PanelToolsSlotProps>(() => ({
      scale: mergedScaleRef.value,
      offset: mergedOffsetRef.value,
      setScale: doUpdateScale,
      setOffset: doUpdateOffset,
      reset,
      collapse: doCollapse,
      exit: exitOperating
    }))

    return {
      panelElRef,
      mergedOperating: mergedOperatingRef,
      dragging: draggingRef,
      collapsed: collapsedRef,
      hasTransform: hasTransformRef,
      teleportTarget: teleportTargetRef,
      chipTeleportTarget: chipTeleportTargetRef,
      panelStyle: panelStyleRef,
      toolsSlotProps: toolsSlotPropsRef,
      mergedClsPrefix: mergedClsPrefixRef,
      cssVars: inlineThemeDisabled
        ? undefined
        : (cssVarsRef as Ref<CSSProperties>),
      themeClass: themeClassHandle?.themeClass,
      onRender: themeClassHandle?.onRender,
      handlePointerdown,
      handleWheel,
      handleDblclick,
      handleChipClick,
      handleChipKeydown
    }
  },
  render() {
    const { mergedClsPrefix, $slots } = this
    this.onRender?.()
    const showTools
      = this.mergedOperating && (this.operateTools || !!$slots.tools)
    const panel = (
      <div
        ref="panelElRef"
        {...mergeProps(this.$attrs, {
          class: [
            `${mergedClsPrefix}-panel`,
            this.themeClass,
            {
              [`${mergedClsPrefix}-panel--floating`]:
                !this.fixed && !this.occupiesSpace,
              [`${mergedClsPrefix}-panel--operating`]: this.mergedOperating,
              [`${mergedClsPrefix}-panel--outlined`]:
                this.mergedOperating && this.operateOutline,
              [`${mergedClsPrefix}-panel--dragging`]: this.dragging,
              [`${mergedClsPrefix}-panel--scale-as-size`]: !this.scaleTransform,
              [`${mergedClsPrefix}-panel--transformed`]: this.hasTransform
            }
          ],
          style: [this.panelStyle, this.cssVars],
          onDblclick: this.handleDblclick,
          onPointerdown: this.handlePointerdown,
          onWheel: this.handleWheel
        })}
      >
        {showTools ? (
          <div class={`${mergedClsPrefix}-panel-tools`}>
            {resolveSlotWithTypedProps(
              $slots.tools,
              this.toolsSlotProps,
              slotProps => [
                this.title ? (
                  <div class={`${mergedClsPrefix}-panel-tools__title`}>
                    {this.title}
                  </div>
                ) : null,
                this.scalable
                  ? [
                      renderIconButton(
                        mergedClsPrefix,
                        <ZoomOutIcon />,
                        () =>
                          slotProps.setScale(slotProps.scale - panelScaleStep),
                        slotProps.scale <= panelScaleMin
                      ),
                      <span class={`${mergedClsPrefix}-panel-tools__value`}>
                        {Math.round(slotProps.scale * 100)}
                        %
                      </span>,
                      renderIconButton(
                        mergedClsPrefix,
                        <ZoomInIcon />,
                        () =>
                          slotProps.setScale(slotProps.scale + panelScaleStep),
                        slotProps.scale >= panelScaleMax
                      ),
                      renderIconButton(
                        mergedClsPrefix,
                        <RetryIcon />,
                        slotProps.reset,
                        !this.hasTransform
                      )
                    ]
                  : null,
                this.collapsible
                  ? renderIconButton(
                      mergedClsPrefix,
                      <ResizeSmallIcon />,
                      slotProps.collapse
                    )
                  : null,
                renderIconButton(
                  mergedClsPrefix,
                  <CheckmarkIcon />,
                  slotProps.exit
                )
              ]
            )}
          </div>
        ) : null}
        {$slots.default?.()}
      </div>
    )
    return (
      <Fragment>
        <Teleport to={this.teleportTarget} disabled={!this.teleportTarget}>
          {panel}
        </Teleport>
        {this.collapsed ? (
          <Teleport
            to={this.chipTeleportTarget}
            disabled={!this.chipTeleportTarget}
          >
            <span
              class={`${mergedClsPrefix}-panel-chip`}
              role="button"
              tabindex={0}
              onClick={this.handleChipClick}
              onKeydown={this.handleChipKeydown}
            >
              <NTag size="small">
                {{
                  default: () =>
                    this.title || (
                      <NBaseIcon clsPrefix={mergedClsPrefix}>
                        {{ default: () => <ResizeSmallIcon /> }}
                      </NBaseIcon>
                    )
                }}
              </NTag>
            </span>
          </Teleport>
        ) : null}
      </Fragment>
    )
  }
})
