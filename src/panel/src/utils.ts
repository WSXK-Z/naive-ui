export interface PanelRect {
  left: number
  top: number
  width: number
  height: number
}

export interface PanelDragDeltaOptions {
  // the visual rect of the panel when the drag started
  startRect: PanelRect
  // the rect of the container the panel is constrained in
  containerRect: PanelRect
  // grid step of the offset, 0 or undefined means no grid
  grid?: number
  // distance in which the edges and the center of the panel stick to the ones
  // of the container, 0 or undefined means no sticking
  snap?: number
  // keep the panel inside the container
  boundary?: boolean
}

export interface PanelResizeSizeOptions {
  // the visual size of the panel on the axis when the drag started
  startSize: number
  // the pointer movement on the axis
  delta: number
  // visual size = layout size * scale
  scale: number
  // the css min size (layout size) of the panel
  minSize: number
}

function resolveAxisDelta(
  delta: number,
  start: number,
  size: number,
  containerStart: number,
  containerSize: number,
  snap: number | undefined,
  grid: number | undefined,
  boundary: boolean | undefined
): number {
  let next = delta
  if (snap !== undefined && snap > 0) {
    // the two edges and the center of the panel stick to the ones of the
    // container
    const candidates = [
      containerStart - start,
      containerStart + containerSize - (start + size),
      containerStart + (containerSize - size) / 2 - start
    ]
    let nearest = next
    let nearestDistance = snap
    candidates.forEach((candidate) => {
      const distance = Math.abs(candidate - next)
      if (distance <= nearestDistance) {
        nearestDistance = distance
        nearest = candidate
      }
    })
    next = nearest
  }
  if (grid !== undefined && grid > 0) {
    next = Math.round(next / grid) * grid
  }
  if (boundary) {
    const min = containerStart - start
    const max = containerStart + containerSize - (start + size)
    // a panel larger than the container is aligned to the start edge
    next = min > max ? min : Math.min(Math.max(next, min), max)
  }
  return next
}

export function resolvePanelDragDelta(
  dx: number,
  dy: number,
  options: PanelDragDeltaOptions
): [number, number] {
  const { startRect, containerRect, grid, snap, boundary } = options
  return [
    resolveAxisDelta(
      dx,
      startRect.left,
      startRect.width,
      containerRect.left,
      containerRect.width,
      snap,
      grid,
      boundary
    ),
    resolveAxisDelta(
      dy,
      startRect.top,
      startRect.height,
      containerRect.top,
      containerRect.height,
      snap,
      grid,
      boundary
    )
  ]
}

export function resolvePanelResizeSize(
  options: PanelResizeSizeOptions
): number {
  const { startSize, delta, scale, minSize } = options
  const safeScale = scale > 0 ? scale : 1
  const visualSize = Math.max(startSize + delta, minSize * safeScale)
  return Math.round(visualSize / safeScale)
}
