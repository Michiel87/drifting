import { renderHook, act } from '@testing-library/react-hooks'

import { useRecord } from '../record'

describe('record', () => {
  const rec = {
    type: 'user',
    id: '120',
    attributes: {
      name: 'morgen'
    }
  } 
  

  it('should so something', () => {
    const { result } = renderHook(() => useRecord(rec))

    act(() => {
      const [, controller] = result.current

      controller.draft(user => void (user.attributes.name = 'tof'))
    })

    expect(result.current[0].attributes.name).toBe('tof')
  })
})