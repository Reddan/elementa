import {css as cssInner, StylesArg} from "solid-styled-components"
import {StandardProperties} from "csstype"

type NumPropNames = "height"
  | "width"
  | "minHeight"
  | "minWidth"
  | "maxHeight"
  | "maxWidth"
  | "margin"
  | "marginTop"
  | "marginRight"
  | "marginBottom"
  | "marginLeft"
  | "padding"
  | "paddingTop"
  | "paddingRight"
  | "paddingBottom"
  | "paddingLeft"
  | "fontSize"
  | "lineHeight"
  | "letterSpacing"
  | "gap"
  | "borderRadius"
  | "borderWidth"
  | "borderLeftWidth"
  | "borderRightWidth"
  | "borderTopWidth"
  | "borderBottomWidth"
  | "insert"
  | "top"
  | "right"
  | "bottom"
  | "left"

type NumProps = {[K in NumPropNames]?: number | string}

type ClassName = string

export type CSSStyle = Omit<StandardProperties, NumPropNames> | NumProps | {[x: string]: CSSStyle}

function convertStyle(style: CSSStyle): StylesArg {
  const convertedStyle = Object.entries(style!).map(([key, value]) => {
    const hyphenKey = key.replace(/[A-Z]/g, x => "-" + x.toLowerCase())
    const convertedKey = typeof value === "object" ? key : hyphenKey
    const convertedValue = hyphenKey === "font-weight" ? String(value)
      : typeof value === "object" ? convertStyle(value)
        : typeof value === "number" ? `${value}px`
          : value
    return [convertedKey, convertedValue]
  })
  return Object.fromEntries(convertedStyle)
}

export function css(...styles: (ClassName | CSSStyle | undefined)[]) {
  const classNames = styles.filter(x => x).map(style => {
    return typeof style === "string" ? style : cssInner(convertStyle(style!))
  })

  return {class: classNames.join(" ")}
}
