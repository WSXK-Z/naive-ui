# Panel

A panel is a unit of a page. A set of orthogonal switches describe whether it takes space, where it is docked and whether it can be dragged, scaled or collapsed. The business only cares about the content, the shape comes from the switches.

## Demos

```demo
basic.vue
movable.vue
drag-constraints.vue
resizable.vue
collapse.vue
floating.vue
persist.vue
collaborate.vue
custom-tools.vue
```

## API

### Panel Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| anchor | `PanelAnchor` | `'top-right'` | Where a fixed panel is docked, also the default target of its collapsed tag |
| collapse-target | `PanelAnchor` | `undefined` | The anchor of the collapsed tag, defaults to `anchor` |
| collapsible | `boolean` | `false` | Whether the panel can be collapsed into a small tag |
| drag-boundary | `boolean` | `false` | Whether a dragged panel is kept inside the container (the page) |
| drag-grid | `number` | `undefined` | Grid step the dragged offset sticks to, no sticking when it isn't set |
| drag-snap | `number` | `undefined` | Distance in which the edges and the center of a dragged panel stick to the ones of the container |
| fixed | `boolean` | `false` | Whether the panel is docked to `anchor`, without taking part in the page layout |
| height | `number` | `undefined` | The height of the panel (`v-model:height`), the content decides when it isn't set |
| movable | `boolean` | `false` | Whether the panel can be dragged in operating mode |
| name | `string` | `undefined` | The name of the panel in the panel group of the page, the page and other panels look it up by it |
| occupies-space | `boolean` | `true` | When `false`, the panel leaves the document flow (`position: absolute` without `top` / `left`) and keeps its static position |
| offset | `[number, number]` | `undefined` | The offset (`v-model:offset`) |
| operate-outline | `boolean` | `true` | Whether the built-in dashed outline shows in operating mode |
| operate-tools | `boolean` | `true` | Whether the built-in tools show in operating mode |
| operate-trigger | `string` | `'self'` | What to double click to enter operating mode, a selector inside the panel is allowed (e.g. `.avatar`) |
| operating | `boolean` | `undefined` | The operating mode switch (`v-model:operating`) |
| persist | `string` | `undefined` | The persist key, with `persist-namespace` / `persist-storage` of the page it keeps the offset, the scale, the size and the collapsed state |
| resizable | `boolean` | `false` | Whether the size can be dragged by the bottom right trigger in operating mode |
| scale | `number` | `undefined` | The scale (`v-model:scale`), 0.3 ~ 3 |
| scale-transform | `boolean` | `true` | When `false`, no `scale()` is applied and the ratio is only exposed as `--n-panel-scale` for the content |
| scalable | `boolean` | `false` | Whether the panel can be scaled in operating mode |
| title | `string` | `''` | The name shown in the tools and on the collapsed tag |
| wheel-scale | `boolean` | `true` | Whether the wheel scales the panel in operating mode |
| width | `number` | `undefined` | The width of the panel (`v-model:width`), the content decides when it isn't set |

### Panel Events

| Name | Param | Description |
| --- | --- | --- |
| collapse | `()` | Emitted on collapse |
| expand | `()` | Emitted on expand |
| update:height | `(height: number \| undefined) => void` | Emitted on a size drag and reset, `undefined` means the size of the content |
| update:offset | `(offset: [number, number]) => void` | Emitted on drag and reset |
| update:operating | `(operating: boolean) => void` | Emitted when operating mode is entered or left |
| update:scale | `(scale: number) => void` | Emitted on tools, wheel scaling and reset |
| update:width | `(width: number \| undefined) => void` | Emitted on a size drag and reset, `undefined` means the size of the content |

### Panel Slots

| Name | Param | Description |
| --- | --- | --- |
| default | `()` | The content of the panel |
| tools | `{ scale, offset, setScale, setOffset, reset, collapse, exit }` | Replaces the content of the built-in tools, rendered inside `.n-panel-tools` |

### The Three Positions

| Position | Condition | Behaviour |
| --- | --- | --- |
| Normal flow | `fixed` is `false`, `occupies-space` `true` | An ordinary block panel, takes part in the page layout |
| Docked | `fixed` is `true` | Teleported into an anchor, doesn't take page space |
| Floating | `occupies-space` is `false`, `fixed` `false` | `position: absolute` without `top` / `left`, leaves the document flow but keeps its static position, doesn't push siblings |

### Operating Mode

Double click the trigger to enter operating mode, only then the panel can be dragged and scaled. There are five ways out: double click the trigger again, `Esc`, the done tool, clicking outside the panel and collapsing.

A panel responds to the double click only when at least one of `movable`, `scalable` and `collapsible` is set, since the tools are the only way to collapse a panel.

### Offset and Scale

Both the offset and the scale are written on the `transform` of the panel itself (`translate(var(--n-panel-x), var(--n-panel-y)) scale(var(--n-panel-scale))`), therefore:

- other panels keep their layout, no page wide reflow is triggered;
- the panel exposes `--n-panel-x`, `--n-panel-y` and `--n-panel-scale`, inner elements can use them for layout;
- when `scale-transform` is `false` no `scale()` is applied, the ratio is only a layout size, which fits content like a canvas that shouldn't be stretched;
- a panel with an offset or a scale gets a `--transformed` class, so the page can show a reset entry.

Both offset and scale are in page pixels, they are not affected by `--n-panel-scale`.

### Drag Constraints

| Prop | Effect |
| --- | --- |
| `drag-grid` | The offset is rounded to the grid (`Math.round(delta / grid) * grid`) |
| `drag-snap` | The start edge, the end edge and the center of the panel stick to the matching place of the container within the distance |
| `drag-boundary` | The offset is kept inside the container, an oversized panel is aligned to the start edge |

The container is the root element of the page (`.n-page`). Outside of a page (without `Page`) `drag-boundary` and `drag-snap` do nothing while `drag-grid` still works. The order is sticking, grid and then the boundary, so the boundary always holds.

### Resize

A `resizable` panel renders a size trigger (`.n-panel-resize-trigger`) at its bottom right corner in operating mode, dragging it changes the width and the height, both are emitted through `v-model:width` / `v-model:height` (pixels, rounded). The `min-width` / `min-height` of the panel are kept as the limit of the drag. When the panel is scaled, the pointer movement is converted back to the layout size with `--n-panel-scale`.

`reset()` (the reset tool) clears the offset, the scale and the size, the panel goes back to the size of its content.

### Persist

With a `persist` key on a panel and `persist-namespace` (key prefix) / `persist-storage` (`localStorage` by default) of the page, the offset, the scale, the size and the collapsed state are kept. The state is restored after the panel is mounted (`onMounted`) so it never breaks SSR hydration, the restored values are emitted through `update:offset` / `update:scale` / `update:width` / `update:height` so a controlled page can take them over. An unavailable storage, a broken value or a version mismatch is ignored.

### Panel Group

Panels of the same page are registered into the panel group of the page, any component inside the page reaches it with `usePanelGroup()`:

| Member | Description |
| --- | --- |
| `getPanels()` | The handles of all panels of the page (a reactive array) |
| `getPanel(name)` | The handle of a panel found by `name` |
| `bringToFront(name)` | Moves a panel to the front of the page, `false` when it isn't found |

A handle (`PanelGroupHandle`) provides `reset`, `collapse`, `expand`, `bringToFront`, `getRect`, `getZIndex`, `id` and `name`. A panel in operating mode is brought to the front automatically (`z-index` grows from 100), the fixed layering isn't used anymore.

The page exposes `getPanels` / `getPanel` / `bringToFront` on its template ref (`PageInst`) and a panel exposes `reset` / `collapse` / `expand` / `bringToFront` / `setOffset` / `setScale` / `setSize` / `getRect` on its own (`PanelInst`).

### Style Contract

| Class | Description |
| --- | --- |
| `.n-panel` | The root of a panel (`flex column`) |
| `.n-panel--floating` | Out of the document flow, keeps the static position |
| `.n-panel--operating` | Operating mode (`z-index: 60`, `cursor: move`) |
| `.n-panel--outlined` | The built-in dashed outline of operating mode |
| `.n-panel--dragging` | Dragging (the `transform` transition is disabled to follow the pointer) |
| `.n-panel--transformed` | There is an offset or a scale |
| `.n-panel--scale-as-size` | No `scale()`, the ratio is only used as a layout size |
| `.n-panel-tools` | The built-in tools (absolutely positioned at the top center of the panel) |
| `.n-panel-chip` | The collapsed tag (the wrapper of the `n-tag`) |
| `.n-panel-resize-trigger` | The size trigger of operating mode (at the bottom right corner) |

### Caveats

- A panel doesn't handle the size of its content, width / height / max height come from the content and the usage (a `class` or a style), `resizable` is the explicit way to change the size;
- `anchor` of a `fixed` panel must be an anchor the page has rendered (the 7 built-in ones or a name configured in `anchors` of the page). Without a `Page` the panel renders in place without any error;
- The root of a panel is a Teleport fragment, so a parent `scoped` style can't select the panel itself. Write panel level layout on a `class` or on inner elements;
- The outside click test listens on the capture phase of `document`, so `stopPropagation` of inner components doesn't break it;
- Persisting and the panel group both need a page: without a `Page` a panel registers into no group and `persist` falls back to `localStorage` without a namespace.
