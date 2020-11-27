import { useData } from '../src'

(() => {
  const [record, { select }] = useData({ attributes: { status: 'idle', info: 'initial value' }})
 
  const [attributes, { update }] = select(record => record.attributes)

  update((attributes) => {
    attributes.status = 'successful'
    attributes.info = 'some value...'
  })

  // after update is rendered
  record.attributes.status === 'successful'
  record.attributes.info === 'some value...'
  attributes.status === 'successful'
  attributes.info = 'some value...'
})()
