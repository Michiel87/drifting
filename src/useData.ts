import { useState, useEffect, useMemo } from 'react'
import produce, { Draft } from 'immer'

type AnyFunction = (...args: any[]) => any

type Slice<T extends AnyFunction> = T extends (...args: any[]) => infer R
  ? R
  : never

type UpdateCb<G> = (args: Draft<G>) => G|void|undefined

function createReturnedTuple<G> (nextState: G, updater: (cb: UpdateCb<G>) => void) {
  return <T extends (slice: G) => any>(selector: T) => {
    const slicedNextState: Slice<T> = selector(nextState)
    const slicedUpdater = (cb: UpdateCb<Slice<T>>) => updater((state) => cb(selector(state as G)))

    return [
      slicedNextState,
      {
        update: slicedUpdater,
        select: createReturnedTuple<Slice<T>>(slicedNextState, slicedUpdater)
      }
    ] as const
  }
}

type Data = (Record<string, unknown>|Record<string, unknown>[])

export function useData<T extends Data = Record<string, unknown>> (data: T) {
  const [nextDataState, setDataState] = useState<T>(data)

  useEffect(() => {
    setDataState(data)
  }, [data])

  return useMemo(() => {
    return createReturnedTuple(
      nextDataState, 
      (updater) => void (setDataState(produce(nextDataState, updater) as T))
    )(data => data)
  }, [nextDataState])
}
