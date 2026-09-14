<markdown>
# Drag Constraints

`drag-grid` snaps the offset to a grid, `drag-snap` sticks the edges and the center of the panel to the ones of the container, `drag-boundary` keeps the panel inside the container (the page).

Double click the panel and try to drag it.
</markdown>

<script lang="ts" setup>
import type { PanelOffset } from 'naive-ui'
import { ref } from 'vue'

const offset = ref<PanelOffset>([0, 0])
</script>

<template>
  <n-flex vertical :size="12">
    <n-tag size="small">
      Offset {{ offset[0] }}, {{ offset[1] }}
    </n-tag>
    <div class="panel-demo">
      <n-page>
        <n-panel
          v-model:offset="offset"
          fixed
          anchor="center"
          title="Stick & boundary"
          movable
          :drag-grid="10"
          :drag-snap="12"
          drag-boundary
        >
          <n-card size="small" style="width: 180px">
            Grid 10px, stick 12px, inside the page
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
