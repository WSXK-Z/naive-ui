import { cB, cM } from '../../../_utils/cssr'

export default cB(
  'page',
  `
    box-sizing: border-box;
    position: relative;
    width: 100%;
    height: 100%;
    overflow: hidden;
  `,
  [
    cB(
      'page-anchors',
      `
        position: absolute;
        left: 0;
        right: 0;
        top: 0;
        bottom: 0;
        z-index: 30;
        pointer-events: none;
      `,
      [
        cM('horizontal', [cB('page-anchor', 'flex-direction: row;')]),
        cM('wrap', [
          cB(
            'page-anchor',
            `
              flex-wrap: wrap;
              max-width: 100%;
            `
          )
        ])
      ]
    ),
    cB(
      'page-anchor',
      `
        box-sizing: border-box;
        position: absolute;
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        gap: var(--n-page-anchor-gap, 10px);
        pointer-events: auto;
      `,
      [
        cM(
          'top-left',
          `
            top: 0;
            left: 0;
          `
        ),
        cM(
          'top-center',
          `
            top: 0;
            left: 50%;
            transform: translateX(-50%);
            align-items: center;
          `
        ),
        cM(
          'top-right',
          `
            top: 0;
            right: 0;
            align-items: flex-end;
          `
        ),
        cM(
          'center',
          `
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            align-items: center;
          `
        ),
        cM(
          'bottom-left',
          `
            bottom: 0;
            left: 0;
          `
        ),
        cM(
          'bottom-center',
          `
            bottom: 0;
            left: 50%;
            transform: translateX(-50%);
            align-items: center;
          `
        ),
        cM(
          'bottom-right',
          `
            bottom: 0;
            right: 0;
            align-items: flex-end;
          `
        )
      ]
    )
  ]
)
