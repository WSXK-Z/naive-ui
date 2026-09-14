# 页 Page

页面是路由级容器，一个路由一个页面。它给面板提供定位参照系与停靠位，页面自己只决定「东西摆在哪」，不关心摆的是什么。

## 演示

```demo
basic.vue
stacked.vue
anchors-config.vue
```

## API

### Page Props

| 名称 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| anchor-direction | `'vertical' \| 'horizontal'` | `'vertical'` | 同一个停靠位上多个面板的排列方向 |
| anchor-gap | `number \| string` | `10` | 同一个停靠位上多个面板的间距 |
| anchor-wrap | `boolean` | `false` | 排列方向为 `horizontal` 时是否允许换行 |
| anchors | `PanelAnchor[]` | 七个内置停靠位 | 页面注册哪些停靠位；自定义名字会被渲染成 `.n-page-anchor--<名字>`，位置由使用方给出 |
| persist-namespace | `string` | `undefined` | 面板持久化键的前缀 |
| persist-storage | `PanelStorage` | `undefined` | 面板持久化的存储介质，不传时用 `localStorage` |

透传的属性（`class`、`style`、事件）会落到 `.n-page` 上。

### Page Methods

页面的模板 ref（`PageInst`）：

| 名称 | 类型 | 说明 |
| --- | --- | --- |
| bringToFront | `(name: string) => boolean` | 把指定名字的面板提到页面内最上层 |
| getPanel | `(name: string) => PanelGroupHandle \| undefined` | 按名字取面板句柄 |
| getPanels | `() => PanelGroupHandle[]` | 取页面里所有面板的句柄 |

同一个页面里的组件也可以用 `usePanelGroup()` 拿到同样的能力（见面板的「面板组与协作」）。

### Page Slots

| 名称    | 参数 | 说明     |
| ------- | ---- | -------- |
| default | `()` | 页面内容 |

### 停靠位

`PanelAnchor` 一共七个值：

| 值              | 位置     |
| --------------- | -------- |
| `top-left`      | 左上角   |
| `top-center`    | 上边居中 |
| `top-right`     | 右上角   |
| `center`        | 正中     |
| `bottom-left`   | 左下角   |
| `bottom-center` | 下边居中 |
| `bottom-right`  | 右下角   |

停靠位先于页面内容渲染，所以面板挂载时就能拿到容器，不需要 `nextTick` 或重试。停靠位是覆盖层而不是布局块：它不影响页面排布，也不会挡住底层内容的点击，只有真正挂进去的面板可以交互。

同一个停靠位上的多个面板默认按挂载顺序竖向堆叠，间距由 `anchor-gap` 给出（默认 10px）；`anchor-direction` 为 `horizontal` 时改为横向排列，`anchor-wrap` 打开后超出宽度的面板会换行。

### 样式契约

| 类名 | 说明 |
| --- | --- |
| `.n-page` | 定位参照系（`position: relative`、`overflow: hidden`） |
| `.n-page-anchors` | 停靠位覆盖层（`z-index: 30`，不接收指针） |
| `.n-page-anchors--horizontal` / `--wrap` | 停靠位的排列方向与换行开关 |
| `.n-page-anchor--<anchor>` | 单个停靠位（`flex column`、`gap: var(--n-page-anchor-gap)`） |

CSS 变量：`--n-page-anchor-gap`（写在 `.n-page-anchors` 上，由 `anchor-gap` 写入）。

### 约定

- 页面不感知路由、不读业务数据；面板的位移 / 缩放 / 显隐由页面决定是否持久化，用 `persist-namespace` 与 `persist-storage` 可以交给面板自己存；
- 面板与页面之间没有 import 关系，只通过注入的页面上下文协作，所以面板可以脱离页面单独使用（找不到停靠位时原地渲染，不报错）；
- 自定义停靠位没有内置位置，需要用页面样式给：`.n-page-anchor--<名字> { top: 40%; right: 12px; }`（面板根节点是 Teleport 片段，文档站的演示样式会被作用域化，得用 `:deep()` 或全局样式）。
