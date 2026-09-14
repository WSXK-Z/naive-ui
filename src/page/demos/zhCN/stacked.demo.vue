<markdown>
# 同一停靠位堆叠

同一个停靠位上的多个面板按挂载顺序竖向堆叠，间距由页面统一提供，面板自己不需要写外边距。
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
        <n-panel fixed anchor="top-right" title="面板一">
          <n-card size="small" style="width: 180px">
            第一个面板
          </n-card>
        </n-panel>
        <n-panel
          v-if="visible"
          fixed
          anchor="top-right"
          title="面板二"
          collapsible
        >
          <n-card size="small" style="width: 180px">
            第二个面板
          </n-card>
        </n-panel>
        <n-panel fixed anchor="bottom-center">
          <n-tag size="small" type="info">
            底部居中
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
