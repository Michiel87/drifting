import { act, renderHook } from '@testing-library/react-hooks'
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
  describe('update', () => {
    it('should update properties', () => {
      const { result } = renderHook(() => useData(record))
  
      act(() => {
        result.current[1].update((user) => {
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
  
        controller.update(user => {
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
  
        controller.update(user => {
          user.relationships.budgets[0].attributes.threshold = 14
        })
      })
  
      expect(result.current[0].relationships.budgets[0].attributes.threshold).toBe(14)
    })
  
    
    it('should update entire obj when using return', () => {
      const data = {
        replace: {
          type: 'item',
          id: 'not-replaced'
        }
      }

      const { result } = renderHook(() => useData(data))
  
      act(() => {
        const [, controller] = result.current
  
        controller.update(data => ({
          replace: { 
            id: 'replaced', type: data.replace.type 
          }
        }))
      })
  
      expect(result.current[0]).toEqual({ replace: { id: 'replaced', type: 'item' } })
    })
  
    it('should apply changes to new object', () => {
      const reference = { id: '10', type: 'budget' , attributes: { name: 'test' } }
      const { result } = renderHook(() => useData(reference))
   
      act(() => {
        const [, controller] = result.current
  
        controller.update(user => {
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
  
        controller.update(collection => {
          collection.push({ type: 'budget', id: '2' })
        })
      })
  
      expect(result.current[0]).toEqual([
        { type: 'budget', id: '1' },
        { type: 'budget', id: '2' },
      ])
    })
  })

  describe('select', () => {
    it('should be possible to narrow the state and state controller while maintaining it as a single state', () => {
      const rec = { 
        type: 'budget' , 
        attributes: { 
          name: 'test'
        }
      }
    
      const { result } = renderHook(() => useData(rec))
      const [, ctrl] = result.current
      const [, attrCtrl] = ctrl.select((record) => record.attributes)
  
      act(() => {
        attrCtrl.update(attributes => {
          attributes.name = 'updated'
        })
      })
  
      const record = result.current[0]
      expect(record.attributes.name).toBe('updated')
    })

    it('should be possible to narrow the state and state controller recursively', () => {
      const rec = { 
        type: 'budget' , 
        attributes: { 
          name: 'test',
          info: {
            status: 'online'
          }
        }
      }
    
      const { result } = renderHook(() => useData(rec))
      const [, ctrl] = result.current
      const [, attrCtrl] = ctrl.select((record) => record.attributes)
      const [, infoCtrl] = attrCtrl.select((attributes) => attributes.info)
  
      act(() => {
        infoCtrl.update(info => {
          info.status = 'offline'
        })
      })
  
      const record = result.current[0]
      expect(record.attributes.info.status).toBe('offline')
    })

    it('should be possible to replace narrowed state', () => {
      const rec = { 
        type: 'budget' , 
        attributes: { 
          name: 'test',
          info: {
            status: 'online'
          }
        }
      }
    
      const { result } = renderHook(() => useData(rec))
      const [, ctrl] = result.current
      const [, attrCtrl] = ctrl.select((record) => record.attributes)
      const [, infoCtrl] = attrCtrl.select((attributes) => attributes.info)
  
      act(() => {
        infoCtrl.update(info => ({ status: 'offline' }))
      })
  
      const record = result.current[0]
      expect(record.attributes.info.status).toBe('offline')
    })
  })
})
