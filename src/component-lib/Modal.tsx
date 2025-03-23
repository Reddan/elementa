import {createEffect, JSX, Show} from "solid-js"
import {Portal} from "solid-js/web"
import {keyframes, styled} from "solid-styled-components"
import {useKeyPress} from "~/hook-lib"

const portalElem = document.getElementById("portal-root")!

const fadeIn = keyframes`
  0% {opacity: 0;}
  100% {opacity: 1;}
`

const slideIn = keyframes`
  0% {transform: translate3d(0px, 100px, 0px);}
  100% {transform: translate3d(0px, 0px, 0px);}
`

const ModalContainer = styled.div`
  display: grid;
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  width: 100vw;
  padding: 20px 0;
  z-index: 4;
  justify-content: center;
  align-items: center;
  overflow: scroll;
  background: rgba(0, 0, 0, 0.4);
  animation: ${fadeIn} 150ms;
`

const ModalBody = styled.div`
  position: relative;
  box-sizing: border-box;
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  background: #fff;
  box-shadow: 0 1px 45px 0 rgba(137, 137, 137, 0.16);
  padding: 30px;
  width: 800px;
  max-width: calc(100vw - 40px);
  animation: ${slideIn} 150ms;
`

type CloseBy = "click" | "escape"

export function Modal(
  props: {
    when?: boolean
    children: JSX.Element
    class?: string
    containerClass?: string
    onClose?: () => void
    closeBy?: CloseBy[]
    style?: JSX.CSSProperties
  },
) {
  const closeBy = () => props.closeBy ?? ["click", "escape"]

  createEffect(() => {
    if (props.when && props.onClose && closeBy().includes("escape")) {
      useKeyPress("Escape", props.onClose, {stopPropagation: true})
    }
  })

  return (
    <Show when={props.when ?? true}>
      <Portal mount={portalElem}>
        <ModalContainer
          class={props.containerClass}
          onMouseDown={evt => evt.target === evt.currentTarget && closeBy().includes("click") && props.onClose?.()}
        >
          <ModalBody class={props.class} style={props.style}>
            {props.children}
          </ModalBody>
        </ModalContainer>
      </Portal>
    </Show>
  )
}
