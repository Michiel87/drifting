import { useData } from '../src'

(() => {
  const [record, { update }] = useData({ attributes: { status: 'idle', info: 'initial value' }})
 
  update((record) => {
    record.attributes.status = 'successful'
    record.attributes.info = 'some value...'
  })

    // after update is rendered
    record.attributes.status === 'successful'
    record.attributes.info === 'some value...'
})()
