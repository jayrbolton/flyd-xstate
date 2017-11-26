module.exports = function testStates (machine, events, t) {
  events.forEach(([evName, state]) => {
    machine.event$(evName)
    t.deepEqual(machine.stateString$(), state, evName + ' -> ' + state)
  })
}
