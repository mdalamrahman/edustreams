/**
 * SDETube Speech & Audio Engine
 * Provides resilient Web Speech API Speech-to-Text (Voice Recognition)
 * and natural Text-to-Speech (AI Voice Readout) for interactive discussions.
 */

// Clean markdown, code blocks, URLs, and symbols for natural voice synthesis
export function cleanTextForSpeech(text: string): string {
  if (!text) return '';
  return text
    // Replace markdown code blocks with summary
    .replace(/```[a-zA-Z0-9_-]*\n([\s\S]*?)```/g, ' Code snippet provided. ')
    // Replace inline code `xyz` with xyz
    .replace(/`([^`]+)`/g, '$1')
    // Remove markdown headers
    .replace(/^#+\s+/gm, '')
    // Remove bold/italics
    .replace(/[*_]{1,3}([^*_]+)[*_]{1,3}/g, '$1')
    // Remove URLs
    .replace(/https?:\/\/[^\s]+/g, '')
    // Remove emojis / symbols that cause speech glitches
    .replace(/[^\w\s.,?!'"-:;()[\]{}]/gu, ' ')
    // Normalize spaces
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Checks if Speech Recognition is supported in the current browser.
 */
export function isSpeechRecognitionSupported(): boolean {
  if (typeof window === 'undefined') return false;
  return Boolean((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);
}

/**
 * Checks if Speech Synthesis is supported in the current browser.
 */
export function isSpeechSynthesisSupported(): boolean {
  if (typeof window === 'undefined') return false;
  return Boolean(window.speechSynthesis);
}

let activeRecognitionInstance: any = null;

/**
 * Starts speech recognition to transcribe user voice into text.
 */
export function startSpeechRecognition(options: {
  onTranscript: (transcript: string, isFinal: boolean) => void;
  onError?: (error: any) => void;
  onEnd?: () => void;
  lang?: string;
  continuous?: boolean;
}): () => void {
  if (!isSpeechRecognitionSupported()) {
    options.onError?.('Speech recognition is not supported in this browser.');
    return () => {};
  }

  try {
    if (activeRecognitionInstance) {
      try { activeRecognitionInstance.stop(); } catch {}
      activeRecognitionInstance = null;
    }

    const SpeechRecognitionClass = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognitionClass();
    recognition.lang = options.lang || 'en-GB';
    recognition.interimResults = true;
    recognition.continuous = options.continuous ?? false;
    recognition.maxAlternatives = 1;

    let finalTranscript = '';

    recognition.onresult = (event: any) => {
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
          options.onTranscript(finalTranscript.trim(), true);
        } else {
          interim += event.results[i][0].transcript;
          options.onTranscript((finalTranscript + ' ' + interim).trim(), false);
        }
      }
    };

    recognition.onerror = (event: any) => {
      if (event.error !== 'no-speech' && event.error !== 'aborted') {
        console.warn('[Speech Recognition Error]:', event.error);
        options.onError?.(event.error);
      }
    };

    recognition.onend = () => {
      activeRecognitionInstance = null;
      options.onEnd?.();
    };

    recognition.start();
    activeRecognitionInstance = recognition;

    return () => {
      try {
        recognition.stop();
      } catch {}
      activeRecognitionInstance = null;
    };
  } catch (err) {
    options.onError?.(err);
    return () => {};
  }
}

/**
 * Stops any active speech recognition.
 */
export function stopSpeechRecognition(): void {
  if (activeRecognitionInstance) {
    try {
      activeRecognitionInstance.stop();
    } catch {}
    activeRecognitionInstance = null;
  }
}

let activeUtterance: SpeechSynthesisUtterance | null = null;

/**
 * Speaks text using the browser's speech synthesis engine.
 */
export function speakText(
  rawText: string,
  options?: {
    onStart?: () => void;
    onEnd?: () => void;
    onError?: (err: any) => void;
    rate?: number;
    pitch?: number;
  }
): void {
  if (!isSpeechSynthesisSupported()) {
    options?.onError?.('Speech synthesis not supported');
    return;
  }

  stopSpeaking();

  const textToSpeak = cleanTextForSpeech(rawText);
  if (!textToSpeak) {
    options?.onEnd?.();
    return;
  }

  try {
    // Resume if paused
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.rate = options?.rate || 1.0; // Natural conversational British English speed
    utterance.pitch = options?.pitch || 1.0;
    utterance.lang = 'en-GB';

    // Pick a natural British English voice if available
    const voices = window.speechSynthesis.getVoices();
    const naturalVoice = voices.find(v => {
      const lang = (v.lang || '').replace('_', '-').toLowerCase();
      const name = v.name.toLowerCase();
      return lang === 'en-gb' || name.includes('united kingdom') || name.includes('uk english');
    }) || voices.find(v => (v.lang || '').startsWith('en'));

    if (naturalVoice) {
      utterance.voice = naturalVoice;
    }

    utterance.onstart = () => {
      options?.onStart?.();
    };

    utterance.onend = () => {
      activeUtterance = null;
      options?.onEnd?.();
    };

    utterance.onerror = (e) => {
      activeUtterance = null;
      if (e.error !== 'interrupted' && e.error !== 'canceled') {
        console.warn('[Speech Synthesis Error]:', e);
        options?.onError?.(e);
      }
      options?.onEnd?.();
    };

    activeUtterance = utterance;
    window.speechSynthesis.speak(utterance);
  } catch (err) {
    console.warn('[Speech Synthesis Exception]:', err);
    options?.onError?.(err);
    options?.onEnd?.();
  }
}

/**
 * Stops active speech synthesis immediately.
 */
export function stopSpeaking(): void {
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    try {
      window.speechSynthesis.cancel();
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }
    } catch {}
  }
  activeUtterance = null;
}

/**
 * Checks if the browser is currently speaking audio.
 */
export function isSpeaking(): boolean {
  if (typeof window === 'undefined' || !window.speechSynthesis) return false;
  return window.speechSynthesis.speaking;
}
