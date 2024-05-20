import {css as cssInner} from "solid-styled-components"
import {Properties, StandardProperties} from "csstype"
import {getEntries} from "./utils"

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

// NOTE: `Properties` includes svg properties as well as HTML properties
type Style = Omit<StandardProperties, NumPropNames> | NumProps | {[x: string]: Style}

export function css(...styles: (ClassName | Style | undefined)[]) {
  const className = styles.filter(x => x).map(style => {
    if (typeof style === "string") return style
    const newStyle = getEntries(style as any).map(([key, value]) => {
      // TODO: recursive
      const hyphenKey = (key as any).replace(/[A-Z]/g, (x: any) => "-" + x.toLowerCase())
      const stringValue = typeof value === "number" ? value + "px" : value
      return [hyphenKey, stringValue]
    })
    return cssInner(Object.fromEntries(newStyle))
  }).join(" ")
  return {class: className}
}
