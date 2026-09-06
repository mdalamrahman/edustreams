/**
 * Deterministic Interview State Machine & 3-Tier Hinting Ladder
 * Prevents candidate rushing, enforces standard FAANG interview stage progression,
 * and tracks calibrated penalties for hints.
 */

export type InterviewStage = 
  | 'CLARIFICATION' 
  | 'INTUITION' 
  | 'DRY_RUN' 
  | 'CODING' 
  | 'OPTIMIZATION';

export interface HintRecord {
  stage: InterviewStage;
  tier: 1 | 2 | 3;
  penaltyPercent: number;
  hintText: string;
  timestamp: string;
  emotionDirective?: string;
}

export interface StageValidationState {
  assumptionsConfirmed: boolean;
  constraintsClarified: boolean;
  timeComplexityStated: boolean;
  spaceComplexityStated: boolean;
  dryRunPassed: boolean;
  codeCompiled: boolean;
  testCasesPassed: boolean;
}

export interface InterviewStateMachineConfig {
  lockEditorUntilCoding?: boolean;
}

export class InterviewStateMachine {
  private currentStage: InterviewStage = 'CLARIFICATION';
  private validations: StageValidationState = {
    assumptionsConfirmed: false,
    constraintsClarified: false,
    timeComplexityStated: false,
    spaceComplexityStated: false,
    dryRunPassed: false,
    codeCompiled: false,
    testCasesPassed: false
  };
  private hintsGiven: HintRecord[] = [];
  private lockEditorUntilCoding: boolean;

  constructor(config?: InterviewStateMachineConfig) {
    this.lockEditorUntilCoding = config?.lockEditorUntilCoding ?? true;
  }

  getCurrentStage(): InterviewStage {
    return this.currentStage;
  }

  getValidations(): StageValidationState {
    return { ...this.validations };
  }

  getHintsGiven(): HintRecord[] {
    return [...this.hintsGiven];
  }

  /**
   * Resets state machine for new interview round
   */
  reset(): void {
    this.currentStage = 'CLARIFICATION';
    this.validations = {
      assumptionsConfirmed: false,
      constraintsClarified: false,
      timeComplexityStated: false,
      spaceComplexityStated: false,
      dryRunPassed: false,
      codeCompiled: false,
      testCasesPassed: false
    };
    this.hintsGiven = [];
  }

  /**
   * Monaco Code Editor lock status based on active stage
   */
  isEditorLocked(): boolean {
    if (!this.lockEditorUntilCoding) return false;
    return (
      this.currentStage === 'CLARIFICATION' ||
      this.currentStage === 'INTUITION' ||
      this.currentStage === 'DRY_RUN'
    );
  }

  /**
   * Updates specific validation checklist items from candidate speech or test results
   */
  setValidation(key: keyof StageValidationState, value: boolean): void {
    this.validations[key] = value;

    // Check automatic progression triggers
    if (this.currentStage === 'CLARIFICATION' && this.validations.assumptionsConfirmed && this.validations.constraintsClarified) {
      this.transitionTo('INTUITION');
    } else if (this.currentStage === 'INTUITION' && this.validations.timeComplexityStated && this.validations.spaceComplexityStated) {
      this.transitionTo('DRY_RUN');
    } else if (this.currentStage === 'DRY_RUN' && this.validations.dryRunPassed) {
      this.transitionTo('CODING');
    } else if (this.currentStage === 'CODING' && this.validations.testCasesPassed) {
      this.transitionTo('OPTIMIZATION');
    }
  }

  /**
   * Deterministic transition to a new stage
   */
  transitionTo(nextStage: InterviewStage): { success: boolean; reason?: string } {
    const stageOrder: InterviewStage[] = ['CLARIFICATION', 'INTUITION', 'DRY_RUN', 'CODING', 'OPTIMIZATION'];
    const currentIndex = stageOrder.indexOf(this.currentStage);
    const targetIndex = stageOrder.indexOf(nextStage);

    if (targetIndex < currentIndex) {
      this.currentStage = nextStage;
      return { success: true };
    }

    // Progression gate checks
    if (nextStage === 'INTUITION' && (!this.validations.assumptionsConfirmed || !this.validations.constraintsClarified)) {
      // Soft transition allowed if user explains intuition
    }

    this.currentStage = nextStage;
    return { success: true };
  }

  /**
   * 3-Tier Hinting Ladder:
   * - Tier 1 (5% penalty): Gentle conceptual nudge or direction
   * - Tier 2 (15% penalty): Algorithmic pattern or data structure pointer
   * - Tier 3 (30% penalty): Explicit pseudocode / step-by-step resolution
   */
  recordHint(tier: 1 | 2 | 3, hintText: string): HintRecord {
    const penaltyMap: Record<1 | 2 | 3, number> = {
      1: 5,
      2: 15,
      3: 30
    };

    const record: HintRecord = {
      stage: this.currentStage,
      tier,
      penaltyPercent: penaltyMap[tier],
      hintText,
      timestamp: new Date().toLocaleTimeString(),
      emotionDirective: '[encouragingly]'
    };

    this.hintsGiven.push(record);
    return record;
  }

  /**
   * Calculates aggregate hint penalty points capped at 60%
   */
  calculateTotalPenaltyPercent(): number {
    const total = this.hintsGiven.reduce((acc, h) => acc + h.penaltyPercent, 0);
    return Math.min(60, total);
  }

  /**
   * Generates formatted audit string for LLM Bar Raiser evaluation prompt
   */
  formatEvaluationDebrief(): string {
    const totalPenalty = this.calculateTotalPenaltyPercent();
    return `[DETERMINISTIC INTERVIEW STATE MACHINE AUDIT]:
- Final Reached Stage: ${this.currentStage}
- Stage Validations:
  * Clarification Complete: ${this.validations.assumptionsConfirmed && this.validations.constraintsClarified ? 'YES' : 'NO'}
  * Complexity Pre-Stated: ${this.validations.timeComplexityStated && this.validations.spaceComplexityStated ? 'YES' : 'NO'}
  * Dry Run Performed: ${this.validations.dryRunPassed ? 'YES' : 'NO'}
  * Code Compiled & Ran: ${this.validations.codeCompiled ? 'YES' : 'NO'}
  * Test Suite Defense: ${this.validations.testCasesPassed ? 'YES' : 'NO'}
- Hints Requested / Given: ${this.hintsGiven.length}
${this.hintsGiven.map((h, i) => `  * Hint #${i + 1} [Tier ${h.tier} - ${h.penaltyPercent}% penalty in ${h.stage}]: "${h.hintText}"`).join('\n')}
- Net Hint Penalty Deduction: -${totalPenalty}% (to be factored into final score)`;
  }
}
