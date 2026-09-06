/**
 * Client-Side Voice Activity Detection (VAD) & Barge-In Audio Controller
 * Analyzes audio energy and frequency characteristics to detect speech boundaries,
 * prevent premature cut-offs, and enable seamless barge-in interruption.
 */

import { terminateInterviewerAudioSpeech, abortStreamingPlayback } from './interviewService';

export interface VADConfig {
  sampleRate?: number;
  fftSize?: number;
  energyThreshold?: number;
  silenceDurationMs?: number;
  minSpeechDurationMs?: number;
}

export class VoiceActivityController {
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private mediaStream: MediaStream | null = null;
  private animationFrameId: number | null = null;

  private isSpeaking = false;
  private speechStartTimestamp = 0;
  private lastSpeechTimestamp = 0;
  private silenceTimer: any = null;

  private onSpeechStartCallback: (() => void) | null = null;
  private onSpeechEndCallback: ((durationMs: number) => void) | null = null;
  private onBargeInCallback: (() => void) | null = null;

  private isTTSActive = false;
  private config: Required<VADConfig>;

  constructor(customConfig?: VADConfig) {
    this.config = {
      sampleRate: customConfig?.sampleRate || 16000,
      fftSize: customConfig?.fftSize || 512,
      energyThreshold: customConfig?.energyThreshold || 25, // RMS threshold 0-100 scale
      silenceDurationMs: customConfig?.silenceDurationMs || 1200, // 1.2s continuous silence to finalize
      minSpeechDurationMs: customConfig?.minSpeechDurationMs || 250 // Ignore clicks/coughs < 250ms
    };
  }

  /**
   * Initializes microphone capture and audio analyzer
   */
  async init(
    onSpeechStart?: () => void,
    onSpeechEnd?: (durationMs: number) => void,
    onBargeIn?: () => void
  ): Promise<boolean> {
    this.onSpeechStartCallback = onSpeechStart || null;
    this.onSpeechEndCallback = onSpeechEnd || null;
    this.onBargeInCallback = onBargeIn || null;

    if (typeof window === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      console.warn('[VAD] Audio API not supported in this environment');
      return false;
    }

    try {
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });

      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.audioContext = new AudioCtx({ sampleRate: this.config.sampleRate });

      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }

      const source = this.audioContext.createMediaStreamSource(this.mediaStream);

      // Vocal Formant Bandpass Filter (300 Hz - 3,400 Hz)
      // Damps low-frequency desk vibrations (< 300 Hz) and rejects high-frequency mechanical keyboard clicks (> 3,400 Hz)
      const highpass = this.audioContext.createBiquadFilter();
      highpass.type = 'highpass';
      highpass.frequency.value = 300;

      const lowpass = this.audioContext.createBiquadFilter();
      lowpass.type = 'lowpass';
      lowpass.frequency.value = 3400;

      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = this.config.fftSize;
      this.analyser.smoothingTimeConstant = 0.4;

      source.connect(highpass);
      highpass.connect(lowpass);
      lowpass.connect(this.analyser);

      this.startVADLoop();
      return true;
    } catch (err) {
      console.warn('[VAD] Microphone initialization warning:', err);
      return false;
    }
  }

  /**
   * Sets whether the AI interviewer is currently speaking (for barge-in detection)
   */
  setTTSActive(active: boolean): void {
    this.isTTSActive = active;
  }

  /**
   * Continuous animation-frame audio monitoring loop
   */
  private startVADLoop(): void {
    if (!this.analyser) return;

    const bufferLength = this.analyser.frequencyBinCount;
    const timeDomainData = new Uint8Array(bufferLength);

    const checkAudioFrame = () => {
      if (!this.analyser) return;

      this.analyser.getByteTimeDomainData(timeDomainData);

      // Compute Root Mean Square (RMS) energy
      let sumSquares = 0;
      for (let i = 0; i < bufferLength; i++) {
        const normalized = (timeDomainData[i] - 128) / 128;
        sumSquares += normalized * normalized;
      }
      const rms = Math.sqrt(sumSquares / bufferLength) * 100;
      const now = performance.now();

      const isTTS = (window as any).isTTSActive === true || this.isTTSActive;
      
      // When TTS is actively speaking, completely suppress microphone energy analysis
      // to eliminate speaker bleed, false barge-in cancellations ("stops speaking respeaks"),
      // and acoustic self-hearing loops.
      if (isTTS) {
        this.isSpeaking = false;
        if (this.silenceTimer) {
          clearTimeout(this.silenceTimer);
          this.silenceTimer = null;
        }
        this.animationFrameId = requestAnimationFrame(checkAudioFrame);
        return;
      }

      const threshold = this.config.energyThreshold;
      const isVoiceDetected = rms >= threshold;

      if (isVoiceDetected) {
        this.lastSpeechTimestamp = now;

        if (!this.isSpeaking) {
          this.isSpeaking = true;
          this.speechStartTimestamp = now;

          if (this.onSpeechStartCallback) {
            this.onSpeechStartCallback();
          }
        }

        // Clear silence timeout while candidate is actively speaking
        if (this.silenceTimer) {
          clearTimeout(this.silenceTimer);
          this.silenceTimer = null;
        }
      } else if (this.isSpeaking) {
        // Continuous silence detected after active speech
        const silentElapsed = now - this.lastSpeechTimestamp;

        if (silentElapsed >= this.config.silenceDurationMs && !this.silenceTimer) {
          const speechDuration = this.lastSpeechTimestamp - this.speechStartTimestamp;

          // Guard against spurious noises < minSpeechDurationMs
          if (speechDuration >= this.config.minSpeechDurationMs) {
            this.isSpeaking = false;
            if (this.onSpeechEndCallback) {
              this.onSpeechEndCallback(Math.round(speechDuration));
            }
          } else {
            this.isSpeaking = false;
          }
        }
      }

      this.animationFrameId = requestAnimationFrame(checkAudioFrame);
    };

    this.animationFrameId = requestAnimationFrame(checkAudioFrame);
  }

  /**
   * Handles immediate cancellation of interviewer speech when candidate barges in
   */
  private handleBargeIn(): void {
    terminateInterviewerAudioSpeech();

    if (this.onBargeInCallback) {
      this.onBargeInCallback();
    }
  }

  /**
   * Stops audio monitoring and releases hardware media stream
   */
  destroy(): void {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    if (this.silenceTimer) {
      clearTimeout(this.silenceTimer);
      this.silenceTimer = null;
    }
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
      this.mediaStream = null;
    }
    if (this.audioContext) {
      try {
        this.audioContext.close();
      } catch {}
      this.audioContext = null;
    }
    this.isSpeaking = false;
    this.isTTSActive = false;
  }
}
