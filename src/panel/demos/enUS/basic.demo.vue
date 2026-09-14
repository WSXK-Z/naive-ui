<markdown>
# Basic

A panel is a unit of a page. A regular panel is in the document flow, a `fixed` panel is docked to an anchor of the page. They can be combined freely.
</markdown>

<template>
  <div class="panel-demo">
    <n-page>
      <div class="panel-demo__flow">
        <n-panel>
          <n-card size="small" title="Regular panel">
            In the document flow, the size is up to the usage
          </n-card>
        </n-panel>
      </div>
      <n-panel fixed anchor="top-right" title="Docked panel">
        <n-card size="small" style="width: 200px">
          Docked to top right
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
