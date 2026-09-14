import { resolvePanelDragDelta, resolvePanelResizeSize } from '../src/utils'

describe('n-panel utils', () => {
  const startRect = { left: 100, top: 100, width: 200, height: 100 }
  const containerRect = { left: 0, top: 0, width: 500, height: 400 }

  it('should keep the delta without options', () => {
    expect(resolvePanelDragDelta(30, 40, { startRect, containerRect })).toEqual(
      [30, 40]
    )
  })

  it('should snap the delta to `grid`', () => {
    expect(
      resolvePanelDragDelta(13, 27, { startRect, containerRect, grid: 10 })
    ).toEqual([10, 30])
    expect(
      resolvePanelDragDelta(16, 24, { startRect, containerRect, grid: 10 })
    ).toEqual([20, 20])
  })

  it('should keep the panel inside the container with `boundary`', () => {
    expect(
      resolvePanelDragDelta(-400, 0, {
        startRect,
        containerRect,
        boundary: true
      })
    ).toEqual([-100, 0])
    expect(
      resolvePanelDragDelta(400, 0, {
        startRect,
        containerRect,
        boundary: true
      })
    ).toEqual([200, 0])
    expect(
      resolvePanelDragDelta(0, -400, {
        startRect,
        containerRect,
        boundary: true
      })
    ).toEqual([0, -100])
    expect(
      resolvePanelDragDelta(0, 400, {
        startRect,
        containerRect,
        boundary: true
      })
    ).toEqual([0, 200])
  })

  it('should align an oversized panel to the start edge', () => {
    expect(
      resolvePanelDragDelta(0, 0, {
        startRect: { left: 100, top: 100, width: 600, height: 100 },
        containerRect,
        boundary: true
      })
    ).toEqual([-100, 0])
  })

  it('should stick to the edges and the center of the container with `snap`', () => {
    // 8px away from the left edge of the container
    expect(
      resolvePanelDragDelta(-92, 0, { startRect, containerRect, snap: 10 })
    ).toEqual([-100, 0])
    // 6px away from the center of the container
    expect(
      resolvePanelDragDelta(44, 0, { startRect, containerRect, snap: 10 })
    ).toEqual([50, 0])
    // 30px away from the closest edge, nothing happens
    expect(
      resolvePanelDragDelta(-70, 0, { startRect, containerRect, snap: 10 })
    ).toEqual([-70, 0])
  })

  it('should resolve the size of a resize', () => {
    expect(
      resolvePanelResizeSize({
        startSize: 200,
        delta: 40,
        scale: 1,
        minSize: 0
      })
    ).toBe(240)
    // the visual size is converted back to the layout size
    expect(
      resolvePanelResizeSize({
        startSize: 200,
        delta: 40,
        scale: 2,
        minSize: 0
      })
    ).toBe(120)
    // the css min size is kept
    expect(
      resolvePanelResizeSize({
        startSize: 200,
        delta: -180,
        scale: 1,
        minSize: 100
      })
    ).toBe(100)
    expect(
      resolvePanelResizeSize({
        startSize: 200,
        delta: -180,
        scale: 2,
        minSize: 100
      })
    ).toBe(100)
  })
})
