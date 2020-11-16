drifting
=============

[React](https://reactjs.org/) solution for interacting with complex data-structures.

This package attempts to make it easier to interact with complex data structures. 
Drifting is fully typed with typescript and easy to extend with your own solutions.

---
### Examples

## [record](https://codesandbox.io/s/drifting-v106-record-demo-qwk2x)
## [collection](https://codesandbox.io/s/drifting-v106-collection-demo-60ztq)
## [chaining](https://codesandbox.io/s/drifting-v106-chaining-demo-bzjk8)
## [predicates](https://codesandbox.io/s/drifting-v106-predicates-demo-0reu3)
## [extensions](https://codesandbox.io/s/drifting-v106-extensions-demo-q33oz)

---

A big thank you to the author and contributers of the popular
[immer](https://github.com/immerjs/immer) package, as
drifting relies heavily on this package under the hood.

Installation
------------

_drifting requires React 16_

_npm_

```
npm install --save drifting
```

_yarn_

```
yarn add drifting
```

API
---

### `useData()`

```jsx
import { useData } from 'drifting'

const record = {
  attributes: {
    name: 'Exivity' 
  }
}

// See sandboxes for usage examples
const [entity, controller] = useData(record)

```

License
-------

MIT
