import { renderHook, act } from '@testing-library/react-hooks'
import { relationship } from '../operations'

import { useRecord } from '../record'

describe('useRecord', () => {
  const rec = {
    type: 'user',
    id: '120',
    attributes: {
      name: 'someone',
      company: 'exivity'
    },
    relationships: {
      revision: { id: '10', type: 'revision', attributes: { version: '0.0.1' } },
      budgets: [
        { id: '10', type: 'budget', attributes: { threshold: 10 } },
        { id: '11', type: 'budget', attributes: { threshold: 11 } },
        { id: '12', type: 'budget', attributes: { threshold: 12 } },
      ]
    }
  } 
  

  it.each([
    [rec, user => void (user.attributes.name = 'Michiel'), 'Michiel'],
    [rec, user => void (user.attributes = { name: 'independent' }), 'independent'],
  ])
  ('should update properties', (base, draft, expectedResult) => {
    const { result } = renderHook(() => useRecord(base))

    act(() => {
      result.current[1].draft(draft)
    })

    expect(result.current[0].attributes.name).toBe(expectedResult)
  })

  it('should work with operations', () => {
    const { result } = renderHook(() => useRecord(rec))

    act(() => {
      const [, controller] = result.current

      controller.draft(user => {
        relationship(user.relationships.budgets)
          .add({ id: '14', type: 'budget', attributes: { threshold: 13 } })
      })
    })

    expect(result.current[0].relationships.budgets)
    .toEqual([
      { id: '10', type: 'budget', attributes: { threshold: 10 } },
      { id: '11', type: 'budget', attributes: { threshold: 11 } },
      { id: '12', type: 'budget', attributes: { threshold: 12 } },
      { id: '14', type: 'budget', attributes: { threshold: 13 } }
    ])
  })

  it('should work with operations2', () => {
    const { result } = renderHook(() => useRecord(rec))

    act(() => {
      const [, controller] = result.current

      controller.draft(user => {
        relationship(user.relationships.revision)
          .replace({ id: '33', type: 'revision', attributes: { version: '1.0.1' }})
          .draft(revision => void (revision.attributes.version = 'new'))
      })
    })

    expect(result.current[0].relationships.revision.id).toBe('33')
    expect(result.current[0].relationships.revision.attributes.version).toBe('new')

  })

  it('should work with operations3', () => {
    const { result } = renderHook(() => useRecord(rec))

    act(() => {
      const [, controller] = result.current
      const revisionRelationship = controller.slice(user => user.relationships.revision)

      controller.draft(user => {
        revisionRelationship(user)
          .replace({ id: '33', type: 'revision', attributes: { version: '0.0.2' } })
      })
    })

    expect(result.current[0].relationships.revision)
    .toEqual({ id: '33', type: 'revision', attributes: { version: '0.0.2' } })
  })
})