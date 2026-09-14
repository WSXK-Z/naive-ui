<markdown>
# 停靠位配置

`anchors` 决定页面注册哪些停靠位（默认七个内置停靠位）。自定义名字会被渲染成 `.n-page-anchor--<名字>`，位置由使用方给出。

`anchor-direction`、`anchor-wrap` 与 `anchor-gap` 控制同一个停靠位上多个面板的排列方向、是否自动换行与间距。
</markdown>

<script lang="ts" setup>
import type { PanelAnchor } from 'naive-ui'
import { ref } from 'vue'

const horizontal = ref(true)
const anchors: PanelAnchor[] = ['top-left', 'my-anchor']
</script>

<template>
  <n-flex vertical :size="12">
    <n-flex :size="8" align="center">
      <n-switch v-model:value="horizontal" size="small" />
      <span>横向排列并自动换行</span>
    </n-flex>
    <div class="page-demo">
      <n-page
        :anchors="anchors"
        :anchor-direction="horizontal ? 'horizontal' : 'vertical'"
        :anchor-wrap="horizontal"
        :anchor-gap="16"
      >
        <n-panel fixed anchor="top-left" title="面板一">
          <n-card size="small" style="width: 150px">
            内置停靠位
          </n-card>
        </n-panel>
        <n-panel fixed anchor="top-left" title="面板二">
          <n-card size="small" style="width: 150px">
            间距 16px
          </n-card>
        </n-panel>
        <n-panel fixed anchor="my-anchor" title="自定义停靠位">
          <n-card size="small" style="width: 150px">
            位置由页面给出
          </n-card>
        </n-panel>
      </n-page>
    </div>
  </n-flex>
</template>

<style>
.page-demo {
  height: 280px;
  border-radius: 3px;
  background-color: rgba(128, 128, 128, 0.15);
}

/* 自定义停靠位的位置由使用方决定 */
:deep(.n-page-anchor--my-anchor) {
  right: 12px;
  bottom: 12px;
}
</style>
