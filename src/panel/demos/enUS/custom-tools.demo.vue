<markdown>
# Custom Tools

The `tools` slot replaces the content of the built-in tools. Slot props provide `scale`, `offset`, `setScale`, `setOffset`, `reset`, `collapse` and `exit`.
</markdown>

<script lang="ts" setup>
import type { PanelOffset } from 'naive-ui'
import { ref } from 'vue'

const offset = ref<PanelOffset>([0, 0])
const scale = ref(1)
</script>

<template>
  <div class="panel-demo">
    <n-page>
      <n-panel
        v-model:offset="offset"
        v-model:scale="scale"
        fixed
        anchor="center"
        title="Custom tools"
        movable
        scalable
      >
        <template #tools="{ scale: current, reset, exit }">
          <span class="custom-tools__value">
            {{ Math.round(current * 100) }}%
          </span>
          <n-button text size="tiny" @click="reset">
            Reset
          </n-button>
          <n-button text size="tiny" @click="exit">
            Done
          </n-button>
        </template>
        <n-card size="small" style="width: 200px">
          Double click to operate, the tools are given by the slot
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

.custom-tools__value {
  font-variant-numeric: tabular-nums;
}
</style>
