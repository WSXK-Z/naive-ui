<markdown>
# 悬浮面板

`occupies-space` 为 `false` 时面板脱离文档流，停在原来的静态位置，不推挤兄弟面板。位置与尺寸由使用方给出。

面板的根节点是 Teleport 片段，父组件里带作用域的选择器选不中它，所以这里直接把位置写在面板的 `style` 上（实际项目里可以写在非作用域样式或全局类上）。
</markdown>

<script lang="ts" setup>
import { ref } from 'vue'

const open = ref(true)
</script>

<template>
  <n-flex vertical :size="12">
    <n-flex :size="8" align="center">
      <n-switch v-model:value="open" size="small" />
      <span>显示对话窗</span>
    </n-flex>
    <div class="panel-demo">
      <n-page>
        <div class="panel-demo__content">
          悬浮面板不会推挤页面内容。
        </div>
        <n-panel
          v-if="open"
          :occupies-space="false"
          :style="{ right: '12px', bottom: '12px', width: '200px' }"
        >
          <n-card size="small" title="对话窗">
            右下角的浮动窗口
          </n-card>
        </n-panel>
      </n-page>
    </div>
  </n-flex>
</template>

<style>
.panel-demo {
  height: 280px;
  border-radius: 3px;
  background-color: rgba(128, 128, 128, 0.15);
}

.panel-demo__content {
  padding: 12px;
  color: rgba(128, 128, 128, 1);
}
</style>
