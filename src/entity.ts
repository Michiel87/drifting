import { Draft } from 'immer'

function copy<T extends Record<string, any>> (obj1: T, obj2: T) {
  for (let key in obj1) {
    obj1[key] = obj2[key]
  }
}

export class RecordOperator<T extends Record<string, any>> {
  target: T

  constructor (target: T) {
    this.target = target
  }

  /**
   * 
   * @description Replace entire record
   * @example entity(record.info)
   *   .replace({ ...newRecord })
   */
  replace (record: T) {
    this.target && copy(this.target, record)
    return this
  }

  /**
   * 
   * @description Update properties, you can perform multiple expressions.
   * @example entity(record.info)
   *   .draft(info => void (info.follow = [])
   */
  draft (cb: (record: T) => void) {
    this.target && cb(this.target)
  }
}

type InferTypeFromArray<T> = T extends (infer U)[]? U : never

type Predicate<T> = (record: InferTypeFromArray<T>) => boolean

export class CollectionOperator<T extends any[]> {
  target: T

  constructor (target: T) {
    this.target = target
  }

  /**
   * 
   * @description Add items to collection
   * @example entity(record.collection)
   *   .add(
   *     { id: '10', type: 'company' },
   *     { id: '11', type: 'company' },
   *   )
   */
  add (...record: InferTypeFromArray<T>[]) {
    this.target.push(...record)
    return this
  }

  /**
   * 
   * @description Remove items from collection through predicates
   * @example entity(record.collection)
   *   .remove(
   *     (item) => item.id === id,
   *     (item) => item.type === 'company'
   *   )
   */
  remove (...predicates: Predicate<T>[]) {
    const queue = this.target.reduce((matches, next, index) => {
      // collect indexes from big to small
      predicates.some(predicate => predicate(next)) && matches.unshift(index)
      return matches
    }, [])

    // delete indexes from big to small
    queue.forEach(index => this.target.splice(index, 1))

    return this
  }

  /**
   * 
   * @description Selects item from collection with a single predicate
   * @example entity(record.collection)
   *   .select((item) => item.id === id)
   *   .replace({ id: '12', type: 'company' })
   */
  select (predicate: Predicate<T>) {
    return new RecordOperator<InferTypeFromArray<T>>(this.target.find(predicate))
  }
}

class Performer<T> {
  target: T

  constructor (target: T) {
    this.target = target
  }

  execute () {
    if (Array.isArray(this.target)) {
      return new CollectionOperator(this.target)
    } else {
      return new RecordOperator(this.target)
    }
  }
}

export function entity<T extends any[]> (target: T): CollectionOperator<T>
export function entity<T> (target: T): RecordOperator<T>
export function entity<T> (target: T): any {
  return new Performer(target).execute()
}

export function sliceSelector<T extends Record<string, any>> (selector: (model: T) => Draft<T>) {
  return (record: T) => entity(selector(record))
}
