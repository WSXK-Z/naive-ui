<markdown>
# 拖动约束

`drag-grid` 让位移吸附到网格，`drag-snap` 让面板的边缘与中线吸附到容器的边缘与中线，`drag-boundary` 把面板限制在容器（页面）内。

双击面板进入操作模式后拖一下试试。
</markdown>

<script lang="ts" setup>
import type { PanelOffset } from 'naive-ui'
import { ref } from 'vue'

const offset = ref<PanelOffset>([0, 0])
</script>

<template>
  <n-flex vertical :size="12">
    <n-tag size="small">
      位移 {{ offset[0] }}, {{ offset[1] }}
    </n-tag>
    <div class="panel-demo">
      <n-page>
        <n-panel
          v-model:offset="offset"
          fixed
          anchor="center"
          title="吸附与边界"
          movable
          :drag-grid="10"
          :drag-snap="12"
          drag-boundary
        >
          <n-card size="small" style="width: 180px">
            网格 10px，吸附 12px，限制在页面内
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
</style>
