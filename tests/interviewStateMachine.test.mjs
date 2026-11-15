import { test } from 'node:test';
import assert from 'node:assert/strict';
import { InterviewStateMachine } from '../src/lib/interviewStateMachine.ts';
test('Production interview machine starts locked and unlocks at coding', () => {
  const machine = new InterviewStateMachine();
  assert.equal(machine.getCurrentStage(), 'CLARIFICATION');
  assert.equal(machine.isEditorLocked(), true);
  machine.transitionTo('CODING');
  assert.equal(machine.isEditorLocked(), false);
});
test('Hint penalties are capped and reset clears the round', () => {
  const machine = new InterviewStateMachine();
  for (let i=0; i<4; i++) machine.recordHint(3, 'hint');
  assert.equal(machine.calculateTotalPenaltyPercent(), 60);
  machine.reset();
  assert.equal(machine.calculateTotalPenaltyPercent(), 0);
  assert.equal(machine.getCurrentStage(), 'CLARIFICATION');
});
