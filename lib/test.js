module.exports = function testStates (machine, event, events, t) {
  events.forEach(([evName, state]) => {
    event(evName)
    t.deepEqual(machine.stateString(), state, evName + ' -> ' + state)
  })
}
