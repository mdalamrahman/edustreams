/**
 * Anti-Cheat & Keystroke Biometric Hardening Service
 * Monitors paste velocity, inter-key latency variance (bot detection),
 * fullscreen escapes, and tab switching during live mock interviews.
 */

export interface KeystrokeEvent {
  key: string;
  timestamp: number;
}

export interface AnomalyRecord {
  type: 'PASTE_BURST' | 'SYNTHETIC_BOT_TYPING' | 'FULLSCREEN_ESCAPE' | 'TAB_SWITCH_BLUR';
  description: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface IntegrityAuditReport {
  integrityScore: number; // 0 to 100
  isSuspectedCheating: boolean;
  totalKeystrokes: number;
  pasteBurstCount: number;
  blurCount: number;
  totalBlurDurationSecs: number;
  fullscreenEscapes: number;
  iklMeanMs: number;
  iklStdDevMs: number;
  anomalies: AnomalyRecord[];
  formattedEvaluationContext: string;
}

export class AntiCheatMonitor {
  private keyTimestamps: number[] = [];
  private pasteBurstCount = 0;
  private blurCount = 0;
  private blurStartTime: number | null = null;
  private totalBlurDurationMs = 0;
  private fullscreenEscapes = 0;
  private anomalies: AnomalyRecord[] = [];

  /**
   * Evaluates change in Monaco editor buffer for paste injection.
   * Threshold: > 120 characters inserted in < 40ms.
   */
  evaluateCodeChange(insertedCharCount: number, elapsedMs: number = 0): void {
    if (insertedCharCount > 120 && elapsedMs < 40) {
      this.pasteBurstCount++;
      this.anomalies.push({
        type: 'PASTE_BURST',
        description: `Sudden burst injection: ${insertedCharCount} characters inserted in < 40ms.`,
        severity: 'HIGH',
        timestamp: new Date().toLocaleTimeString(),
        metadata: { insertedCharCount, elapsedMs }
      });
    }
  }

  /**
   * Records a keystroke event and calculates running Inter-Key Latency (IKL)
   */
  recordKeystroke(): void {
    const now = performance.now();
    this.keyTimestamps.push(now);

    // Keep sliding window of last 60 keystrokes
    if (this.keyTimestamps.length > 60) {
      this.keyTimestamps.shift();
    }

    // Evaluate IKL variance if we have at least 25 keystrokes
    if (this.keyTimestamps.length >= 25) {
      this.evaluateIKLVariance();
    }
  }

  /**
   * Detects synthetic bot typing / auto-key typists.
   * Human typing has irregular IKL ($\sigma > 25\text{ ms}$). Bots have uniform intervals ($\sigma < 5\text{ ms}$).
   */
  private evaluateIKLVariance(): void {
    const intervals: number[] = [];
    for (let i = 1; i < this.keyTimestamps.length; i++) {
      intervals.push(this.keyTimestamps[i] - this.keyTimestamps[i - 1]);
    }

    const n = intervals.length;
    if (n < 20) return;

    const mean = intervals.reduce((a, b) => a + b, 0) / n;
    const variance = intervals.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / n;
    const stdDev = Math.sqrt(variance);

    // Unnaturally low standard deviation indicates mechanical/bot typing
    if (stdDev < 5 && mean > 5 && mean < 150) {
      const alreadyFlagged = this.anomalies.some(a => a.type === 'SYNTHETIC_BOT_TYPING');
      if (!alreadyFlagged) {
        this.anomalies.push({
          type: 'SYNTHETIC_BOT_TYPING',
          description: `Synthetic Keystroke Generator detected: Extremely uniform typing rhythm (StdDev = ${stdDev.toFixed(2)}ms across ${n} strokes).`,
          severity: 'CRITICAL',
          timestamp: new Date().toLocaleTimeString(),
          metadata: { meanMs: mean, stdDevMs: stdDev, sampleSize: n }
        });
      }
    }
  }

  /**
   * Tracks tab switch / window blur
   */
  recordBlur(): void {
    this.blurCount++;
    this.blurStartTime = performance.now();
  }

  /**
   * Tracks tab focus restored
   */
  recordFocus(): void {
    if (this.blurStartTime) {
      const duration = performance.now() - this.blurStartTime;
      this.totalBlurDurationMs += duration;
      this.blurStartTime = null;

      if (duration > 3000) {
        this.anomalies.push({
          type: 'TAB_SWITCH_BLUR',
          description: `Candidate navigated away from interview tab for ${(duration / 1000).toFixed(1)} seconds.`,
          severity: duration > 15000 ? 'HIGH' : 'MEDIUM',
          timestamp: new Date().toLocaleTimeString(),
          metadata: { durationMs: duration }
        });
      }
    }
  }

  /**
   * Tracks fullscreen escape
   */
  recordFullscreenEscape(): void {
    this.fullscreenEscapes++;
    this.anomalies.push({
      type: 'FULLSCREEN_ESCAPE',
      description: 'Candidate exited required fullscreen proctored mode.',
      severity: 'MEDIUM',
      timestamp: new Date().toLocaleTimeString()
    });
  }

  /**
   * Generates comprehensive integrity report
   */
  generateReport(): IntegrityAuditReport {
    let integrityScore = 100;

    // Deduct points based on anomalies
    this.anomalies.forEach(a => {
      if (a.severity === 'CRITICAL') integrityScore -= 35;
      else if (a.severity === 'HIGH') integrityScore -= 20;
      else if (a.severity === 'MEDIUM') integrityScore -= 10;
      else integrityScore -= 5;
    });

    integrityScore = Math.max(0, Math.min(100, integrityScore));
    const isSuspectedCheating = integrityScore < 60 || this.anomalies.some(a => a.severity === 'CRITICAL');

    // Calculate final IKL stats
    const intervals: number[] = [];
    for (let i = 1; i < this.keyTimestamps.length; i++) {
      intervals.push(this.keyTimestamps[i] - this.keyTimestamps[i - 1]);
    }
    const mean = intervals.length > 0 ? intervals.reduce((a, b) => a + b, 0) / intervals.length : 0;
    const variance = intervals.length > 0 ? intervals.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / intervals.length : 0;
    const stdDev = Math.sqrt(variance);

    const formattedEvaluationContext = `[ANTI-CHEAT & PROCTORING INTEGRITY AUDIT]:
- Integrity Score: ${integrityScore}/100 (${isSuspectedCheating ? 'SUSPECTED INTEGRITY VIOLATION' : 'CLEAN AUTHENTIC SESSION'})
- Total Keystrokes Monitored: ${this.keyTimestamps.length}
- Typing Naturalness (IKL): Mean = ${mean.toFixed(1)}ms, StdDev = ${stdDev.toFixed(1)}ms (${stdDev >= 15 ? 'Natural Human Pattern' : 'Low Variance'})
- Tab Switch / Blur Events: ${this.blurCount} times (Total duration away: ${(this.totalBlurDurationMs / 1000).toFixed(1)}s)
- Fullscreen Escapes: ${this.fullscreenEscapes}
- Flagged Anomalies (${this.anomalies.length}):
${this.anomalies.length > 0 ? this.anomalies.map(a => `  * [${a.severity}] ${a.description} at ${a.timestamp}`).join('\n') : '  * None. Perfect testing discipline.'}`;

    return {
      integrityScore,
      isSuspectedCheating,
      totalKeystrokes: this.keyTimestamps.length,
      pasteBurstCount: this.pasteBurstCount,
      blurCount: this.blurCount,
      totalBlurDurationSecs: Math.round(this.totalBlurDurationMs / 1000),
      fullscreenEscapes: this.fullscreenEscapes,
      iklMeanMs: Math.round(mean),
      iklStdDevMs: Math.round(stdDev),
      anomalies: this.anomalies,
      formattedEvaluationContext
    };
  }
}
