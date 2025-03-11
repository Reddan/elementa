export class Emitter<T> {
  subscribers: Set<(value: T) => void>

  constructor() {
    this.subscribers = new Set()
  }

  emit(value: T): void {
    this.subscribers.forEach(callback => callback(value))
  }

  listen(callback: (value: T) => void): () => void {
    this.subscribers.add(callback)
    return () => {
      this.subscribers.delete(callback)
    }
  }
}

export class EmitterVariable<T> {
  emitter: Emitter<T>

  constructor(public value: T) {
    this.emitter = new Emitter<T>()
  }

  set(value: T): void {
    if (value !== this.value) {
      this.value = value
      this.emitter.emit(value)
    }
  }

  listen(callback: (value: T) => void): () => void {
    return this.emitter.listen(callback)
  }
}
