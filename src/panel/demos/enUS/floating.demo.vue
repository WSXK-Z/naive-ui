<markdown>
# Floating Panel

When `occupies-space` is `false`, the panel leaves the document flow and stays at its static position without pushing its siblings. Position and size are up to the usage.

The root of a panel is a Teleport fragment which a scoped selector of the parent can't reach, so the position is written in the `style` of the panel here (a non-scoped style or a global class works as well).
</markdown>

<script lang="ts" setup>
import { ref } from 'vue'

const open = ref(true)
</script>

<template>
  <n-flex vertical :size="12">
    <n-flex :size="8" align="center">
      <n-switch v-model:value="open" size="small" />
      <span>Show the chat window</span>
    </n-flex>
    <div class="panel-demo">
      <n-page>
        <div class="panel-demo__content">
          A floating panel doesn't push the page content.
        </div>
        <n-panel
          v-if="open"
          :occupies-space="false"
          :style="{ right: '12px', bottom: '12px', width: '200px' }"
        >
          <n-card size="small" title="Chat">
            A floating window at bottom right
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
