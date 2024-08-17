import {createMemo} from "solid-js"
import {styled} from "solid-styled-components"
import {ListItems, PopoverPlacement, SimplePopover} from "~/component-lib"
import {css} from "~/utils"

const Input = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  border-radius: 4px;
  padding: 10px;
  background: #f5f5f5;
  font-size: 13px;
  color: #000;
  font-weight: 500;
  cursor: pointer;
  user-select: none;
`

const ArrowDown = styled.div`
  width: 0;
  height: 0;
  margin-left: 10px;
  border-left: 4px solid transparent;
  border-right: 4px solid transparent;
  border-top: 5px solid #000;
`

export function Dropdown<T>(
  props: {
    value: T
    options: readonly T[]
    aliases?: string[]
    onChange: (value: T) => void
    class?: string
    placement?: PopoverPlacement
  },
) {
  const stringAliases = createMemo(() => props.aliases ?? props.options.map(String))
  const currentAlias = () => stringAliases()[props.options.indexOf(props.value)]

  return (
    <SimplePopover
      placement={props.placement ?? "bottom"}
      inheritWidth
      triggerType="mousedown"
      {...css({padding: "10px 0"})}
      children={(
        <Input class={(props.class ?? "") + " input"}>
          <span>{currentAlias() || "Invalid value"}</span>
          <ArrowDown />
        </Input>
      )}
      content={({close}) => (
        <ListItems
          selected={[props.value]}
          items={props.options.map((option, i) => ({value: option, label: stringAliases()[i]!}))}
          {...css({userSelect: "none", overflowY: "scroll"})}
          class={(props.class ?? "") + " list-items"}
          onChange={option => {
            props.onChange(option)
            close()
          }}
        />
      )}
    />
  )
}
