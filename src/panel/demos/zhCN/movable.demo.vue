<markdown>
# 拖拽与缩放

双击面板进入操作模式：拖动面板、用工具条或滚轮缩放面板，`Esc`、点击面板外、工具条的「完成」都能退出操作模式。

位移与缩放都写在面板自身的 `transform` 上，同时暴露为 `--n-panel-x`、`--n-panel-y`、`--n-panel-scale`，所以既不会引起页面重排，内部元素也能拿去做联动。
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
        复位
      </n-button>
      <n-tag size="small">
        位移 {{ offset[0] }}, {{ offset[1] }}
      </n-tag>
      <n-tag size="small">
        缩放 {{ scale }}
      </n-tag>
    </n-flex>
    <div class="panel-demo">
      <n-page>
        <n-panel
          v-model:offset="offset"
          v-model:scale="scale"
          fixed
          anchor="center"
          title="形象"
          movable
          scalable
        >
          <n-card size="small" style="width: 200px">
            <n-flex vertical align="center" :size="8">
              <span>双击面板进入操作模式</span>
              <n-button size="tiny" @click="clicks += 1">
                点击次数 {{ clicks }}
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
