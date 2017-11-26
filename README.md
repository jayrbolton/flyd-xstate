# flyd-xstate

This unifies functional reactive programming (FRP) with [flyd](https://github.com/paldepind/flyd) and Harel Statecharts with [xstate](https://github.com/davidkpiano/xstate)

The api to create a state machine is exactly the same as `xstate`. The object that is returned is different, however. This returned object has three keys:

* `event$`: a stream of event names that occur in the machine
* `state$`: a stream of states (represented as strings or objects) -- produced by `State.value` from xstate
* `stateString$`: a stream of states (represented as strings only) -- produced by `State.toString()` from xstate

Please see [the test examples](/test/index.js) to see how this can be used -- you will find the API is quite simple: push new events to the `event$` stream and listen to new states on the `state$` stream.

```js
const machine = require('flyd-xstate')
const lights = machine({
  key: 'light',
  initial: 'green',
  states: {
    green: { on: { TIMER: 'yellow' } },
    yellow: { on: { TIMER: 'red' } },
    red: { on: { TIMER: 'green' } }
  }
})

t.strictEqual(lights.state$(), 'green')
t.strictEqual(lights.stateString$(), 'green')
lights.event$('TIMER')
t.strictEqual(lights.state$(), 'yellow')
t.strictEqual(lights.stateString$(), 'yellow')
```

## Test utility

There is a simple test utility here that you can import from `lib/test`. It allows you to list events and test the expected states.

```js
const testStates = require('flyd-xstate/lib/test')
const test = require('tape')
const PageChart = require('page-chart')

test('all valid paths', t => {
  const chart = PageChart()
  testStates(chart, [
    ['IMPORT', 'importing'],
    ['CLOSE', 'listing'],
    ['IMPORT', 'importing'],
    ['SAVE', 'loading'],
    ['DONE', 'listing'],
    ['REMOVE', 'confirmingRemove'],
    ['DENY', 'listing'],
    ['REMOVE', 'confirmingRemove'],
    ['CONFIRM', 'loading'],
    ['DONE', 'listing'],
    ['EDIT', 'editing.viewing'],
    ['CLOSE', 'listing'],
    ['EDIT', 'editing.viewing'],
    ['UPDATE', 'editing.loading'],
    ['DONE', 'editing.viewing'],
    ['ADD', 'editing.adding'],
    ['SAVE', 'editing.loading'],
    ['DONE', 'editing.viewing'],
    ['ADD', 'editing.adding'],
    ['CLOSE', 'editing.viewing'],
    ['CLOSE', 'listing']
  ], t)
  t.end()
})
```
