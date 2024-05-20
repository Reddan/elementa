import {createMemo} from "solid-js"
import {keyframes, styled} from "solid-styled-components"

const shrinkBounce = keyframes`
  0% {transform: scale(1);}
  33% {transform: scale(.85);}
  100% {transform: scale(1);}
`

const checkboxCheck = keyframes`
  0% {
    width: 0;
    height: 0;
    border-color: #2e89ff;
    transform: translate3d(0, 0, 0) rotate(45deg);
  }
  33% {
    width: .2em;
    height: 0;
    transform: translate3d(0, 0, 0) rotate(45deg);
  }
  100% {
    width: .2em;
    height: .5em;
    border-color: #2e89ff;
    transform: translate3d(0, -0.5em, 0) rotate(45deg);
  }
`

const Input = styled.div<{still: boolean, checked: boolean, disabled: boolean}>(props => `
  font-size: 20px;
  height: 20px;
  width: 20px;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  background: transparent;
  border: 2px solid rgba(0, 0, 0, 0.2);
  border-radius: 4px;
  transition: background 200ms, border 250ms;

  ${props.disabled ? `
    opacity: 0.5;
  ` : `
    cursor: pointer;
    &:hover {
      transition: border 250ms;
      background: rgba(0, 0, 0, 0.1);
    }
  `}

  ${props.checked ? `
    border: .5em solid rgba(46, 137, 255, 0.2);
    animation: ${shrinkBounce} ${props.still ? "0ms" : "200ms"};
    &::before {
      content: "";
      position: absolute;
      box-sizing: content-box;
      top: -2px;
      left: -7px;
      border-right: 3px solid transparent;
      border-bottom: 3px solid transparent;
      transform: rotate(45deg);
      transform-origin: 0% 100%;
      animation: ${checkboxCheck} ${props.still ? "0ms" : "125ms"} ${props.still ? "0ms" : "250ms"} forwards;
    }
  ` : ""}
`)

export function Checkbox(
  props: {
    checked: boolean
    disabled?: boolean
    onChange?: (checked: boolean) => void
    class?: string
  },
) {
  const still = createMemo<boolean>(prev => prev && props.checked, props.checked)

  return (
    <Input
      still={still()}
      checked={props.checked}
      disabled={props.disabled ?? false}
      onClick={() => !props.disabled && props.onChange?.(!props.checked)}
      class={props.class}
    />
  )
}
