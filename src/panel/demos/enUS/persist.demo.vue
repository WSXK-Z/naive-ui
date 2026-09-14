<markdown>
# Persist

`persist` gives a panel a persist key, `persist-namespace` of the page is its namespace and `persist-storage` decides where it is stored (`localStorage` by default). The offset, the scale, the size and the collapsed state are kept and restored after a reload.

The buttons below operate the panel through the template ref (`PageInst`) of the page.
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
        Bring to front
      </n-button>
      <n-button size="small" @click="collapse">
        Collapse
      </n-button>
      <n-button size="small" @click="reset">
        Reset
      </n-button>
    </n-flex>
    <div class="panel-demo">
      <n-page ref="pageRef" persist-namespace="panel-demo">
        <n-panel
          name="logging"
          persist="logging"
          fixed
          anchor="top-right"
          title="Logging"
          movable
          scalable
          collapsible
        >
          <n-card size="small" style="width: 200px">
            Drag, scale and collapse it, then reload the page
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
