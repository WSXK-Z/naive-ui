<markdown>
# 收起与展开

`collapsible` 的面板可以收成一枚小标签：双击面板进入操作模式，再点工具条里的收起按钮即可。收起时面板本体只是被隐藏（不销毁），内部状态与滚动位置都保留，小标签可以放到 `collapse-target` 指定的停靠位上。
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
      <span v-if="!events.length">收起 / 展开事件会显示在这里</span>
    </n-flex>
    <div class="panel-demo">
      <n-page>
        <n-panel
          fixed
          anchor="top-right"
          title="调试面板"
          collapsible
          collapse-target="bottom-right"
          @collapse="events.push('collapse')"
          @expand="events.push('expand')"
        >
          <n-card size="small" style="width: 200px">
            收起后会在右下角留下一枚标签
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
