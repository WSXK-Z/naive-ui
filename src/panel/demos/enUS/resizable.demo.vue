<markdown>
# Resize

A `resizable` panel shows a size trigger at its bottom right corner in operating mode, drag it to change the width and the height (`v-model:width`, `v-model:height`).

`reset()` (the reset tool) clears the offset, the scale and the size, the panel goes back to the size of its content. The `min-width` and `min-height` of the panel are kept as the limit of the drag.
</markdown>

<script lang="ts" setup>
import { ref } from 'vue'

const width = ref<number | undefined>(undefined)
const height = ref<number | undefined>(undefined)
</script>

<template>
  <n-flex vertical :size="12">
    <n-flex :size="8">
      <n-tag size="small">
        Width {{ width ?? 'content' }}
      </n-tag>
      <n-tag size="small">
        Height {{ height ?? 'content' }}
      </n-tag>
    </n-flex>
    <div class="panel-demo">
      <n-page>
        <n-panel
          v-model:width="width"
          v-model:height="height"
          fixed
          anchor="center"
          title="Resizable panel"
          movable
          resizable
        >
          <n-card size="small">
            Double click to operate, then drag the bottom right corner
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
