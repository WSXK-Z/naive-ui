<markdown>
# Drag & Scale

Double click a panel to enter operating mode: drag it, scale it by the tools or by the wheel. `Esc`, clicking outside the panel and the `done` tool all leave the operating mode.

Offset and scale are written on the `transform` of the panel itself and exposed as `--n-panel-x`, `--n-panel-y` and `--n-panel-scale`, so they never trigger a page reflow and inner elements can use them for layout.
</markdown>

<script lang="ts" setup>
import type { PanelOffset } from 'naive-ui'
import { ref } from 'vue'

const offset = ref<PanelOffset>([0, 0])
const scale = ref(1)
const clicks = ref(0)

function reset(): void {
  offset.value = [0, 0]
  scale.value = 1
}
</script>

<template>
  <n-flex vertical :size="12">
    <n-flex :size="8" align="center">
      <n-button size="small" @click="reset">
        Reset
      </n-button>
      <n-tag size="small">
        Offset {{ offset[0] }}, {{ offset[1] }}
      </n-tag>
      <n-tag size="small">
        Scale {{ scale }}
      </n-tag>
    </n-flex>
    <div class="panel-demo">
      <n-page>
        <n-panel
          v-model:offset="offset"
          v-model:scale="scale"
          fixed
          anchor="center"
          title="Avatar"
          movable
          scalable
        >
          <n-card size="small" style="width: 200px">
            <n-flex vertical align="center" :size="8">
              <span>Double click the panel to operate it</span>
              <n-button size="tiny" @click="clicks += 1">
                Clicks {{ clicks }}
              </n-button>
            </n-flex>
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
