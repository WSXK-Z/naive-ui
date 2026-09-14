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
})
