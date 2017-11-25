var flyd = require('flyd')
var xstate = require('xstate')
var Machine = xstate.Machine

module.exports = function machine (config) {
  var event$ = flyd.stream()
  var state$ = flyd.stream()
  var stateObj = null
  var stateString$ = flyd.stream()
  var machine = Machine(config)
  state$(machine.initial)
  stateString$(machine.initial)

  flyd.on(
    function (eventName) {
      stateObj = machine.transition(stateObj, eventName)
      state$(stateObj.value)
      stateString$(stateObj.toString())
    },
    event$
  )

  return {event$: event$, state$: state$, stateString$: stateString$}
}
