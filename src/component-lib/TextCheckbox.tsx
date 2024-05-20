import {JSX} from "solid-js"
import {styled} from "solid-styled-components"
import {Checkbox} from "./Checkbox"

const CheckboxContainer = styled.div<{disabled: boolean}>(props => `
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  user-select: none;
  ${!props.disabled ? `
    cursor: pointer;
    &:hover > :nth-of-type(1) {
      background: rgba(0, 0, 0, 0.1);
    }
  ` : ""}
`)

export function TextCheckbox(
  props: {
    checked: boolean
    onChange: (checked: boolean) => void
    disabled?: boolean
    class?: string
    children: JSX.Element
  },
) {
  const disabled = () => props.disabled ?? false
  return (
    <CheckboxContainer class={props.class} disabled={disabled()} onClick={disabled() ? undefined : () => props.onChange(!props.checked)}>
      <Checkbox disabled={disabled()} checked={props.checked} />
      {props.children}
    </CheckboxContainer>
  )
}
