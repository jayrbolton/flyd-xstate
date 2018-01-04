# flyd-xstate

This unifies functional reactive programming (FRP) with [flyd](https://github.com/paldepind/flyd) and Harel Statecharts with [xstate](https://github.com/davidkpiano/xstate)

## machine(config)

The api to create a state machine is the same as `xstate`, with **one extra key**: `eventStream`, which should be a stream of event names that occur over time for the statechart.

The object returned contains two state stream properties:

* `.state`: a stream of states (represented as strings or objects) -- produced by `State.value` from xstate
* `.stateString`: a stream of states (represented as strings only) -- produced by `State.toString()` from xstate

Please see [the test file](/test/index.js) to see more examples -- you will find the API is quite simple: push new events to your `event` stream and listen to new states on the `state` stream.

```js
const machine = require('flyd-xstate')
const flyd = require('flyd')

const event = flyd.stream()
const lights = machine({
  eventStream: event,
  key: 'light',
  initial: 'green',
  states: {
    green: { on: { TIMER: 'yellow' } },
    yellow: { on: { TIMER: 'red' } },
    red: { on: { TIMER: 'green' } }
  }
})

t.strictEqual(lights.state(), 'green')
t.strictEqual(lights.stateString(), 'green')
event('TIMER')
t.strictEqual(lights.state(), 'yellow')
t.strictEqual(lights.stateString(), 'yellow')
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

Each pair of `[EVENT_NAME, state]` represents the state that the chart should be in **after** you fire the given event. Everything gets evaluated top-down in a big sequence.
