# 面板 Panel

面板是页面的组成单位，用一组正交开关描述自己「占不占空间、固定在哪、能不能拖 / 缩 / 收」。业务只关心内容，形态由开关组合出来。

## 演示

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

| 名称 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| anchor | `PanelAnchor` | `'top-right'` | 固定面板的落位，也是收起标签的默认去处 |
| collapse-target | `PanelAnchor` | `undefined` | 收起标签的停靠位，默认与 `anchor` 相同 |
| collapsible | `boolean` | `false` | 是否可收起为小标签 |
| drag-boundary | `boolean` | `false` | 拖动时是否把面板限制在容器（页面）内 |
| drag-grid | `number` | `undefined` | 拖动位移吸附的网格步长，不设则不吸附 |
| drag-snap | `number` | `undefined` | 拖动时面板边缘 / 中线吸附到容器边缘 / 中线的距离阈值 |
| fixed | `boolean` | `false` | 是否固定到 `anchor` 指定的停靠位，不参与页面排布 |
| height | `number` | `undefined` | 面板高度（`v-model:height`），不设时由内容决定 |
| movable | `boolean` | `false` | 双击触发元素进入操作模式后，是否可以在其中拖动 |
| name | `string` | `undefined` | 面板在页面面板组里的名字，供页面与其它面板查询 |
| occupies-space | `boolean` | `true` | 为 `false` 时脱离文档流（`position: absolute` 且不设 `top` / `left`），保留原来的静态位置 |
| offset | `[number, number]` | `undefined` | 位移（`v-model:offset`） |
| operate-outline | `boolean` | `true` | 操作模式是否显示内置虚线框 |
| operate-tools | `boolean` | `true` | 操作模式是否显示内置工具条 |
| operate-trigger | `string` | `'self'` | 双击哪里进入操作模式，可以写面板内部的选择器（如 `.avatar`） |
| operating | `boolean` | `undefined` | 操作模式开关（`v-model:operating`） |
| persist | `string` | `undefined` | 持久化键，配合页面的 `persist-namespace` / `persist-storage` 保存位移、缩放、尺寸与收起状态 |
| resizable | `boolean` | `false` | 操作模式是否可以通过右下角手柄拖拽调整宽高 |
| scale | `number` | `undefined` | 缩放比例（`v-model:scale`），范围 0.3 ~ 3 |
| scale-transform | `boolean` | `true` | 为 `false` 时不做 `scale()`，只把比例作为 `--n-panel-scale` 暴露给内部 |
| scalable | `boolean` | `false` | 是否可以在操作模式中缩放 |
| title | `string` | `''` | 工具条与收起标签上显示的名字 |
| wheel-scale | `boolean` | `true` | 操作模式是否支持滚轮缩放 |
| width | `number` | `undefined` | 面板宽度（`v-model:width`），不设时由内容决定 |

### Panel Events

| 名称 | 参数 | 说明 |
| --- | --- | --- |
| collapse | `()` | 收起时触发 |
| expand | `()` | 展开时触发 |
| update:height | `(height: number \| undefined) => void` | 拖拽尺寸或复位时触发，`undefined` 表示回到内容尺寸 |
| update:offset | `(offset: [number, number]) => void` | 拖动或复位时触发 |
| update:operating | `(operating: boolean) => void` | 进入或退出操作模式时触发 |
| update:scale | `(scale: number) => void` | 工具条、滚轮缩放或复位时触发 |
| update:width | `(width: number \| undefined) => void` | 拖拽尺寸或复位时触发，`undefined` 表示回到内容尺寸 |

### Panel Slots

| 名称 | 参数 | 说明 |
| --- | --- | --- |
| default | `()` | 面板内容 |
| tools | `{ scale, offset, setScale, setOffset, reset, collapse, exit }` | 替换内置工具条的内容，内容渲染在 `.n-panel-tools` 容器内 |

### 三种位置姿态

| 姿态 | 条件 | 表现 |
| --- | --- | --- |
| 常规流 | `fixed` 为 `false`、`occupies-space` 为 `true` | 普通块级面板，参与页面排布 |
| 固定停靠 | `fixed` 为 `true` | Teleport 到停靠位，不占页面空间 |
| 悬浮 | `occupies-space` 为 `false`、`fixed` 为 `false` | `position: absolute` 且不设 `top` / `left`，脱离文档流但停在原静态位置，不推挤兄弟面板 |

### 操作模式

双击触发元素进入操作模式，此时才可以拖动与缩放。退出方式有五种：再次双击触发元素、`Esc`、工具条的「完成」、点击面板外、收起。

面板至少要有 `movable`、`scalable`、`collapsible` 之一才会响应双击，因为工具条是收起面板的唯一入口。

### 位移与缩放

位移与缩放都写在面板自身的 `transform` 上（`translate(var(--n-panel-x), var(--n-panel-y)) scale(var(--n-panel-scale))`），因此：

- 不改变其它面板的排布，不会引发整页 reflow；
- 面板同时暴露 `--n-panel-x`、`--n-panel-y`、`--n-panel-scale`，内部元素可以拿去做联动；
- `scale-transform` 为 `false` 时不做 `scale()`，比例只当布局尺寸用，适合画布这类不希望被拉伸的内容；
- 有位移或缩放的面板会带上 `--transformed` 类，页面可以据此显示「复位」入口。

位移与缩放都是页面像素单位，不随 `--n-panel-scale` 换算。

### 拖动约束

| 属性 | 作用 |
| --- | --- |
| `drag-grid` | 位移按网格取整（`Math.round(delta / grid) * grid`） |
| `drag-snap` | 面板的起始边 / 结束边 / 中线距容器对应位置小于阈值时吸附过去 |
| `drag-boundary` | 位移被限制在容器内；面板比容器还大时对齐到起始边 |

约束的参照容器是页面的根元素（`.n-page`）。面板不在页面里时（外面没包 `Page`）`drag-boundary` 与 `drag-snap` 不生效，`drag-grid` 仍然有效。处理顺序是吸附、网格、边界，边界永远成立。

### 尺寸调整

`resizable` 的面板在操作模式里会渲染右下角的尺寸手柄（`.n-panel-resize-trigger`），拖动它改变宽高，结果通过 `v-model:width` / `v-model:height` 抛出（像素，取整）。面板自身的 `min-width` / `min-height` 会作为下限；面板被缩放时，指针位移会按 `--n-panel-scale` 换算回布局尺寸。

`reset()`（工具条的复位按钮）会同时复位位移、缩放与尺寸，尺寸回到内容撑开的大小。

### 持久化

给面板 `persist` 一个键，页面用 `persist-namespace`（键前缀）与 `persist-storage`（默认 `localStorage`）决定存到哪里，保存的内容是位移、缩放、尺寸与收起状态。恢复发生在面板挂载后（`onMounted`），因此不会造成 SSR 水合不一致；恢复时会照常抛出 `update:offset` / `update:scale` / `update:width` / `update:height`，受控的页面可以据此接管。存储不可用、内容损坏或版本不匹配时直接忽略。

### 面板组与协作

同一个页面里的面板会注册到页面的面板组，页面内任何组件都能用 `usePanelGroup()` 取用：

| 成员                 | 说明                                       |
| -------------------- | ------------------------------------------ |
| `getPanels()`        | 页面里所有面板的句柄（响应式数组）         |
| `getPanel(name)`     | 按 `name` 找面板句柄                       |
| `bringToFront(name)` | 把面板提到页面内最上层，找不到返回 `false` |

面板句柄（`PanelGroupHandle`）提供 `reset`、`collapse`、`expand`、`bringToFront`、`getRect`、`getZIndex`、`id` 与 `name`。进入操作模式的面板会自动置顶（`z-index` 从 100 起递增），不再依赖固定的层级。

页面把 `getPanels` / `getPanel` / `bringToFront` 暴露在模板 ref 上（`PageInst`），面板把 `reset` / `collapse` / `expand` / `bringToFront` / `setOffset` / `setScale` / `setSize` / `getRect` 暴露在自己的 ref 上（`PanelInst`）。

### 样式契约

| 类名                      | 说明                                        |
| ------------------------- | ------------------------------------------- |
| `.n-panel`                | 面板根元素（`flex column`）                 |
| `.n-panel--floating`      | 脱离文档流、保留静态位置                    |
| `.n-panel--operating`     | 操作模式（`z-index: 60`、`cursor: move`）   |
| `.n-panel--outlined`      | 操作模式下的内置虚线框                      |
| `.n-panel--dragging`      | 拖动中（关掉 `transform` 过渡，让面板跟手） |
| `.n-panel--transformed`   | 当前有位移或缩放                            |
| `.n-panel--scale-as-size` | 不做 `scale()`，比例只当布局尺寸用          |
| `.n-panel-tools`          | 内置工具条（绝对定位在面板顶部居中）        |
| `.n-panel-chip`           | 收起后的小标签（`n-tag` 外面包的一层）      |
| `.n-panel-resize-trigger` | 操作模式下的尺寸手柄（右下角）              |

### 约束

- 面板不管内容尺寸，宽度 / 高度 / 最大高度默认由内容与使用方决定（`class` 或样式），`resizable` 是显式改变尺寸的方式；
- `fixed` 面板的 `anchor` 必须是页面已渲染的停靠位（默认七个内置停靠位，或页面 `anchors` 里配的名字）；页面没包 `Page` 时面板原地渲染，不报错；
- 面板的根节点是 Teleport 片段，父组件的 `scoped` 样式选中不了面板本身，面板级布局请写在 `class` 上，或写在面板内部元素上；
- 点击面板外的判定在 `document` 的捕获阶段监听，因此不会被内部组件的 `stopPropagation` 影响；
- 持久化与面板组都依赖页面：没有 `Page` 时面板不注册进任何面板组，`persist` 退化为直接读写 `localStorage`（键不加命名空间）。
