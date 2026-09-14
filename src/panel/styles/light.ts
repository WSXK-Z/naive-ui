import type { ExtractThemeOverrides, Theme } from '../../_mixins'
import type { ThemeCommonVars } from '../../_styles/common'
import { commonLight } from '../../_styles/common'

export function self(vars: ThemeCommonVars) {
  const {
    textColor2,
    cardColor,
    borderColor,
    borderRadius,
    boxShadow1,
    fontSizeSmall,
    fontFamily,
    primaryColor
  } = vars
  return {
    textColor: textColor2,
    fontFamily,
    fontSize: fontSizeSmall,
    borderRadius,
    toolsColor: cardColor,
    toolsBorderColor: borderColor,
    toolsBoxShadow: boxShadow1,
    outlineColor: primaryColor
  }
}

export interface PanelThemeVars extends ReturnType<typeof self> {}

const panelLight: PanelTheme = {
  name: 'Panel',
  common: commonLight,
  self
}

export interface PanelTheme extends Theme<'Panel', PanelThemeVars> {}

export interface PanelThemeOverrides extends ExtractThemeOverrides<PanelTheme> {}

export default panelLight
