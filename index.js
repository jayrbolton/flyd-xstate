var flyd = require('flyd')
var xstate = require('xstate')
var Machine = xstate.Machine

module.exports = function machine (config) {
  if (!flyd.isStream(config.eventStream)) throw new TypeError('Requires a .eventStream property that is a flyd stream')
  var event$ = config.eventStream
  var state$ = flyd.stream()
  var stateObj = null
  var stateString$ = flyd.stream()
  var machine = Machine(config)
  state$(machine.initial)
  stateString$(machine.initial)

  var result = {state: state$, stateString: stateString$}
  for (var name in machine.states) {
    result[name] = flyd.stream()
  }

  flyd.on(
    function (eventName) {
      stateObj = machine.transition(stateObj, eventName)
      state$(stateObj.value)
      stateString$(stateObj.toString())
    },
    event$
  )

  return result
}
