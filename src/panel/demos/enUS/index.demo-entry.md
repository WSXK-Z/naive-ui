# Panel

A panel is a unit of a page. A set of orthogonal switches describe whether it takes space, where it is docked and whether it can be dragged, scaled or collapsed. The business only cares about the content, the shape comes from the switches.

## Demos

```demo
basic.vue
movable.vue
collapse.vue
floating.vue
custom-tools.vue
```

## API

### Panel Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| anchor | `PanelAnchor` | `'top-right'` | Where a fixed panel is docked, also the default target of its collapsed tag |
| collapse-target | `PanelAnchor` | `undefined` | The anchor of the collapsed tag, defaults to `anchor` |
| collapsible | `boolean` | `false` | Whether the panel can be collapsed into a small tag |
| fixed | `boolean` | `false` | Whether the panel is docked to `anchor`, without taking part in the page layout |
| movable | `boolean` | `false` | Whether the panel can be dragged in operating mode |
| occupies-space | `boolean` | `true` | When `false`, the panel leaves the document flow (`position: absolute` without `top` / `left`) and keeps its static position |
| offset | `[number, number]` | `undefined` | The offset (`v-model:offset`) |
| operate-outline | `boolean` | `true` | Whether the built-in dashed outline shows in operating mode |
| operate-tools | `boolean` | `true` | Whether the built-in tools show in operating mode |
| operate-trigger | `string` | `'self'` | What to double click to enter operating mode, a selector inside the panel is allowed (e.g. `.avatar`) |
| operating | `boolean` | `undefined` | The operating mode switch (`v-model:operating`) |
| scale | `number` | `undefined` | The scale (`v-model:scale`), 0.3 ~ 3 |
| scale-transform | `boolean` | `true` | When `false`, no `scale()` is applied and the ratio is only exposed as `--n-panel-scale` for the content |
| scalable | `boolean` | `false` | Whether the panel can be scaled in operating mode |
| title | `string` | `''` | The name shown in the tools and on the collapsed tag |
| wheel-scale | `boolean` | `true` | Whether the wheel scales the panel in operating mode |

### Panel Events

| Name | Param | Description |
| --- | --- | --- |
| collapse | `()` | Emitted on collapse |
| expand | `()` | Emitted on expand |
| update:offset | `(offset: [number, number]) => void` | Emitted on drag and reset |
| update:operating | `(operating: boolean) => void` | Emitted when operating mode is entered or left |
| update:scale | `(scale: number) => void` | Emitted on tools, wheel scaling and reset |

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

### Caveats

- A panel doesn't handle the size of its content, width / height / max height are up to the usage (a class or a non-scoped style of the page);
- `anchor` of a `fixed` panel must be an anchor the page has rendered. Without a `Page` the panel renders in place without any error;
- The root of a panel is a Teleport fragment, so a parent `scoped` style can't select the panel itself. Write panel level layout on a `class` or on inner elements;
- The outside click test listens on the capture phase of `document`, so `stopPropagation` of inner components doesn't break it.
