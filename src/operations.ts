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
   * @param record 
   * @description Replace selected record
   */
  replace (record: T) {
    copy(this.target, record)
    return this
  }

  /**
   * 
   * @description Replace selected record
   * @example relationship(record.attributes.info).draft(info => void (info.follow = [])
   */
  draft (cb: (record: T) => void) {
    cb(this.target)
  }
}

export class CollectionOperator<T extends any[]> {
  target: T

  constructor (target: T) {
    this.target = target
  }

  removeId (id: string) {
    this.target = this.target.filter(record => record.id !== id) as T
    return this
  }

  add (record: T extends (infer U)[]? U : never) {
    this.target.push(record)
    return this
  }

  select (selector: any) {
    return new RecordOperator(this.target.find(selector))
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

export function relationship<T extends any[]> (target: T): CollectionOperator<T>
export function relationship<T> (target: T): RecordOperator<T>
export function relationship<T> (target: T): any {
  return new Performer(target).execute()
}

export function sliceSelector<T extends Record<string, any>> (selector: (model: T) => Draft<T>) {
  return (record: T) => relationship(selector(record))
}