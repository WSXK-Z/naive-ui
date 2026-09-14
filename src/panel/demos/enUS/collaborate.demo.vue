<markdown>
# Panel Collaboration

Panels of the same page are registered into the panel group of the page, any component inside the page can reach it with `usePanelGroup()`:

- `getPanels()` / `getPanel(name)` find panels, a handle provides `reset`, `collapse`, `expand`, `bringToFront` and `getRect`;
- `bringToFront(name)` moves a panel to the front of the page;
- a panel in operating mode is brought to the front automatically.

The buttons below operate another panel through it.
</markdown>

<script lang="ts" setup>
import { NButton, NFlex, usePanelGroup } from 'naive-ui'
import { defineComponent, h } from 'vue'

const PanelActions = defineComponent({
  name: 'PanelActions',
  setup() {
    const group = usePanelGroup()
    return () =>
      h(
        NFlex,
        { size: 8 },
        {
          default: () => [
            h(
              NButton,
              {
                size: 'tiny',
                onClick: () => group?.bringToFront('notes')
              },
              { default: () => 'Bring notes to front' }
            ),
            h(
              NButton,
              {
                size: 'tiny',
                onClick: () => group?.getPanel('notes')?.collapse()
              },
              { default: () => 'Collapse notes' }
            ),
            h(
              NButton,
              {
                size: 'tiny',
                onClick: () =>
                  group?.getPanels().forEach(panel => panel.reset())
              },
              { default: () => 'Reset all' }
            )
          ]
        }
      )
  }
})
</script>

<template>
  <div class="panel-demo">
    <n-page>
      <div style="padding: 12px">
        <n-card size="small" title="Panel group actions">
          <PanelActions />
        </n-card>
      </div>
      <n-panel
        name="notes"
        fixed
        anchor="top-right"
        title="Notes"
        movable
        scalable
        collapsible
      >
        <n-card size="small" style="width: 200px">
          Double click to operate it
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
</style>
