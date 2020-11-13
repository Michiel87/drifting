import { useState, useEffect, createContext, useContext, useMemo } from 'react'
import produce, { Draft } from 'immer'

import { relationship, CollectionOperator, RecordOperator } from './operations'

type DeepPartial<T> = {
  [P in keyof T]?: DeepPartial<T[P]>
}

type Extensions<T> = ({
  drifting,
  initialState,
  nextState
}: {
  drifting: (draft: Draft<T>) => void
  initialState: T
  nextState: T
}) => Record<string, any>

const DRIFTER_CTX = createContext((() => ({
  save: 'here i am'
})) as Extensions<any>)

export function useRecord<T extends Record<string, any>> (record: T) {
  const extensions = useContext(DRIFTER_CTX)
  const [nextState, setState] = useState<T>(record)

  useEffect(() => {
    setState(record)
  }, [record])

  function drifting (drafter: (args: Draft<T>) => void) {
    setState(produce(nextState, drafter))
  }

  return useMemo(() => [
    nextState,
    {
      ...extensions({ drifting, initialState: record, nextState }), 
      draft: drifting,
      slice: <G extends (record: T) => any>(fn: G) => (record: T) => relationship(fn(record)) as Returner<G> 
    }
  ] as const, [nextState, extensions])
}

type Returner<T extends AnyFunction> = T extends (...args: any[]) => infer R
? R extends any[] 
  ? CollectionOperator<R>
  : RecordOperator<R>
: never

type AnyFunction = (...args: any[]) => any
