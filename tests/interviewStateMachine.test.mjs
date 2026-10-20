import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

// Interview stages definition
const InterviewStage = {
  INTRO: 'INTRO',
  PROBLEM_PRESENTATION: 'PROBLEM_PRESENTATION',
  CLARIFICATION: 'CLARIFICATION',
  APPROACH_DISCUSSION: 'APPROACH_DISCUSSION',
  CODING: 'CODING',
  DRY_RUN: 'DRY_RUN',
  OPTIMIZATION: 'OPTIMIZATION',
  FEEDBACK: 'FEEDBACK',
  COMPLETE: 'COMPLETE'
};

function getNextStage(current, userAction) {
  switch (current) {
    case InterviewStage.INTRO:
      return InterviewStage.PROBLEM_PRESENTATION;
    case InterviewStage.PROBLEM_PRESENTATION:
      return userAction === 'ASK_CLARIFICATION' 
        ? InterviewStage.CLARIFICATION 
        : InterviewStage.APPROACH_DISCUSSION;
    case InterviewStage.CLARIFICATION:
      return InterviewStage.APPROACH_DISCUSSION;
    case InterviewStage.APPROACH_DISCUSSION:
      return userAction === 'APPROACH_ACCEPTED' 
        ? InterviewStage.CODING 
        : InterviewStage.APPROACH_DISCUSSION;
    case InterviewStage.CODING:
      return userAction === 'CODE_SUBMITTED' 
        ? InterviewStage.DRY_RUN 
        : InterviewStage.CODING;
    case InterviewStage.DRY_RUN:
      return InterviewStage.OPTIMIZATION;
    case InterviewStage.OPTIMIZATION:
      return InterviewStage.FEEDBACK;
    case InterviewStage.FEEDBACK:
      return InterviewStage.COMPLETE;
    default:
      return InterviewStage.COMPLETE;
  }
}

describe('Interview State Machine Transitions', () => {
  test('Transitions from Intro to Problem Presentation', () => {
    assert.equal(getNextStage(InterviewStage.INTRO, 'PROCEED'), InterviewStage.PROBLEM_PRESENTATION);
  });

  test('Transitions to Clarification when user asks question', () => {
    assert.equal(getNextStage(InterviewStage.PROBLEM_PRESENTATION, 'ASK_CLARIFICATION'), InterviewStage.CLARIFICATION);
  });

  test('Transitions from Approach to Coding once accepted', () => {
    assert.equal(getNextStage(InterviewStage.APPROACH_DISCUSSION, 'APPROACH_ACCEPTED'), InterviewStage.CODING);
  });

  test('Transitions from Coding to Dry Run upon submission', () => {
    assert.equal(getNextStage(InterviewStage.CODING, 'CODE_SUBMITTED'), InterviewStage.DRY_RUN);
  });

  test('Completes the interview loop through Feedback', () => {
    assert.equal(getNextStage(InterviewStage.FEEDBACK, 'FINISH'), InterviewStage.COMPLETE);
  });
});
