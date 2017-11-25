const machine = require('../')
const test = require('tape')

// an event stream
// a state stream (two versions -- object and string)

test('lightMachine example 1', t => {
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
  t.end()
})

test('nested states example', t => {
  const pedestrianStates = {
    initial: 'walk',
    on: {TIMER: 'green'},
    states: {
      walk: { on: { PED_TIMER: 'wait' } },
      wait: { on: { PED_TIMER: 'stop' } },
      stop: {}
    }
  }

  const lightMachine = machine({
    key: 'light',
    initial: 'yellow',
    states: {
      green: { on: { TIMER: 'yellow' } },
      yellow: { on: { TIMER: 'red' } },
      red: pedestrianStates
    }
  })

  lightMachine.event$('TIMER')
  t.strictEqual(lightMachine.stateString$(), 'red.walk')
  t.deepEqual(lightMachine.state$(), {red: 'walk'})

  lightMachine.event$('PED_TIMER')
  t.deepEqual(lightMachine.state$(), {red: 'wait'})
  t.strictEqual(lightMachine.stateString$(), 'red.wait')
  lightMachine.event$('PED_TIMER')
  t.deepEqual(lightMachine.state$(), {red: 'stop'})
  t.strictEqual(lightMachine.stateString$(), 'red.stop')
  lightMachine.event$('TIMER')
  t.strictEqual(lightMachine.state$(), 'green')
  t.strictEqual(lightMachine.stateString$(), 'green')
  t.end()
})

test('parallel states', t => {
  const wordMachine = machine({
    parallel: true,
    states: {
      bold: {
        initial: 'off',
        states: {
          on: { on: { TOGGLE_BOLD: 'off' } },
          off: { on: { TOGGLE_BOLD: 'on' } }
        }
      },
      underline: {
        initial: 'off',
        states: {
          on: { on: { TOGGLE_UNDERLINE: 'off' } },
          off: { on: { TOGGLE_UNDERLINE: 'on' } }
        }
      },
      italics: {
        initial: 'off',
        states: {
          on: { on: { TOGGLE_ITALICS: 'off' } },
          off: { on: { TOGGLE_ITALICS: 'on' } }
        }
      },
      list: {
        initial: 'none',
        states: {
          none: { on: { BULLETS: 'bullets', NUMBERS: 'numbers' } },
          bullets: { on: { NONE: 'none', NUMBERS: 'numbers' } },
          numbers: { on: { BULLETS: 'bullets', NONE: 'none' } }
        }
      }
    }
  })

  wordMachine.event$('TOGGLE_BOLD')
  t.deepEqual(wordMachine.state$(), {bold: 'on', italics: 'off', underline: 'off', list: 'none'})

  wordMachine.event$('TOGGLE_ITALICS')
  t.deepEqual(wordMachine.state$(), {bold: 'on', italics: 'on', underline: 'off', list: 'none'})
  t.end()
})

test('history states', t => {
  const paymentMachine = machine({
    initial: 'method',
    states: {
      method: {
        initial: 'cash',
        states: {
          cash: { on: { SWITCH_CHECK: 'check' } },
          check: { on: { SWITCH_CASH: 'cash' } }
        },
        on: { NEXT: 'review' }
      },
      review: {
        on: { PREVIOUS: 'method.$history' }
      }
    }
  })

  paymentMachine.event$('SWITCH_CHECK')
  t.deepEqual(paymentMachine.state$(), {method: 'check'})
  paymentMachine.event$('NEXT')
  t.strictEqual(paymentMachine.state$(), 'review')
  paymentMachine.event$('PREVIOUS')
  t.deepEqual(paymentMachine.state$(), {method: 'check'})
  t.end()
})
