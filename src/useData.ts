import { useState, useEffect, useMemo } from 'react'
import produce, { Draft } from 'immer'

type AnyFunction = (...args: any[]) => any

type Slice<T extends AnyFunction> = T extends (...args: any[]) => infer R
  ? R
  : never

type UpdateCb<G> = (args: Draft<G>) => G|void|undefined

function createReturnedTuple<G> (nextState: G, updateFn: (cb: UpdateCb<G>) => void) {
  return <T extends (slice: G) => any>(getSelected: T) => {
    const slicedNextState: Slice<T> = getSelected(nextState)
    
    const update = (updateSelected: UpdateCb<Slice<T>>) => (
      updateFn((state) => updateSelected(getSelected(state as G)))
    )

    return [
      slicedNextState,
      {
        update,
        select: createReturnedTuple<Slice<T>>(slicedNextState, update)
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
