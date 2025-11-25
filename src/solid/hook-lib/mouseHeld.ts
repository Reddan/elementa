import {createSignal} from "solid-js"

const [mouseHeld, setMouseHeld] = createSignal(false)

window.addEventListener("mousedown", () => setMouseHeld(true))
window.addEventListener("mouseup", () => setMouseHeld(false))
window.addEventListener("blur", () => setMouseHeld(false))

export {mouseHeld}
