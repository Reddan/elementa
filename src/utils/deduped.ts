import hash from "object-hash"
import {zip} from "./utils"

export const dedupedBatch = <T, U>(callback: (inputs: T[]) => Promise<U[]>) => {
  type Resolve = (output: U) => void
  type Reject = (reason?: any) => void
  let handleBulkTimeout: number
  let inputByHash: Record<string, T> = {}
  const onOutputByHash: Record<string, [Resolve, Reject][]> = {}
  const outputByHash: Record<string, U> = {}

  return (input: T) => new Promise<U>((resolve, reject) => {
    const valueHash = hash(input ?? null)
    if (Object.hasOwn(outputByHash, valueHash)) {
      return resolve(outputByHash[valueHash]!)
    }
    if (!onOutputByHash[valueHash]) {
      inputByHash[valueHash] = input
      clearTimeout(handleBulkTimeout)
      handleBulkTimeout = window.setTimeout(() => {
        const hashes = Object.keys(inputByHash)
        const inputs = hashes.map(valueHash => inputByHash[valueHash]!)
        inputByHash = {}
        void callback(inputs).then(outputs => {
          for (const [valueHash, output] of zip(hashes, outputs)) {
            if (output) {
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
      })
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
