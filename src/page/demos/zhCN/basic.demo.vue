<markdown>
# 基础用法

页面是路由级容器：它给面板提供定位参照系，以及四角、上/下中、正中共七个停靠位。`fixed` 的面板会停靠到 `anchor` 指定的位置，其余内容照常参与文档流。
</markdown>

<script lang="ts" setup>
import type { PanelAnchor } from 'naive-ui'
import { ref } from 'vue'

const anchor = ref<PanelAnchor>('top-right')
const anchors: PanelAnchor[] = [
  'top-left',
  'top-center',
  'top-right',
  'center',
  'bottom-left',
  'bottom-center',
  'bottom-right'
]
</script>

<template>
  <n-flex vertical :size="12">
    <n-radio-group v-model:value="anchor" size="small">
      <n-radio-button
        v-for="item in anchors"
        :key="item"
        :value="item"
        :label="item"
      />
    </n-radio-group>
    <div class="page-demo">
      <n-page>
        <div class="page-demo__content">
          页面内容按正常文档流排布，不会被停靠面板推挤。
        </div>
        <n-panel fixed :anchor="anchor" title="停靠面板">
          <n-card size="small" style="width: 200px">
            当前停靠位：{{ anchor }}
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

.page-demo__content {
  padding: 12px;
  color: rgba(128, 128, 128, 1);
}
</style>
