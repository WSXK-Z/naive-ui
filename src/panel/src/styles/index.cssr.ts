import { c, cB, cE, cM } from '../../../_utils/cssr'

// vars:
// --n-bezier
// --n-font-family
// --n-font-size
// --n-text-color
// --n-border-radius
// --n-tools-color
// --n-tools-border-color
// --n-tools-box-shadow
// --n-outline-color
export default c([
  cB(
    'panel',
    `
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      position: relative;
      font-family: var(--n-font-family);
      transform: translate(var(--n-panel-x, 0px), var(--n-panel-y, 0px)) scale(var(--n-panel-scale, 1));
      transition: transform .25s var(--n-bezier);
    `,
    [
      cM(
        'floating',
        `
          position: absolute;
        `
      ),
      cM(
        'scale-as-size',
        `
          transform: translate(var(--n-panel-x, 0px), var(--n-panel-y, 0px));
        `
      ),
      cM(
        'dragging',
        `
          transition: none;
        `
      ),
      cM(
        'operating',
        `
          z-index: 60;
          cursor: move;
          user-select: none;
        `
      ),
      cM(
        'outlined',
        `
          outline: 1px dashed var(--n-outline-color);
          outline-offset: 2px;
        `
      ),
      cB(
        'panel-tools',
        `
          box-sizing: border-box;
          position: absolute;
          top: 0;
          left: 50%;
          transform: translateX(-50%);
          z-index: 1;
          display: flex;
          align-items: center;
          gap: 2px;
          padding: 2px 4px;
          background-color: var(--n-tools-color);
          border: 1px solid var(--n-tools-border-color);
          border-radius: var(--n-border-radius);
          box-shadow: var(--n-tools-box-shadow);
          color: var(--n-text-color);
          font-size: var(--n-font-size);
          white-space: nowrap;
        `,
        [
          cE(
            'title',
            `
              padding: 0 4px;
              font-size: var(--n-font-size);
            `
          ),
          cE(
            'value',
            `
              padding: 0 2px;
              font-size: var(--n-font-size);
              font-variant-numeric: tabular-nums;
            `
          )
        ]
      )
    ]
  ),
  cB(
    'panel-chip',
    `
      cursor: pointer;
      user-select: none;
    `
  )
])
