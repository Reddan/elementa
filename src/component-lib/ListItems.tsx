import {Index, JSX} from "solid-js"
import {styled} from "solid-styled-components"

export type ListEntry<T> = {
  value: T
  label: string
  disabled?: boolean
  icon?: JSX.Element
}

export const Selectable = styled.button<{selected?: boolean, disabled?: boolean}>(props => `
  display: flex;
  align-items: center;
  gap: 16px;
  background: none;
  border: none;
  width: 100%;
  font-weight: 600;
  padding: 10px 20px;
  font-size: 13px;
  text-align: left;
  color: ${props.selected ? "#000" : "#545454"};
  font-weight: ${props.selected ? "bold" : "inherit"};
  border-bottom: 1px solid #f5f5f5;
  cursor: pointer;
  user-select: none;
  opacity: ${props.disabled ? "0.5" : "1"};
  &:last-child {
    border-bottom: none;
  }
  &:hover {
    ${props.disabled ? "" : "background: #f5f5f5;"}
  }
`)

export function ListItems<T>(
  props: {
    items: ListEntry<T>[]
    selected?: T[]
    onChange: (value: T) => void
    class?: string
  },
) {
  return (
    <div class={props.class}>
      <Index each={props.items}>
        {item => (
          <Selectable
            disabled={item().disabled}
            selected={(props.selected ?? []).includes(item().value)}
            onMouseUp={() => props.onChange(item().value)}
            children={[
              item().icon,
              item().label ?? String(item().value),
            ]}
          />
        )}
      </Index>
    </div>
  )
}
