<markdown>
# Basic

A page is the container of a route. It gives panels a coordinate system and 7 anchors: 4 corners, top/bottom center and center. A panel with `fixed` is docked to the anchor given by `anchor`, other content is laid out in the normal flow.
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
          Page content is laid out in the normal flow, it isn't pushed by docked
          panels.
        </div>
        <n-panel fixed :anchor="anchor" title="Docked panel">
          <n-card size="small" style="width: 200px">
            Current anchor: {{ anchor }}
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
