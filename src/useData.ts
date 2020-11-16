import { useState, useEffect, useContext, useMemo } from 'react'
import produce, { Draft } from 'immer'

import { entity, CollectionOperator, RecordOperator } from './entity'
import { DRIFTER_CTX } from './context'

export type ExtensionsPopulator<
T extends Record<string, any>,
Extensions extends Record<string, any>
> = ({
  draft,
  initialState,
  nextState
}: {
  draft: (drafter: (draft: Draft<T>) => void) => void
  initialState: T
  nextState: T
}) => Extensions

type Operator<T extends AnyFunction> = T extends (...args: any[]) => infer R
? R extends any[] 
  ? CollectionOperator<R>
  : RecordOperator<R>
: never

type AnyFunction = (...args: any[]) => any

export function useData<
Extensions extends Record<string, any> = {},
T extends (Record<string, any>|Record<string, any>[]) = Record<string, any>
> (record: T) {
  const extensions = useContext(DRIFTER_CTX) as ExtensionsPopulator<T, Extensions> 
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
      sliceEntity: <G extends (record: T) => any>(fn: G) => entity(fn(record)) as Operator<G>,
      draft,
      ...extensions({ draft, initialState: record, nextState }), 
    }
  ] as const, [nextState, extensions])
}
