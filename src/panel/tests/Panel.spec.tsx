import type { PanelToolsSlotProps } from '../src/interface'
import { mount } from '@vue/test-utils'
import { h, nextTick } from 'vue'
import { NPage } from '../../page'
import { NPanel } from '../index'

function createEvent(type: string, props: Record<string, unknown>): Event {
  return Object.assign(new Event(type, { cancelable: true }), props)
}

function getPanelVm(wrapper: { vm: unknown }): {
  handlePointerdown: (e: PointerEvent) => void
  toolsSlotProps: PanelToolsSlotProps
} {
  return wrapper.vm as unknown as {
    handlePointerdown: (e: PointerEvent) => void
    toolsSlotProps: PanelToolsSlotProps
  }
}

describe('n-panel', () => {
  it('should work with import on demand', () => {
    mount(NPanel)
  })

  it('should render in place without a page', () => {
    const wrapper = mount(NPanel, {
      slots: { default: () => 'content' }
    })
    expect(wrapper.find('.n-panel').text()).toBe('content')
    wrapper.unmount()
  })

  it('should work with `occupies-space` prop', async () => {
    const wrapper = mount(NPanel)
    expect(wrapper.find('.n-panel--floating').exists()).toBe(false)
    await wrapper.setProps({ occupiesSpace: false })
    expect(wrapper.find('.n-panel--floating').exists()).toBe(true)
    await wrapper.setProps({ fixed: true })
    expect(wrapper.find('.n-panel--floating').exists()).toBe(false)
    wrapper.unmount()
  })

  it('should work with `offset` and `scale` props', () => {
    const wrapper = mount(NPanel, {
      props: { offset: [10, 20] as const, scale: 1.5 }
    })
    const panel = wrapper.find('.n-panel')
    expect(panel.attributes('style')).toContain('--n-panel-x: 10px')
    expect(panel.attributes('style')).toContain('--n-panel-y: 20px')
    expect(panel.attributes('style')).toContain('--n-panel-scale: 1.5')
    expect(panel.classes('n-panel--transformed')).toBe(true)
    wrapper.unmount()
  })

  it('should work with `scale-transform` prop', () => {
    const wrapper = mount(NPanel)
    expect(wrapper.find('.n-panel--scale-as-size').exists()).toBe(false)
    const changed = mount(NPanel, { props: { scaleTransform: false } })
    expect(changed.find('.n-panel--scale-as-size').exists()).toBe(true)
    wrapper.unmount()
    changed.unmount()
  })

  it('should enter operating mode by double clicking', async () => {
    const onUpdateOperating = vi.fn()
    const wrapper = mount(NPanel, {
      props: { movable: true, onUpdateOperating },
      slots: { default: () => 'content' }
    })
    await wrapper.find('.n-panel').trigger('dblclick')
    expect(wrapper.find('.n-panel--operating').exists()).toBe(true)
    expect(wrapper.find('.n-panel--outlined').exists()).toBe(true)
    expect(wrapper.find('.n-panel-tools').exists()).toBe(true)
    expect(onUpdateOperating).toHaveBeenCalledWith(true)

    await wrapper.find('.n-panel').trigger('dblclick')
    expect(wrapper.find('.n-panel--operating').exists()).toBe(false)
    expect(onUpdateOperating).toHaveBeenCalledWith(false)
    wrapper.unmount()
  })

  it('should not enter operating mode when the panel is not movable or scalable', async () => {
    const wrapper = mount(NPanel)
    await wrapper.find('.n-panel').trigger('dblclick')
    expect(wrapper.find('.n-panel--operating').exists()).toBe(false)
    wrapper.unmount()
  })

  it('should enter operating mode for a collapsible panel', async () => {
    const wrapper = mount(NPanel, {
      props: { collapsible: true }
    })
    await wrapper.find('.n-panel').trigger('dblclick')
    expect(wrapper.find('.n-panel--operating').exists()).toBe(true)
    expect(wrapper.find('.n-panel-tools').exists()).toBe(true)
    wrapper.unmount()
  })

  it('should work with `operate-trigger` prop', async () => {
    const wrapper = mount(NPanel, {
      props: { movable: true, operateTrigger: '.trigger' },
      slots: {
        default: () => <div class="trigger">trigger</div>
      }
    })
    await wrapper.find('.n-panel').trigger('dblclick')
    expect(wrapper.find('.n-panel--operating').exists()).toBe(false)
    await wrapper.find('.trigger').trigger('dblclick')
    expect(wrapper.find('.n-panel--operating').exists()).toBe(true)
    wrapper.unmount()
  })

  it('should work with `operate-outline` and `operate-tools` props', async () => {
    const wrapper = mount(NPanel, {
      props: {
        movable: true,
        operating: true,
        operateOutline: false,
        operateTools: false
      }
    })
    expect(wrapper.find('.n-panel--operating').exists()).toBe(true)
    expect(wrapper.find('.n-panel--outlined').exists()).toBe(false)
    expect(wrapper.find('.n-panel-tools').exists()).toBe(false)
    wrapper.unmount()
  })

  it('should exit operating mode by escape', () => {
    const onUpdateOperating = vi.fn()
    const wrapper = mount(NPanel, {
      props: { movable: true, operating: true, onUpdateOperating },
      attachTo: document.body
    })
    document.body.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })
    )
    expect(onUpdateOperating).toHaveBeenCalledWith(false)
    wrapper.unmount()
  })

  it('should drag by the pointer which started dragging', async () => {
    const onUpdateOffset = vi.fn()
    const wrapper = mount(NPanel, {
      props: { movable: true, operating: true, onUpdateOffset },
      attachTo: document.body
    })
    getPanelVm(wrapper).handlePointerdown(
      createEvent('pointerdown', {
        pointerId: 1,
        button: 0,
        clientX: 100,
        clientY: 100
      }) as PointerEvent
    )
    await nextTick()
    expect(wrapper.find('.n-panel--dragging').exists()).toBe(true)

    // another pointer can't move the panel
    window.dispatchEvent(
      createEvent('pointermove', { pointerId: 2, clientX: 200, clientY: 200 })
    )
    expect(onUpdateOffset).not.toHaveBeenCalled()

    window.dispatchEvent(
      createEvent('pointermove', { pointerId: 1, clientX: 130, clientY: 120 })
    )
    await nextTick()
    expect(onUpdateOffset).toHaveBeenCalledWith([30, 20])
    expect(wrapper.find('.n-panel').attributes('style')).toContain(
      '--n-panel-x: 30px'
    )

    window.dispatchEvent(createEvent('pointerup', { pointerId: 1 }))
    await nextTick()
    expect(wrapper.find('.n-panel--dragging').exists()).toBe(false)
    wrapper.unmount()
  })

  it('should not drag without operating mode', () => {
    const onUpdateOffset = vi.fn()
    const wrapper = mount(NPanel, {
      props: { movable: true, onUpdateOffset }
    })
    getPanelVm(wrapper).handlePointerdown(
      createEvent('pointerdown', {
        pointerId: 1,
        button: 0,
        clientX: 100,
        clientY: 100
      }) as PointerEvent
    )
    window.dispatchEvent(
      createEvent('pointermove', { pointerId: 1, clientX: 130, clientY: 120 })
    )
    expect(onUpdateOffset).not.toHaveBeenCalled()
    wrapper.unmount()
  })

  it('should scale by wheel', async () => {
    const onUpdateScale = vi.fn()
    const wrapper = mount(NPanel, {
      props: { scalable: true, operating: true, onUpdateScale }
    })
    wrapper
      .find('.n-panel')
      .element
      .dispatchEvent(createEvent('wheel', { deltaY: -100 }))
    await nextTick()
    expect(onUpdateScale).toHaveBeenCalledWith(1.05)
    expect(wrapper.find('.n-panel').attributes('style')).toContain(
      '--n-panel-scale: 1.05'
    )

    wrapper
      .find('.n-panel')
      .element
      .dispatchEvent(createEvent('wheel', { deltaY: 100 }))
    await nextTick()
    expect(onUpdateScale).toHaveBeenLastCalledWith(1)
    wrapper.unmount()
  })

  it('should not scale by wheel when `wheel-scale` is false', async () => {
    const onUpdateScale = vi.fn()
    const wrapper = mount(NPanel, {
      props: {
        scalable: true,
        operating: true,
        wheelScale: false,
        onUpdateScale
      }
    })
    wrapper
      .find('.n-panel')
      .element
      .dispatchEvent(createEvent('wheel', { deltaY: -100 }))
    await nextTick()
    expect(onUpdateScale).not.toHaveBeenCalled()
    wrapper.unmount()
  })

  it('should round and limit the scale', async () => {
    const onUpdateScale = vi.fn()
    const wrapper = mount(NPanel, {
      props: { scalable: true, operating: true, onUpdateScale }
    })
    const { toolsSlotProps } = getPanelVm(wrapper)
    toolsSlotProps.setScale(1.234)
    expect(onUpdateScale).toHaveBeenLastCalledWith(1.23)
    toolsSlotProps.setScale(10)
    expect(onUpdateScale).toHaveBeenLastCalledWith(3)
    toolsSlotProps.setScale(0)
    expect(onUpdateScale).toHaveBeenLastCalledWith(0.3)
    await nextTick()
    wrapper.unmount()
  })

  it('should reset offset and scale', async () => {
    const onUpdateOffset = vi.fn()
    const onUpdateScale = vi.fn()
    const wrapper = mount(NPanel, {
      props: {
        scalable: true,
        operating: true,
        offset: [10, 10] as const,
        scale: 1.5,
        onUpdateOffset,
        onUpdateScale
      }
    })
    getPanelVm(wrapper).toolsSlotProps.reset()
    expect(onUpdateOffset).toHaveBeenCalledWith([0, 0])
    expect(onUpdateScale).toHaveBeenCalledWith(1)
    wrapper.unmount()
  })

  it('should collapse and expand', async () => {
    const onCollapse = vi.fn()
    const onExpand = vi.fn()
    const wrapper = mount(NPanel, {
      props: { title: '调试', collapsible: true, onCollapse, onExpand },
      slots: { default: () => 'content' }
    })
    expect(wrapper.find('.n-panel-chip').exists()).toBe(false)
    getPanelVm(wrapper).toolsSlotProps.collapse()
    await nextTick()
    expect(onCollapse).toHaveBeenCalledTimes(1)
    expect(
      (wrapper.find('.n-panel').element as HTMLElement).style.display
    ).toBe('none')
    expect(wrapper.find('.n-panel-chip').text()).toBe('调试')

    await wrapper.find('.n-panel-chip').trigger('click')
    expect(onExpand).toHaveBeenCalledTimes(1)
    expect(
      (wrapper.find('.n-panel').element as HTMLElement).style.display
    ).toBe('')
    wrapper.unmount()
  })

  it('should collapse into the chip of `collapse-target`', async () => {
    const wrapper = mount(NPage, {
      slots: {
        default: () => (
          <NPanel
            fixed
            anchor="top-right"
            collapseTarget="bottom-left"
            title="调试"
            collapsible
          />
        )
      }
    })
    const panelWrapper = wrapper.findComponent(NPanel)
    getPanelVm(panelWrapper).toolsSlotProps.collapse()
    await nextTick()
    expect(
      wrapper.find('.n-page-anchor--bottom-left .n-panel-chip').exists()
    ).toBe(true)
    expect(
      wrapper.find('.n-page-anchor--top-right .n-panel-chip').exists()
    ).toBe(false)
    wrapper.unmount()
  })

  it('should work with `tools` slot', async () => {
    const wrapper = mount(NPanel, {
      props: { movable: true, operating: true, title: '调试' },
      slots: {
        tools: (props: PanelToolsSlotProps) => (
          <div class="custom-tools">{`${Math.round(props.scale * 100)}%`}</div>
        )
      }
    })
    expect(wrapper.find('.custom-tools').text()).toBe('100%')
    expect(wrapper.find('.n-panel-tools .n-panel-tools__title').exists()).toBe(
      false
    )
    wrapper.unmount()
  })
})
