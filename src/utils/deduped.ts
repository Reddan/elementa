import hash from "object-hash"
import {zip} from "./utils"

type Options = {
  cache?: boolean
  size?: number
  timeout?: number
}

export const dedupedBatch = <T, U>(callback: (inputs: T[]) => Promise<U[]>, options: Options = {}) => {
  type Resolve = (output: U) => void
  type Reject = (reason?: any) => void
  const {cache = false, size, timeout} = options
  const inputByHash = new Map<string, T>()
  const onOutputByHash: Record<string, [Resolve, Reject][]> = {}
  const outputByHash: Record<string, U> = {}
  let handleBulkTimeout: number

  return (input: T) => new Promise<U>((resolve, reject) => {
    const valueHash = hash(input ?? null)
    if (Object.hasOwn(outputByHash, valueHash)) {
      return resolve(outputByHash[valueHash]!)
    }
    if (!onOutputByHash[valueHash]) {
      inputByHash.set(valueHash, input)
      clearTimeout(handleBulkTimeout)
      const hashes = inputByHash.keys().toArray()
      const inputs = inputByHash.values().toArray()
      handleBulkTimeout = setTimeout(() => {
        hashes.forEach(valueHash => inputByHash.delete(valueHash))
        void callback(inputs).then(outputs => {
          for (const [valueHash, output] of zip(hashes, outputs)) {
            if (cache) {
              outputByHash[valueHash] = output
            }
            onOutputByHash[valueHash]!.forEach(([resolve]) => resolve(output))
            delete onOutputByHash[valueHash]
          }
        }).catch(err => {
          for (const valueHash of hashes) {
            onOutputByHash[valueHash]!.forEach(([, reject]) => reject(err))
            delete onOutputByHash[valueHash]
          }
        })
      }, timeout)
      if (size && inputByHash.size === size) {
        handleBulkTimeout = 0
        inputByHash.clear()
      }
      onOutputByHash[valueHash] = []
    }
    onOutputByHash[valueHash]!.push([resolve, reject])
  })
}

export const deduped = <T extends any[], U>(callback: (...input: T) => Promise<U>) => {
  type Resolve = (output: U) => void
  type Reject = (reason?: any) => void
  const onOutputByHash: Record<string, [Resolve, Reject][]> = {}
  const outputByHash: Record<string, U> = {}

  return (...input: T) => new Promise<U>((resolve, reject) => {
    const valueHash = hash(input)
    if (Object.hasOwn(outputByHash, valueHash)) {
      return resolve(outputByHash[valueHash]!)
    }
    if (!onOutputByHash[valueHash]) {
      callback(...input).then(output => {
        outputByHash[valueHash] = output
        onOutputByHash[valueHash]!.forEach(([resolve]) => resolve(output))
        delete onOutputByHash[valueHash]
      }).catch(err => {
        onOutputByHash[valueHash]!.forEach(([, reject]) => reject(err))
        delete onOutputByHash[valueHash]
      })
      onOutputByHash[valueHash] = []
    }
    onOutputByHash[valueHash]!.push([resolve, reject])
  })
}
