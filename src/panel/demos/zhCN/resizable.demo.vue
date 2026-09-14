<markdown>
# 拖拽调整尺寸

`resizable` 的面板在操作模式里会显示右下角的尺寸手柄，拖动即可改变宽高（`v-model:width`、`v-model:height`）。

`reset()`（工具条的复位按钮）会把位移、缩放与尺寸一起复位，尺寸回到内容撑开的大小。面板自身的 `min-width`、`min-height` 会作为拖拽的下限。
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
        宽 {{ width ?? '内容撑开' }}
      </n-tag>
      <n-tag size="small">
        高 {{ height ?? '内容撑开' }}
      </n-tag>
    </n-flex>
    <div class="panel-demo">
      <n-page>
        <n-panel
          v-model:width="width"
          v-model:height="height"
          fixed
          anchor="center"
          title="可调整尺寸"
          movable
          resizable
        >
          <n-card size="small">
            双击进入操作模式后拖右下角
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
