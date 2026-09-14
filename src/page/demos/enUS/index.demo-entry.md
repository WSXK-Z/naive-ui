# Page

A page is the container of a route, one page per route. It gives panels a coordinate system and anchors, it only decides where things are placed instead of what they are.

## Demos

```demo
basic.vue
stacked.vue
anchors-config.vue
```

## API

### Page Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| anchor-direction | `'vertical' \| 'horizontal'` | `'vertical'` | The direction of the panels docked to the same anchor |
| anchor-gap | `number \| string` | `10` | The gap between the panels docked to the same anchor |
| anchor-wrap | `boolean` | `false` | Whether the panels wrap when the direction is `horizontal` |
| anchors | `PanelAnchor[]` | the 7 built-in anchors | Which anchors the page registers; a custom name is rendered as `.n-page-anchor--<name>` and its place is up to the usage |
| persist-namespace | `string` | `undefined` | The prefix of the persist keys of the panels |
| persist-storage | `PanelStorage` | `undefined` | Where the panels are persisted, `localStorage` by default |

Attributes (`class`, `style`, events) are passed to `.n-page`.

### Page Methods

The template ref of a page (`PageInst`):

| Name | Type | Description |
| --- | --- | --- |
| bringToFront | `(name: string) => boolean` | Moves the panel with the name to the front of the page |
| getPanel | `(name: string) => PanelGroupHandle \| undefined` | The handle of a panel found by name |
| getPanels | `() => PanelGroupHandle[]` | The handles of all panels of the page |

A component inside the page reaches the same through `usePanelGroup()` (see the panel group section of the panel).

### Page Slots

| Name    | Param | Description  |
| ------- | ----- | ------------ |
| default | `()`  | Page content |

### Anchors

`PanelAnchor` has 7 values:

| Value           | Position      |
| --------------- | ------------- |
| `top-left`      | Top left      |
| `top-center`    | Top center    |
| `top-right`     | Top right     |
| `center`        | Center        |
| `bottom-left`   | Bottom left   |
| `bottom-center` | Bottom center |
| `bottom-right`  | Bottom right  |

Anchors are rendered before the page content, so a panel can get its container at mount time without `nextTick` or retries. An anchor is an overlay instead of a layout block: it doesn't affect the page layout and doesn't block clicks on the underlying content, only panels docked into it are interactive.

Panels docked to the same anchor are stacked vertically in mount order, the gap comes from `anchor-gap` (10px by default). With `anchor-direction` set to `horizontal` they are laid out in a row, and `anchor-wrap` lets the panel which doesn't fit wrap to the next line.

### Style Contract

| Class | Description |
| --- | --- |
| `.n-page` | The coordinate system (`position: relative`, `overflow: hidden`) |
| `.n-page-anchors` | The overlay of anchors (`z-index: 30`, doesn't receive pointers) |
| `.n-page-anchors--horizontal` / `--wrap` | The direction and the wrapping of the anchors |
| `.n-page-anchor--<anchor>` | A single anchor (`flex column`, `gap: var(--n-page-anchor-gap)`) |

CSS variables: `--n-page-anchor-gap` (written on `.n-page-anchors` from `anchor-gap`).

### Notes

- A page is unaware of the router and doesn't read business data, the page decides whether to persist the offset / scale / visibility of its panels, `persist-namespace` and `persist-storage` let the panels persist themselves;
- A panel and a page never import each other, they only cooperate through the injected page context, so a panel can be used without a page (it renders in place, without any error);
- A custom anchor has no built-in place, the page styles it: `.n-page-anchor--<name> { top: 40%; right: 12px; }` (the root of a panel is a Teleport fragment and the styles of a demo of the site are scoped, so use `:deep()` or a global style there).
