<markdown>
# 自定义工具条

`tools` 插槽会替换内置工具条的内容，插槽参数提供 `scale`、`offset`、`setScale`、`setOffset`、`reset`、`collapse` 与 `exit`。
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
        title="自定义工具条"
        movable
        scalable
      >
        <template #tools="{ scale: current, reset, exit }">
          <span class="custom-tools__value">
            {{ Math.round(current * 100) }}%
          </span>
          <n-button text size="tiny" @click="reset">
            复位
          </n-button>
          <n-button text size="tiny" @click="exit">
            完成
          </n-button>
        </template>
        <n-card size="small" style="width: 200px">
          双击进入操作模式，工具条由插槽给出
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
