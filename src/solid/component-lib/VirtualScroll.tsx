import {children, createMemo, createSignal, For, JSX} from "solid-js"
import {List} from "@solid-primitives/list"
import equals from "fast-deep-equal"
import {isFunction, range} from "~/utils"

type Arrayable<T> = T | T[]

type ChildProps = {
  index: () => number
  style: () => {top: string, height: string}
}

type Child = JSX.Element | ((props: ChildProps) => JSX.Element)

export function VirtualScroll(
  props: {
    height: number
    itemSize: number
    offset?: number
    itemCount: number
    children: Arrayable<Child>
  },
) {
  const [scrollPos, setScrollPos] = createSignal(0)
  const childs = children(() => props.children as JSX.Element).toArray as () => Child[]
  const offset = () => props.offset ?? 0

  const extent = createMemo(() => {
    const start = Math.min(Math.floor(scrollPos() / props.itemSize), props.itemCount)
    const numVisible = Math.ceil(props.height / props.itemSize)
    const end = Math.min(start + numVisible, props.itemCount)
    return [start, end] as const
  }, null, {equals})

  return (
    <div
      onScroll={evt => setScrollPos(evt.target.scrollTop)}
      style={{position: "relative", width: "100%", height: `${props.height}px`, overflow: "scroll"}}
      children={(
        <div style={{width: "100%", height: `${props.itemCount * props.itemSize + offset()}px`}}>
          <For each={childs()}>
            {child => {
              if (!isFunction(child)) {
                return child
              }

              // NOTE: <List> could be more effective by simply preserving the initial order of child elements as it doesn't matter where in the DOM they are placed.
              // That way, the only changes occurs to elements going in and out of the viewport.
              return (
                <List each={range(...extent())}>
                  {index => {
                    const style = () => ({
                      position: "absolute",
                      top: `${index() * props.itemSize + offset()}px`,
                      height: `${props.itemSize}px`,
                    })
                    return child({index, style})
                  }}
                </List>
              )
            }}
          </For>
        </div>
      )}
    />
  )
}
