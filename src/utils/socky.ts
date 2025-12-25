import {Emitter} from "./emitter"

export class Socky {
  socket!: WebSocket
  openEmitter = new Emitter<Event>()
  errorEmitter = new Emitter<Event>()
  closeEmitter = new Emitter<CloseEvent>()
  jsonEmitter = new Emitter<any>()
  blobEmitter = new Emitter<Blob>()
  onOpen = this.openEmitter.listen
  onError = this.errorEmitter.listen
  onClose = this.closeEmitter.listen
  onJSON = this.jsonEmitter.listen
  onBlob = this.blobEmitter.listen

  constructor(public endpoint: string) {
    this.connect()
    this.onClose(event => {
      if (!event.wasClean) {
        this.connect()
      }
    })
  }

  connect() {
    this.socket?.close()
    this.socket = new WebSocket(this.endpoint)

    this.socket.addEventListener("open", this.openEmitter.emit)
    this.socket.addEventListener("error", this.errorEmitter.emit)
    this.socket.addEventListener("close", this.closeEmitter.emit)

    this.socket.addEventListener("message", evt => {
      if (typeof evt.data === "string") {
        this.jsonEmitter.emit(JSON.parse(evt.data))
      } else if (evt.data instanceof Blob) {
        this.blobEmitter.emit(evt.data)
      }
    })
  }

  close = (): void => {
    this.socket.close()
  }

  connected(): boolean {
    return this.socket.readyState === WebSocket.OPEN
  }

  send(data: any): void {
    const json = JSON.stringify(data)
    if (this.socket.readyState !== WebSocket.CONNECTING) {
      return this.socket.send(json)
    }
    this.openEmitter.wait().then(() => this.socket.send(json))
  }
}
