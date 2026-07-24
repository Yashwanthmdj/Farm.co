import { useCallback, useEffect, useRef, useState } from 'react';

const LANGUAGE_MAP = {
  en: 'en-IN',
  hi: 'hi-IN',
  te: 'te-IN',
  es: 'es-ES',
  fr: 'fr-FR',
  zh: 'zh-CN',
};

function getSpeechRecognitionCtor() {
  if (typeof window === 'undefined') return null;
  return window.SpeechRecognition || window.webkitSpeechRecognition || null;
}

/**
 * Reliable click-to-talk using the browser Web Speech API.
 *
 * Flow:
 *  1. Click mic → listening starts (red pulse)
 *  2. Speak → final transcript is delivered via onResult callback
 *  3. Auto-stops after speech ends (or click mic again to stop)
 */
export function useSpeech({ onResult } = {}) {
  const [listening, setListening] = useState(false);
  const [interim, setInterim] = useState('');
  const [error, setError] = useState('');
  const [supported, setSupported] = useState(true);

  const recognitionRef = useRef(null);
  const onResultRef = useRef(onResult);
  const intentionalStopRef = useRef(false);

  useEffect(() => {
    onResultRef.current = onResult;
  }, [onResult]);

  useEffect(() => {
    setSupported(!!getSpeechRecognitionCtor());
  }, []);

  const stop = useCallback(() => {
    intentionalStopRef.current = true;
    const rec = recognitionRef.current;
    if (rec) {
      try {
        rec.stop();
      } catch (e) {
        /* ignore */
      }
      try {
        rec.abort();
      } catch (e) {
        /* ignore */
      }
    }
    recognitionRef.current = null;
    setListening(false);
    setInterim('');
  }, []);

  const start = useCallback(
    async (language = 'en') => {
      setError('');
      setInterim('');
      intentionalStopRef.current = false;

      const Ctor = getSpeechRecognitionCtor();
      if (!Ctor) {
        setSupported(false);
        setError('Voice input needs Chrome or Edge. Please type your question instead.');
        return false;
      }

      // Warm up mic permission first — improves reliability in Chrome
      try {
        if (navigator.mediaDevices?.getUserMedia) {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          stream.getTracks().forEach((t) => t.stop());
        }
      } catch (err) {
        setError('Microphone permission denied. Allow the mic in your browser settings.');
        return false;
      }

      // Stop any previous instance
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {
          /* ignore */
        }
      }

      const recognition = new Ctor();
      recognitionRef.current = recognition;
      recognition.lang = LANGUAGE_MAP[language] || 'en-IN';
      recognition.interimResults = true;
      recognition.continuous = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setListening(true);
        setError('');
      };

      recognition.onresult = (event) => {
        let interimText = '';
        let finalText = '';

        for (let i = event.resultIndex; i < event.results.length; i += 1) {
          const result = event.results[i];
          const text = result?.[0]?.transcript || '';
          if (result.isFinal) {
            finalText += text;
          } else {
            interimText += text;
          }
        }

        if (interimText) setInterim(interimText.trim());

        if (finalText.trim()) {
          const transcript = finalText.trim();
          setInterim('');
          setListening(false);
          if (onResultRef.current) {
            onResultRef.current(transcript);
          }
        }
      };

      recognition.onerror = (event) => {
        setListening(false);
        setInterim('');
        const code = event.error;
        if (code === 'aborted' && intentionalStopRef.current) return;
        if (code === 'not-allowed' || code === 'service-not-allowed') {
          setError('Microphone access blocked. Allow mic permission and try again.');
        } else if (code === 'no-speech') {
          setError('No speech heard. Click the mic and speak clearly.');
        } else if (code === 'network') {
          setError('Speech network error. Check your internet connection.');
        } else if (code === 'aborted') {
          /* ignore */
        } else {
          setError(`Voice input error (${code}). Try again or type your question.`);
        }
      };

      recognition.onend = () => {
        setListening(false);
        recognitionRef.current = null;
      };

      try {
        recognition.start();
        return true;
      } catch (err) {
        setListening(false);
        setError('Could not start voice input. Try again.');
        return false;
      }
    },
    []
  );

  const toggle = useCallback(
    async (language = 'en') => {
      if (listening) {
        stop();
        return;
      }
      await start(language);
    },
    [listening, start, stop]
  );

  // Cleanup on unmount
  useEffect(() => () => stop(), [stop]);

  return {
    listening,
    recording: listening, // alias for older callers
    interim,
    error,
    supported,
    supportsBrowserSpeech: supported,
    start,
    stop,
    toggle,
    toggleRecording: toggle,
    languageCode: (lang) => LANGUAGE_MAP[lang] || 'en-IN',
  };
}

export default useSpeech;
