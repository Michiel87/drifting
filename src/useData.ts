import { useState, useEffect, useMemo } from 'react'
import produce, { Draft } from 'immer'

type AnyFunction = (...args: any[]) => any

type Slice<T extends AnyFunction> = T extends (...args: any[]) => infer R
  ? R
  : never

type Updater<G> = (args: Draft<G>) => void|G|undefined

function createSelect<G> (nextState: G, updater: (cb: Updater<G>) => void) {
  return <T extends (slice: G) => any>(selector: T) => {
    const slicedNextState: Slice<T> = selector(nextState)
    const slicedUpdater = (cb: Updater<Slice<T>>) => updater((state) => cb(selector(state as G)))

    return [
      slicedNextState,
      {
        update: slicedUpdater,
        select: createSelect<Slice<T>>(slicedNextState, slicedUpdater)
      }
    ] as const
  }
}

type Data = (Record<string, unknown>|Record<string, unknown>[])

export function useData<T extends Data = Record<string, unknown>> (record: T) {
  const [nextState, setState] = useState<T>(record)

  useEffect(() => {
    setState(record)
  }, [record])

  return useMemo(() => {
    function updater (updater: (args: Draft<T>) => void) {
      setState(produce(nextState, updater))
    }

    return [
      nextState,
      {
        update: updater,
        select: createSelect(nextState, updater)
      }
    ] as const
  }, [nextState])
}
