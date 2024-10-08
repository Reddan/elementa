import {createMemo, JSX, Show} from "solid-js"
import {css, removeValue, unwrap} from "~/utils"
import {ListItems} from "./ListItems"
import {SimplePopover} from "./Popover"

export type MenuEntry<T> = {
  label: string
  disabled?: boolean
  hidden?: boolean
  onSelect: (items: T[]) => void
  icon?: JSX.Element
}

export function ContextMenu<T>(
  props: {
    children: JSX.Element
    self?: T
    other?: T[]
    entries: MenuEntry<T>[] | (() => MenuEntry<T>[])
  },
) {
  const entries = createMemo(() => unwrap(props.entries).filter(entry => !entry.hidden))

  return (
    <Show when={entries().length > 0} fallback={props.children}>
      <SimplePopover
        {...css({padding: "10px 0"})}
        triggerType="contextmenu"
        placement="initial-mouse"
        children={props.children}
        content={({close}) => (
          <ListItems
            items={
              entries().map((entry, i) => {
                return {
                  value: i,
                  label: entry.label,
                  disabled: entry.disabled,
                  icon: entry.icon,
                }
              })
            }
            onChange={index => {
              const {self = undefined as T, other = []} = props
              const items = other.includes(self) ? [self, ...removeValue(other, self)] : [self]
              entries()[index]!.onSelect(items)
              close()
            }}
          />
        )}
      />
    </Show>
  )
}
