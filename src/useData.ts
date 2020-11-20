import { useState, useEffect, useMemo } from 'react'
import produce, { Draft } from 'immer'

import { entity, CollectionOperator, RecordOperator } from './entity'

type Operator<T extends AnyFunction> = T extends (...args: any[]) => infer R
? R extends any[] 
  ? CollectionOperator<R>
  : RecordOperator<R>
: never

type AnyFunction = (...args: any[]) => any

export function useData<
  T extends (Record<string, any>|Record<string, any>[]) = Record<string, any>
> (record: T) {
  const [nextState, setState] = useState<T>(record)

  useEffect(() => {
    setState(record)
  }, [record])

  function draft (drafter: (args: Draft<T>) => void) {
    setState(produce(nextState, drafter))
  }

  return useMemo(() => [
    nextState,
    {
      entity,
      sliceEntity: <G extends (record: Draft<T>) => void>(slice: G) => (
        cb: (operator: Operator<G>) => void
      ) => draft((draft) => cb(entity(slice(draft)) as Operator<G>)),
      draft 
    }
  ] as const, [nextState])
}

