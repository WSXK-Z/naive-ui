<markdown>
# 基础用法

面板是页面的组成单位。常规面板参与文档流，`fixed` 面板停靠到页面的停靠位上，两者也可以自由组合。
</markdown>

<template>
  <div class="panel-demo">
    <n-page>
      <div class="panel-demo__flow">
        <n-panel>
          <n-card size="small" title="常规面板">
            参与文档流，宽度由使用方决定
          </n-card>
        </n-panel>
      </div>
      <n-panel fixed anchor="top-right" title="停靠面板">
        <n-card size="small" style="width: 200px">
          固定在右上角
        </n-card>
      </n-panel>
    </n-page>
  </div>
</template>

<style>
.panel-demo {
  height: 260px;
  border-radius: 3px;
  background-color: rgba(128, 128, 128, 0.15);
}

.panel-demo__flow {
  width: 240px;
  padding: 12px;
}
</style>
