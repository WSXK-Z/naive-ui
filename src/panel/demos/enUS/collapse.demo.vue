<markdown>
# Collapse & Expand

A `collapsible` panel can be collapsed into a small tag: double click the panel to enter operating mode, then click the collapse tool. The panel itself is only hidden (not destroyed), so its inner state and scroll position are kept. The tag can be moved to the anchor given by `collapse-target`.
</markdown>

<script lang="ts" setup>
import { ref } from 'vue'

const events = ref<string[]>([])
</script>

<template>
  <n-flex vertical :size="12">
    <n-flex :size="8" align="center">
      <n-tag v-for="(item, index) in events" :key="index" size="small">
        {{ item }}
      </n-tag>
      <span v-if="!events.length">Collapse / expand events show up here</span>
    </n-flex>
    <div class="panel-demo">
      <n-page>
        <n-panel
          fixed
          anchor="top-right"
          title="Debug panel"
          collapsible
          collapse-target="bottom-right"
          @collapse="events.push('collapse')"
          @expand="events.push('expand')"
        >
          <n-card size="small" style="width: 200px">
            A tag is left at the bottom right after collapsing
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
