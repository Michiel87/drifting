import { renderHook, act } from '@testing-library/react-hooks'

import { useData } from '..'

const record = {
  type: 'user',
  id: '120',
  attributes: {
    name: 'someone',
    company: 'exivity'
  },
  relationships: {
    revision: { 
      id: '10', 
      type: 'revision', 
      attributes: { 
        name: 'revision-1' 
      } 
    },
    budgets: [
      { id: '10', type: 'budget', attributes: { threshold: 10 } },
      { id: '11', type: 'budget', attributes: { threshold: 11 } },
      { 
        id: '12', 
        type: 'budget', 
        attributes: {
          threshold: 12
       },
        relationships: {
          budgetitems: { 
            id: '10', 
            attributes: { 
              rate: 10 
            } 
          }
        } 
      }
    ]
  }
} 

describe('useData', () => {
  it('should update properties', () => {
    const { result } = renderHook(() => useData(record))

    act(() => {
      result.current[1].draft((user) => {
        user.attributes = { name: 'independent', company: 'defiance' }
      })
    })

    expect(result.current[0].attributes)
    .toEqual({ name: 'independent', company: 'defiance' })
  })

  it('should allow multiple property updates', () => {
    const { result } = renderHook(() => useData(record))

    act(() => {
      const [, controller] = result.current

      controller.draft(user => {
        user.attributes.name = 'new-name'
        user.relationships.revision.attributes.name = 'new-name'
      })
    })

    expect(result.current[0].attributes.name).toBe('new-name')
    expect(result.current[0].relationships.revision.attributes.name).toBe('new-name')
  })

  it('should update deeply nested properties', () => {
    const { result } = renderHook(() => useData(record))

    act(() => {
      const [, controller] = result.current

      controller.draft(user => {
        user.relationships.budgets[0].attributes.threshold = 14
      })
    })

    expect(result.current[0].relationships.budgets[0].attributes.threshold).toBe(14)
  })

  
  it('should update entire obj when using return', () => {
    const { result } = renderHook(() => useData(record))

    act(() => {
      const [, controller] = result.current

      controller.draft(user => ({ id: 'replaced', type: user.type }))
    })

    expect(result.current[0]).toEqual({ id: 'replaced', type: 'user' })
  })

  it('should apply changes to new object', () => {
    const reference = { id: '10', type: 'budget' , attributes: { name: 'test' } }
    const { result } = renderHook(() => useData(reference))
 
    act(() => {
      const [, controller] = result.current

      controller.draft(user => {
        user.attributes.name = 'new-name'
      })
    })

    expect(result.current[0] === reference).toBe(false)
    expect(result.current[0]).toEqual({ 
      id: '10', 
      type: 'budget', 
      attributes: { name: 'new-name' } 
    })
    expect(reference).toEqual({
      id: '10', 
      type: 'budget', 
      attributes: { name: 'test' } 
    })
  })

  it('should work with collections', () => {
    const collection = [
      { type: 'budget', id: '1' }
    ]
    const { result } = renderHook(() => useData(collection))
 
    act(() => {
      const [, controller] = result.current

      controller.draft(collection => {
        collection.push({ type: 'budget', id: '2' })
      })
    })

    expect(result.current[0]).toEqual([
      { type: 'budget', id: '1' },
      { type: 'budget', id: '2' },
    ])

  })

  describe('entity - general', () => {
    it('should be able to use multiple entity performers', () => {
      const record = {
        collection: [
          { type: 'budget', id: '1' }
        ],
        anotherCollection: [
          { type: 'revision', id: '1' }
        ]
      }

      const { result } = renderHook(() => useData(record))

      act(() => {
        const [, controller] = result.current

        controller.draft(user => {
          controller.entity(user.collection)
            .add({ type: 'budget', id: '2' })

          controller.entity(user.anotherCollection)
            .add({ type: 'revision', id: '2' })
        })
      })

      expect(result.current[0].collection)
      .toEqual([
        { type: 'budget', id: '1' },
        { type: 'budget', id: '2' }
      ])
      expect(result.current[0].anotherCollection)
      .toEqual([
        { type: 'revision', id: '1' },
        { type: 'revision', id: '2' }
      ])
    })

    it('should be able to chain operations', () => {
      const record = {
        collection: [
          { type: 'budget', id: '1' },
          { type: 'budget', id: '2' }
        ]
      }
      
      const { result } = renderHook(() => useData(record))

      act(() => {
        const [, controller] = result.current

        controller.draft(user => {
          controller.entity(user.collection)
            .remove(
              (record) => record.id === '1',
              (record) => record.id === '2',
            )
            .add({ type: 'budget', id: '2' })
            .select(record => record.id === '2')
            .replace({ type: 'budget', id: '5' })
            .draft(budget => {
              budget.type = 'user'
            })
        })
      })

      expect(result.current[0].collection).toEqual([{ type: 'user', id: '5' }])
    })
  })

  describe('entity - record operations', () => {
    it('should be able to replace entire record', () => {
      const record = {
        user: {
          type: 'user',
          id: '1',
          name: 'Michiel'
        }
      }
      
      const { result } = renderHook(() => useData(record))

      act(() => {
        const [, controller] = result.current

        controller.draft(record => {
          controller.entity(record.user)
            .replace({ type: 'user', id: '4', name: 'Exivity' })
        })
      })

      expect(result.current[0].user).toEqual({ type: 'user', id: '4', name: 'Exivity' })
    })

    it('should be able to draft updates', () => {
      const record = {
        user: {
          type: 'user',
          id: '1',
          name: 'Michiel'
        }
      }
      
      const { result } = renderHook(() => useData(record))

      act(() => {
        const [, controller] = result.current

        controller.draft(record => {
          controller.entity(record.user)
            .draft(user => void (user.name = 'Exivity', user.id = '4'))
        })
      })

      expect(result.current[0].user).toEqual({ type: 'user', id: '4', name: 'Exivity' })
    })
  })

  describe('entity - collection operations', () => {
    it('should be able to add', () => {
      const record = {
        collection: [
          { type: 'budget', id: '1' }
        ]
      }

      const { result } = renderHook(() => useData(record))

      act(() => {
        const [, controller] = result.current

        controller.draft(user => {
          controller.entity(user.collection)
            .add({ type: 'budget', id: '2' })
        })
      })

      expect(result.current[0].collection).toEqual([
        { type: 'budget', id: '1' },
        { type: 'budget', id: '2' }
      ])
    })

    it('should be able to add multiple', () => {
      const record = {
        collection: [
          { type: 'budget', id: '1' }
        ]
      }

      const { result } = renderHook(() => useData(record))

      act(() => {
        const [, controller] = result.current

        controller.draft(user => {
          controller.entity(user.collection)
            .add(
              { type: 'budget', id: '2' },
              { type: 'budget', id: '3' }
            )
        })
      })

      expect(result.current[0].collection).toEqual([
        { type: 'budget', id: '1' },
        { type: 'budget', id: '2' },
        { type: 'budget', id: '3' }
      ])
    })

    it('should be able to remove', () => {
      const record = {
        collection: [
          { type: 'budget', id: '1' }
        ]
      }
      
      const { result } = renderHook(() => useData(record))

      act(() => {
        const [, controller] = result.current

        controller.draft(user => {
          controller.entity(user.collection)
            .remove((record) => record.id === '1')
        })
      })

      expect(result.current[0].collection).toEqual([])
    })

    it('should be able to remove multiple', () => {
      const record = {
        collection: [
          { type: 'budget', id: '1' },
          { type: 'budget', id: '2' }
        ]
      }
      
      const { result } = renderHook(() => useData(record))

      act(() => {
        const [, controller] = result.current

        controller.draft(user => {
          controller.entity(user.collection)
            .remove((record) => record.type === 'budget')
        })
      })

      expect(result.current[0].collection).toEqual([])
    })

    it('should be able to remove with multiple predicates', () => {
      const record = {
        collection: [
          { type: 'budget', id: '1' },
          { type: 'budget', id: '2' }
        ]
      }
      
      const { result } = renderHook(() => useData(record))

      act(() => {
        const [, controller] = result.current

        controller.draft(user => {
          controller.entity(user.collection)
            .remove(
              (record) => record.id === '1',
              (record) => record.id === '2',
            )
        })
      })

      expect(result.current[0].collection).toEqual([])
    })

    it('should be able to select from array and perform RecordOperations on it', () => {
      const record = {
        collection: [
          { type: 'budget', id: '1', name: 'one' },
          { type: 'budget', id: '2', name: 'two' }
        ]
      }
      
      const { result } = renderHook(() => useData(record))

      act(() => {
        const [, controller] = result.current

        controller.draft(user => {
          controller.entity(user.collection)
            .select((budget) => budget.id === '1')
            .replace({ type: 'budget', id: '4', name: 'one'})
            .draft(budget => {
              budget.name = 'altered'
            })
        })
      })

      expect(result.current[0].collection).toEqual([
        { type: 'budget', id: '4', name: 'altered' },
        { type: 'budget', id: '2', name: 'two' }
      ])
    })

    it('shouldnt break if select gets undefined result', () => {
      const record = {
        collection: [
          { type: 'budget', id: '1', name: 'one' },
          { type: 'budget', id: '2', name: 'two' }
        ]
      }
      
      const { result } = renderHook(() => useData(record))

      act(() => {
        const [, controller] = result.current

        controller.draft(user => {
          controller.entity(user.collection)
            .select((budget) => budget.id === '5')
            .replace({ type: 'budget', id: '4', name: 'one' })
            .draft(budget => {
              budget.name = 'altered'
            })
        })
      })

      expect(result.current[0].collection).toEqual([
        { type: 'budget', id: '1', name: 'one' },
        { type: 'budget', id: '2', name: 'two' }
      ])
    })
  })

  describe('entity - selectors', () => {
    it('should be able to use a selector for a record', () => {
      const record = {
        user: {
          id: '10',
          type: 'user'
        }
      }
      
      const { result } = renderHook(() => useData(record))

      act(() => {
        const [, controller] = result.current
        const recordUser = controller.sliceEntity(record => record.user)
       
        recordUser(operator => operator.draft((user) => {
          user.id = 'altered'
        }))
      })

      expect(result.current[0].user).toEqual({ 
        type: 'user', 
        id: 'altered'
      })
    })

    it('should be able to use a selector for a collection', () => {
      const record = {
        user: {
          collection: [
            { type: 'budget', id: '1', name: 'one' },
            { type: 'budget', id: '2', name: 'two' }
          ]
        }
      }
      
      const { result } = renderHook(() => useData(record))

      act(() => {
        const [, controller] = result.current
        const recordUserCollection = controller.sliceEntity(record => record.user.collection)

        recordUserCollection((operator) => {
          operator
            .select((budget) => budget.id === '1')
            .draft(budget => {
              budget.name = 'altered'
            })
        })
      })

      expect(result.current[0].user.collection).toEqual([
        { type: 'budget', id: '1', name: 'altered' },
        { type: 'budget', id: '2', name: 'two' }
      ])
    })
  })
})
