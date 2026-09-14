# Page

A page is the container of a route, one page per route. It gives panels a coordinate system and anchors, it only decides where things are placed instead of what they are.

## Demos

```demo
basic.vue
stacked.vue
```

## API

### Page Props

The page has no props of its own, attributes (`class`, `style`, events) are passed to `.n-page`.

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

Anchors are rendered before the page content, so a panel can get its container at mount time without `nextTick` or retries. An anchor is an overlay instead of a layout block: it doesn't affect the page layout and doesn't block clicks on the underlying content, only panels docked into it are interactive. Panels docked to the same anchor are stacked vertically in mount order with a 10px gap.

### Style Contract

| Class | Description |
| --- | --- |
| `.n-page` | The coordinate system (`position: relative`, `overflow: hidden`) |
| `.n-page-anchors` | The overlay of anchors (`z-index: 30`, doesn't receive pointers) |
| `.n-page-anchor--<anchor>` | A single anchor (`flex column`, `gap: 10px`) |

### Notes

- A page is unaware of the router and doesn't read business data, the page decides whether to persist the offset / scale / visibility of its panels;
- A panel and a page never import each other, they only cooperate through the injected anchor registry, so a panel can be used without a page (it renders in place, without any error).
