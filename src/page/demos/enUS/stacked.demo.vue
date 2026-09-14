<markdown>
# Stacking

Panels docked to the same anchor are stacked vertically in mount order. The gap is provided by the page, panels don't need to set margins by themselves.
</markdown>

<script lang="ts" setup>
import { ref } from 'vue'

const visible = ref(true)
</script>

<template>
  <n-flex vertical :size="12">
    <n-switch v-model:value="visible" size="small" />
    <div class="page-demo">
      <n-page>
        <n-panel fixed anchor="top-right" title="First panel">
          <n-card size="small" style="width: 180px">
            The first panel
          </n-card>
        </n-panel>
        <n-panel
          v-if="visible"
          fixed
          anchor="top-right"
          title="Second panel"
          collapsible
        >
          <n-card size="small" style="width: 180px">
            The second panel
          </n-card>
        </n-panel>
        <n-panel fixed anchor="bottom-center">
          <n-tag size="small" type="info">
            Bottom center
          </n-tag>
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
</style>
