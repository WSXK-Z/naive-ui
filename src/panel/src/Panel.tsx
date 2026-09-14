import type { CSSProperties, PropType, Ref, SlotsType, VNode } from 'vue'
import type { ThemeProps } from '../../_mixins'
import type { ExtractPublicPropTypes, MaybeArray } from '../../_utils'
import type { PanelTheme, PanelThemeOverrides } from '../styles'
import type {
  PanelOffset,
  PanelSize,
  PanelSlots,
  PanelToolsSlotProps
} from './interface'
import type { PanelAnchor, PanelGroupHandle } from './panelContext'
import type { PanelRect } from './utils'
import { off, on } from 'evtd'
import { createId } from 'seemly'
import {
  computed,
  defineComponent,
  Fragment,
  h,
  inject,
  mergeProps,
  onBeforeUnmount,
  onMounted,
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
import { panelContextInjectionKey } from './panelContext'
import {
  readPanelPersistState,
  resolvePanelPersistKey,
  resolvePanelStorage,
  writePanelPersistState
} from './persistence'
import style from './styles/index.cssr'
import { resolvePanelDragDelta, resolvePanelResizeSize } from './utils'

const panelScaleMin = 0.3
const panelScaleMax = 3
const panelScaleStep = 0.1
const panelWheelScaleStep = 0.05
// the layout is written back this long after the last change
const panelPersistDelay = 200

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
  name: String,
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
  resizable: Boolean,
  width: Number,
  height: Number,
  dragGrid: Number,
  dragSnap: Number,
  dragBoundary: Boolean,
  persist: String,
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
  'onUpdate:width': [Function, Array] as PropType<
    MaybeArray<(width: number | undefined) => void>
  >,
  onUpdateWidth: [Function, Array] as PropType<
    MaybeArray<(width: number | undefined) => void>
  >,
  'onUpdate:height': [Function, Array] as PropType<
    MaybeArray<(height: number | undefined) => void>
  >,
  onUpdateHeight: [Function, Array] as PropType<
    MaybeArray<(height: number | undefined) => void>
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
    const panelContext = inject(panelContextInjectionKey, null)
    const panelId = createId()

    const panelElRef = ref<HTMLElement | null>(null)
    const collapsedRef = ref(false)
    const operatingRef = ref(false)
    const draggingRef = ref(false)
    const zIndexRef = ref<number | null>(null)
    const uncontrolledOffsetRef = ref<[number, number]>([0, 0])
    const uncontrolledScaleRef = ref(1)
    const uncontrolledWidthRef = ref<number | undefined>(undefined)
    const uncontrolledHeightRef = ref<number | undefined>(undefined)
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
    const mergedWidthRef = computed(() => {
      return props.width ?? uncontrolledWidthRef.value
    })
    const mergedHeightRef = computed(() => {
      return props.height ?? uncontrolledHeightRef.value
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
      return panelContext?.getAnchor(props.anchor) ?? null
    })
    const chipTeleportTargetRef = computed(() => {
      if (!collapsedRef.value)
        return null
      return panelContext?.getAnchor(collapseTargetRef.value) ?? null
    })
    const persistKeyRef = computed(() => {
      if (!props.persist)
        return null
      return resolvePanelPersistKey(
        panelContext?.persist.namespace,
        props.persist
      )
    })
    const persistStorageRef = computed(() => {
      if (!props.persist)
        return null
      return resolvePanelStorage(panelContext?.persist.storage)
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
          outlineColor,
          resizeTriggerColor
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
        '--n-outline-color': outlineColor,
        '--n-resize-trigger-color': resizeTriggerColor
      }
    })

    const panelStyleRef = computed(() => {
      const [x, y] = mergedOffsetRef.value
      const width = mergedWidthRef.value
      const height = mergedHeightRef.value
      return {
        '--n-panel-x': `${x}px`,
        '--n-panel-y': `${y}px`,
        '--n-panel-scale': String(mergedScaleRef.value),
        width: width === undefined ? undefined : `${width}px`,
        height: height === undefined ? undefined : `${height}px`,
        zIndex: zIndexRef.value ?? undefined,
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

    function doUpdateWidth(width: number | undefined): void {
      uncontrolledWidthRef.value = width
      if (props.onUpdateWidth)
        call(props.onUpdateWidth, width)
      const _onUpdateWidth = props['onUpdate:width']
      if (_onUpdateWidth)
        call(_onUpdateWidth, width)
    }

    function doUpdateHeight(height: number | undefined): void {
      uncontrolledHeightRef.value = height
      if (props.onUpdateHeight)
        call(props.onUpdateHeight, height)
      const _onUpdateHeight = props['onUpdate:height']
      if (_onUpdateHeight)
        call(_onUpdateHeight, height)
    }

    function doReset(): void {
      doUpdateOffset([0, 0])
      doUpdateScale(1)
      // an explicit size goes back to the size of the content
      if (mergedWidthRef.value !== undefined)
        doUpdateWidth(undefined)
      if (mergedHeightRef.value !== undefined)
        doUpdateHeight(undefined)
    }

    function doSetSize(size: PanelSize): void {
      if ('width' in size)
        doUpdateWidth(size.width)
      if ('height' in size)
        doUpdateHeight(size.height)
    }

    function bringToFront(): void {
      const zIndex = panelContext?.bringToFront(panelId)
      if (zIndex !== undefined && zIndex !== null)
        zIndexRef.value = zIndex
    }

    let persistTimer: ReturnType<typeof setTimeout> | undefined

    function restorePersistState(): void {
      const key = persistKeyRef.value
      const storage = persistStorageRef.value
      if (!key || !storage)
        return
      const state = readPanelPersistState(storage, key)
      if (!state)
        return
      if (state.offset)
        doUpdateOffset(state.offset)
      if (state.scale !== undefined)
        doUpdateScale(state.scale)
      if (state.width !== undefined)
        doUpdateWidth(state.width)
      if (state.height !== undefined)
        doUpdateHeight(state.height)
      if (state.collapsed !== undefined)
        collapsedRef.value = state.collapsed
    }

    function schedulePersistState(): void {
      const key = persistKeyRef.value
      const storage = persistStorageRef.value
      if (!key || !storage)
        return
      if (persistTimer !== undefined)
        clearTimeout(persistTimer)
      persistTimer = setTimeout(() => {
        persistTimer = undefined
        writePanelPersistState(storage, key, {
          offset: mergedOffsetRef.value,
          scale: mergedScaleRef.value,
          width: mergedWidthRef.value,
          height: mergedHeightRef.value,
          collapsed: collapsedRef.value
        })
      }, panelPersistDelay)
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
    let dragStartRect: PanelRect | null = null
    let dragContainerRect: PanelRect | null = null

    function toPanelRect(rect: DOMRect): PanelRect {
      return {
        left: rect.left,
        top: rect.top,
        width: rect.width,
        height: rect.height
      }
    }

    function getContainerRect(): PanelRect | null {
      const container = panelContext?.getContainer()
      if (!container)
        return null
      return toPanelRect(container.getBoundingClientRect())
    }

    function handlePointerMove(e: PointerEvent): void {
      if (dragPointerId === null || e.pointerId !== dragPointerId)
        return
      const dx = e.clientX - dragStartX
      const dy = e.clientY - dragStartY
      const startRect = dragStartRect
      const containerRect = dragContainerRect
      const delta = startRect
        ? resolvePanelDragDelta(dx, dy, {
            startRect,
            containerRect: containerRect ?? startRect,
            grid: props.dragGrid,
            // sticking and the boundary need a container to be meaningful
            snap: containerRect ? props.dragSnap : undefined,
            boundary: containerRect ? props.dragBoundary : false
          })
        : ([dx, dy] as [number, number])
      doUpdateOffset([
        Math.round(dragStartOffset[0] + delta[0]),
        Math.round(dragStartOffset[1] + delta[1])
      ])
    }

    function endDrag(): void {
      const pointerId = dragPointerId
      if (pointerId === null)
        return
      dragPointerId = null
      dragStartRect = null
      dragContainerRect = null
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
      const panelEl = panelElRef.value
      dragPointerId = e.pointerId
      dragStartX = e.clientX
      dragStartY = e.clientY
      dragStartOffset = mergedOffsetRef.value
      dragStartRect = panelEl
        ? toPanelRect(panelEl.getBoundingClientRect())
        : null
      dragContainerRect
        = props.dragBoundary || props.dragSnap !== undefined
          ? getContainerRect()
          : null
      draggingRef.value = true
      on('pointermove', window, handlePointerMove)
      on('pointerup', window, handlePointerUp)
      on('pointercancel', window, handlePointerUp)
      if (panelEl) {
        // synthetic pointers and detached elements cannot be captured
        try {
          panelEl.setPointerCapture(e.pointerId)
        }
        catch {}
      }
    }

    // the size of the panel is dragged by the resize trigger of the operating
    // mode
    let resizePointerId: number | null = null
    let resizeStartX = 0
    let resizeStartY = 0
    let resizeStartRect: PanelRect | null = null
    let resizeMinWidth = 0
    let resizeMinHeight = 0

    function handleResizePointerMove(e: PointerEvent): void {
      if (resizePointerId === null || e.pointerId !== resizePointerId)
        return
      const startRect = resizeStartRect
      if (!startRect)
        return
      // the size is a layout value while the pointer works on the visual size
      const scale = props.scaleTransform ? mergedScaleRef.value : 1
      doUpdateWidth(
        resolvePanelResizeSize({
          startSize: startRect.width,
          delta: e.clientX - resizeStartX,
          scale,
          minSize: resizeMinWidth
        })
      )
      doUpdateHeight(
        resolvePanelResizeSize({
          startSize: startRect.height,
          delta: e.clientY - resizeStartY,
          scale,
          minSize: resizeMinHeight
        })
      )
    }

    function endResize(): void {
      const pointerId = resizePointerId
      if (pointerId === null)
        return
      resizePointerId = null
      resizeStartRect = null
      off('pointermove', window, handleResizePointerMove)
      off('pointerup', window, handleResizePointerUp)
      off('pointercancel', window, handleResizePointerUp)
      const panelEl = panelElRef.value
      if (panelEl) {
        try {
          panelEl.releasePointerCapture(pointerId)
        }
        catch {}
      }
    }

    function handleResizePointerUp(e: PointerEvent): void {
      if (resizePointerId === null || e.pointerId !== resizePointerId)
        return
      endResize()
    }

    function handleResizePointerdown(e: PointerEvent): void {
      if (!mergedOperatingRef.value || !props.resizable || e.button !== 0)
        return
      const panelEl = panelElRef.value
      if (!panelEl)
        return
      // the trigger is inside the panel, it must not start a drag
      e.stopPropagation()
      const computedStyle = window.getComputedStyle(panelEl)
      resizePointerId = e.pointerId
      resizeStartX = e.clientX
      resizeStartY = e.clientY
      resizeStartRect = toPanelRect(panelEl.getBoundingClientRect())
      // the size limit of the usage is kept
      resizeMinWidth = Number.parseFloat(computedStyle.minWidth) || 0
      resizeMinHeight = Number.parseFloat(computedStyle.minHeight) || 0
      on('pointermove', window, handleResizePointerMove)
      on('pointerup', window, handleResizePointerUp)
      on('pointercancel', window, handleResizePointerUp)
      try {
        panelEl.setPointerCapture(e.pointerId)
      }
      catch {}
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
          // an operating panel is brought to the front of the page
          bringToFront()
          on('keydown', document, handleKeydown)
          // captured, so it isn't swallowed by inner `stopPropagation`
          on('pointerdown', document, handleDocumentPointerdown, true)
        }
        else {
          off('keydown', document, handleKeydown)
          off('pointerdown', document, handleDocumentPointerdown, true)
          endDrag()
          endResize()
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

    // the layout is written back after the last change of it
    watch(
      [
        mergedOffsetRef,
        mergedScaleRef,
        mergedWidthRef,
        mergedHeightRef,
        collapsedRef
      ],
      schedulePersistState
    )

    const groupHandle: PanelGroupHandle = {
      id: panelId,
      get name() {
        return props.name
      },
      getRect: () => panelElRef.value?.getBoundingClientRect() ?? null,
      getZIndex: () => zIndexRef.value,
      reset: doReset,
      collapse: doCollapse,
      expand: doExpand,
      bringToFront
    }

    onMounted(() => {
      panelContext?.registerPanel(groupHandle)
      // a panel which is already in operating mode is brought to the front too
      if (mergedOperatingRef.value)
        bringToFront()
      restorePersistState()
    })

    onBeforeUnmount(() => {
      panelContext?.unregisterPanel(panelId)
      if (persistTimer !== undefined)
        clearTimeout(persistTimer)
      off('keydown', document, handleKeydown)
      off('pointerdown', document, handleDocumentPointerdown, true)
      endDrag()
      endResize()
    })

    const themeClassHandle = inlineThemeDisabled
      ? useThemeClass('panel', undefined, cssVarsRef, props)
      : undefined

    const toolsSlotPropsRef = computed<PanelToolsSlotProps>(() => ({
      scale: mergedScaleRef.value,
      offset: mergedOffsetRef.value,
      setScale: doUpdateScale,
      setOffset: doUpdateOffset,
      reset: doReset,
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
      handleResizePointerdown,
      handleWheel,
      handleDblclick,
      handleChipClick,
      handleChipKeydown,
      // the methods are also reachable through a template ref
      reset: doReset,
      collapse: doCollapse,
      expand: doExpand,
      bringToFront,
      setOffset: doUpdateOffset,
      setScale: doUpdateScale,
      setSize: doSetSize,
      getRect: groupHandle.getRect
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
        {this.mergedOperating && this.resizable ? (
          <div
            class={`${mergedClsPrefix}-panel-resize-trigger`}
            onPointerdown={this.handleResizePointerdown}
          />
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
