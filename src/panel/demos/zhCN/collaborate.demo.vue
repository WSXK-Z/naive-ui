<markdown>
# 面板协作

同一个页面里的面板会注册到页面的面板组，页面内的任何组件都能用 `usePanelGroup()` 拿到它：

- `getPanels()` / `getPanel(name)` 找到面板，句柄提供 `reset`、`collapse`、`expand`、`bringToFront`、`getRect`；
- `bringToFront(name)` 把面板提到页面内最上层；
- 进入操作模式的面板会自动置顶。

下面的按钮就是用 `usePanelGroup()` 操作另一个面板的。
</markdown>

<script lang="ts" setup>
import { NButton, NFlex, usePanelGroup } from 'naive-ui'
import { defineComponent, h } from 'vue'

const PanelActions = defineComponent({
  name: 'PanelActions',
  setup() {
    const group = usePanelGroup()
    return () =>
      h(
        NFlex,
        { size: 8 },
        {
          default: () => [
            h(
              NButton,
              {
                size: 'tiny',
                onClick: () => group?.bringToFront('notes')
              },
              { default: () => '置顶便签' }
            ),
            h(
              NButton,
              {
                size: 'tiny',
                onClick: () => group?.getPanel('notes')?.collapse()
              },
              { default: () => '收起便签' }
            ),
            h(
              NButton,
              {
                size: 'tiny',
                onClick: () =>
                  group?.getPanels().forEach(panel => panel.reset())
              },
              { default: () => '全部复位' }
            )
          ]
        }
      )
  }
})
</script>

<template>
  <div class="panel-demo">
    <n-page>
      <div style="padding: 12px">
        <n-card size="small" title="操作面板组">
          <PanelActions />
        </n-card>
      </div>
      <n-panel
        name="notes"
        fixed
        anchor="top-right"
        title="便签"
        movable
        scalable
        collapsible
      >
        <n-card size="small" style="width: 200px">
          双击进入操作模式
        </n-card>
      </n-panel>
    </n-page>
  </div>
</template>

<style>
.panel-demo {
  height: 280px;
  border-radius: 3px;
  background-color: rgba(128, 128, 128, 0.15);
}
</style>
