import { mount } from '@vue/test-utils'
import { h } from 'vue'
import { NPanel } from '../../panel'
import { NPage, panelAnchors } from '../index'

describe('n-page', () => {
  it('should work with import on demand', () => {
    mount(NPage)
  })

  it('should render all anchors', () => {
    const wrapper = mount(NPage)
    expect(wrapper.find('.n-page').exists()).toBe(true)
    expect(wrapper.findAll('.n-page-anchor')).toHaveLength(panelAnchors.length)
    panelAnchors.forEach((anchor) => {
      expect(wrapper.find(`.n-page-anchor--${anchor}`).exists()).toBe(true)
    })
    wrapper.unmount()
  })

  it('should render page content', () => {
    const wrapper = mount(NPage, {
      slots: {
        default: () => <div class="content">content</div>
      }
    })
    expect(wrapper.find('.content').text()).toBe('content')
    wrapper.unmount()
  })

  it('should teleport panel to its anchor', () => {
    const wrapper = mount(NPage, {
      slots: {
        default: () => [
          <NPanel fixed anchor="top-left" title="left" />,
          <NPanel fixed anchor="bottom-right" title="right" />
        ]
      }
    })
    expect(wrapper.find('.n-page-anchor--top-left .n-panel').exists()).toBe(
      true
    )
    expect(wrapper.find('.n-page-anchor--bottom-right .n-panel').exists()).toBe(
      true
    )
    wrapper.unmount()
  })

  it('should stack panels of the same anchor', () => {
    const wrapper = mount(NPage, {
      slots: {
        default: () => [
          <NPanel fixed anchor="center" title="one" />,
          <NPanel fixed anchor="center" title="two" />
        ]
      }
    })
    const panels = wrapper.findAll('.n-page-anchor--center .n-panel')
    expect(panels).toHaveLength(2)
    wrapper.unmount()
  })

  it('should render panel in place when the anchor is not rendered', () => {
    const wrapper = mount(NPanel, {
      props: { fixed: true, anchor: 'top-right' }
    })
    expect(wrapper.find('.n-page').exists()).toBe(false)
    expect(wrapper.find('.n-panel').exists()).toBe(true)
    wrapper.unmount()
  })

  it('should work with `anchors` prop', () => {
    const wrapper = mount(NPage, {
      props: { anchors: ['top-left', 'my-anchor'] },
      slots: {
        default: () => <NPanel fixed anchor="my-anchor" title="custom" />
      }
    })
    expect(wrapper.findAll('.n-page-anchor')).toHaveLength(2)
    expect(wrapper.find('.n-page-anchor--my-anchor').exists()).toBe(true)
    expect(wrapper.find('.n-page-anchor--top-right').exists()).toBe(false)
    expect(wrapper.find('.n-page-anchor--my-anchor .n-panel').exists()).toBe(
      true
    )
    wrapper.unmount()
  })

  it('should render panel in place when its anchor is not configured', () => {
    const wrapper = mount(NPage, {
      props: { anchors: ['top-left'] },
      slots: {
        default: () => <NPanel fixed anchor="top-right" title="missing" />
      }
    })
    expect(wrapper.find('.n-page-anchor--top-right').exists()).toBe(false)
    expect(wrapper.find('.n-page > .n-panel').exists()).toBe(true)
    wrapper.unmount()
  })

  it('should work with `anchor-direction`, `anchor-wrap` and `anchor-gap`', () => {
    const wrapper = mount(NPage, {
      props: {
        anchorDirection: 'horizontal',
        anchorWrap: true,
        anchorGap: 20
      }
    })
    const anchors = wrapper.find('.n-page-anchors')
    expect(anchors.classes('n-page-anchors--horizontal')).toBe(true)
    expect(anchors.classes('n-page-anchors--wrap')).toBe(true)
    expect(anchors.attributes('style')).toContain('--n-page-anchor-gap: 20px')

    const stringGap = mount(NPage, { props: { anchorGap: '1rem' } })
    expect(stringGap.find('.n-page-anchors').attributes('style')).toContain(
      '--n-page-anchor-gap: 1rem'
    )
    expect(wrapper.find('.n-page-anchors--horizontal').exists()).toBe(true)
    wrapper.unmount()
    stringGap.unmount()
  })
})
