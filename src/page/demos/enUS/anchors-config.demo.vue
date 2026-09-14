<markdown>
# Anchors

`anchors` decides which anchors a page registers (the 7 built-in ones by default). A custom name is rendered as `.n-page-anchor--<name>` and its place is up to the usage.

`anchor-direction`, `anchor-wrap` and `anchor-gap` control the direction, the wrapping and the gap of the panels docked to the same anchor.
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
      <span>Horizontal with wrapping</span>
    </n-flex>
    <div class="page-demo">
      <n-page
        :anchors="anchors"
        :anchor-direction="horizontal ? 'horizontal' : 'vertical'"
        :anchor-wrap="horizontal"
        :anchor-gap="16"
      >
        <n-panel fixed anchor="top-left" title="First panel">
          <n-card size="small" style="width: 150px">
            A built-in anchor
          </n-card>
        </n-panel>
        <n-panel fixed anchor="top-left" title="Second panel">
          <n-card size="small" style="width: 150px">
            Gap 16px
          </n-card>
        </n-panel>
        <n-panel fixed anchor="my-anchor" title="Custom anchor">
          <n-card size="small" style="width: 150px">
            Placed by the page
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

/* the place of a custom anchor is up to the usage */
:deep(.n-page-anchor--my-anchor) {
  right: 12px;
  bottom: 12px;
}
</style>
