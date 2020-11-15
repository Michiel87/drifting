import { renderHook, act } from '@testing-library/react-hooks'

import { useRecord } from '../useRecord'

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

describe('useRecord', () => {
  it('should update properties', () => {
    const { result } = renderHook(() => useRecord(record))

    act(() => {
      result.current[1].draft((user) => {
        user.attributes = { name: 'independent', company: 'defiance' }
      })
    })

    expect(result.current[0].attributes)
    .toEqual({ name: 'independent', company: 'defiance' })
  })

  it('should allow multiple property updates', () => {
    const { result } = renderHook(() => useRecord(record))

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
    const { result } = renderHook(() => useRecord(record))

    act(() => {
      const [, controller] = result.current

      controller.draft(user => {
        user.relationships.budgets[0].attributes.threshold = 14
      })
    })

    expect(result.current[0].relationships.budgets[0].attributes.threshold).toBe(14)
  })

  
  it('should update entire obj when using return', () => {
    const { result } = renderHook(() => useRecord(record))

    act(() => {
      const [, controller] = result.current

      controller.draft(user => ({ id: 'replaced', type: user.type }))
    })

    expect(result.current[0]).toEqual({ id: 'replaced', type: 'user' })
  })

  it('should apply changes to new object', () => {
    const reference = { id: '10', type: 'budget' , attributes: { name: 'test' } }
    const { result } = renderHook(() => useRecord(reference))
 
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

  
describe('entity selectors and operators', () => {
  it('should work with operations', () => {
    const { result } = renderHook(() => useRecord(record))

    act(() => {
      const [, controller] = result.current

      controller.draft(user => {
        controller.entity(user.relationships.budgets)
          .add({ id: '14', type: 'budget', attributes: { threshold: 13 } })
      })
    })

    expect(result.current[0].relationships.budgets)
    .toEqual([
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
      },
      { id: '14', type: 'budget', attributes: { threshold: 13 } }
    ])
  })

  it('should work with operations2', () => {
    const { result } = renderHook(() => useRecord(record))

    act(() => {
      const [, controller] = result.current

      controller.draft(user => {
        controller.entity(user.relationships.revision)
          .replace({ id: '33', type: 'revision', attributes: { name: 'revision-1' }})
          .draft(revision => void (revision.attributes.name = 'revision-2'))
      })
    })

    expect(result.current[0].relationships.revision.id).toBe('33')
    expect(result.current[0].relationships.revision.attributes.name).toBe('revision-2')

  })

  it('should work with operations3', () => {
    const { result } = renderHook(() => useRecord(record))

    act(() => {
      const [, controller] = result.current
      const userRevision = controller.sliceEntity(user => user.relationships.revision)

      controller.draft(user => {
        userRevision(user)
          .replace({ id: '33', type: 'revision', attributes: { name: 'revision-2' } })
      })
    })

    expect(result.current[0].relationships.revision)
    .toEqual({ 
      id: '33', 
      type: 'revision', 
      attributes: {
        name: 'revision-2'
       } 
      })
    })
  })
})
