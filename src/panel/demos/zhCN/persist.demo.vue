<markdown>
# 持久化

`persist` 给面板一个持久化键，页面的 `persist-namespace` 提供命名空间，`persist-storage` 决定存储介质（默认 `localStorage`）。位移、缩放、尺寸与收起状态都会保存，刷新页面后恢复。

下面的按钮通过页面的模板 ref（`PageInst`）操作面板。
</markdown>

<script lang="ts" setup>
import type { PageInst } from 'naive-ui'
import { ref } from 'vue'

const pageRef = ref<PageInst | null>(null)

function bringToFront(): void {
  pageRef.value?.bringToFront('logging')
}

function collapse(): void {
  pageRef.value?.getPanel('logging')?.collapse()
}

function reset(): void {
  pageRef.value?.getPanel('logging')?.reset()
}
</script>

<template>
  <n-flex vertical :size="12">
    <n-flex :size="8">
      <n-button size="small" @click="bringToFront">
        置顶
      </n-button>
      <n-button size="small" @click="collapse">
        收起
      </n-button>
      <n-button size="small" @click="reset">
        复位
      </n-button>
    </n-flex>
    <div class="panel-demo">
      <n-page ref="pageRef" persist-namespace="panel-demo">
        <n-panel
          name="logging"
          persist="logging"
          fixed
          anchor="top-right"
          title="日志"
          movable
          scalable
          collapsible
        >
          <n-card size="small" style="width: 200px">
            拖动、缩放、收起后刷新页面看看
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
