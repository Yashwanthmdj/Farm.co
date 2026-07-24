import React, { useCallback, useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Send, Mic, Square, Sparkles } from 'lucide-react';
import { LanguageSwitcher } from '../components/ui';
import { ChatBubble, SuggestedPrompts, TypingIndicator } from '../components/chat';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useI18n } from '../context/I18nContext';
import { useSpeech } from '../hooks/useSpeech';
import { getChatHistory, sendMultilingualChat } from '../api/chat';

export default function Chat() {
  const { user } = useAuth();
  const toast = useToast();
  const { language, t } = useI18n();
  const userId = user?._id;

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(true);
  const scrollRef = useRef(null);
  const inputRef = useRef(null);

  const handleSpeechResult = useCallback((transcript) => {
    if (!transcript) return;
    setInput((prev) => {
      const next = prev ? `${prev.trim()} ${transcript}` : transcript;
      return next;
    });
    // Focus after React applies state
    setTimeout(() => inputRef.current?.focus(), 50);
    toast.success('Voice captured');
  }, [toast]);

  const { listening, interim, error: speechError, toggle, supported } = useSpeech({
    onResult: handleSpeechResult,
  });

  useEffect(() => {
    if (!userId) return;
    let active = true;
    (async () => {
      try {
        const history = await getChatHistory(userId);
        if (!active) return;
        const flattened = [];
        (history || [])
          .slice()
          .reverse()
          .forEach((h) => {
            flattened.push({ role: 'user', content: h.question });
            flattened.push({ role: 'assistant', content: h.answer });
          });
        setMessages(flattened);
      } catch (err) {
        /* ignore */
      } finally {
        if (active) setHistoryLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [userId]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, loading]);

  useEffect(() => {
    if (speechError) toast.error(speechError);
  }, [speechError, toast]);

  const sendMessage = async (text) => {
    const trimmed = (text ?? input).trim();
    if (!trimmed || loading) return;

    setMessages((prev) => [...prev, { role: 'user', content: trimmed }]);
    setInput('');
    setLoading(true);

    try {
      const data = await sendMultilingualChat({ userId, message: trimmed, language });
      const answer = data.translated_response || 'Sorry, I could not generate a response.';
      setMessages((prev) => [...prev, { role: 'assistant', content: answer }]);
    } catch (err) {
      const message =
        err.response?.data?.error ||
        'The AI assistant is currently unavailable. Please try again shortly.';
      setMessages((prev) => [...prev, { role: 'assistant', content: `⚠️ ${message}` }]);
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerate = () => {
    const lastUser = [...messages].reverse().find((m) => m.role === 'user');
    if (lastUser) {
      setMessages((prev) => prev.slice(0, -1));
      sendMessage(lastUser.content);
    }
  };

  const handleMicClick = async () => {
    await toggle(language);
  };

  const prompts = [t('prompt_1'), t('prompt_2'), t('prompt_3'), t('prompt_4')];
  const displayValue = listening && interim ? interim : input;

  return (
    <div className="chat-page">
      <div className="chat-header">
        <div style={{ minWidth: 0 }}>
          <h2 style={{ fontSize: 'clamp(18px, 3vw, 22px)' }}>{t('chat_title')}</h2>
          <p style={{ color: 'var(--muted)', fontSize: 13.5, marginTop: 4 }}>
            {listening
              ? 'Listening… speak now, then pause'
              : supported
                ? t('chat_subtitle')
                : 'Voice needs Chrome/Edge — you can still type.'}
          </p>
        </div>
        <LanguageSwitcher />
      </div>

      <motion.div
        ref={scrollRef}
        className="chat-panel glass"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div style={{ padding: 'clamp(14px, 3vw, 22px)' }}>
          {!historyLoading && messages.length === 0 && (
            <div style={{ textAlign: 'center', padding: '28px 10px' }}>
              <motion.div
                animate={{ rotate: [0, 8, -8, 0], scale: [1, 1.05, 1] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                style={{ display: 'inline-block', marginBottom: 12 }}
              >
                <Sparkles size={32} style={{ color: 'var(--primary)' }} />
              </motion.div>
              <h3 style={{ fontSize: 16, marginBottom: 6 }}>{t('chat_empty')}</h3>
              <SuggestedPrompts prompts={prompts} onSelect={sendMessage} />
            </div>
          )}

          {messages.map((m, i) => (
            <ChatBubble
              key={i}
              role={m.role}
              content={m.content}
              isLast={i === messages.length - 1 && m.role === 'assistant'}
              onRegenerate={handleRegenerate}
            />
          ))}

          {loading && <TypingIndicator />}
        </div>
      </motion.div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (listening) return;
          sendMessage();
        }}
        className="chat-composer"
      >
        <label htmlFor="chat-input" className="sr-only">
          {t('chat_placeholder')}
        </label>
        <motion.button
          type="button"
          onClick={handleMicClick}
          aria-label={listening ? t('chat_stop') : t('chat_mic')}
          title={listening ? 'Stop listening' : 'Click and speak'}
          whileTap={{ scale: 0.92 }}
          animate={listening ? { scale: [1, 1.1, 1] } : { scale: 1 }}
          transition={listening ? { repeat: Infinity, duration: 0.9 } : {}}
          className={`chat-mic-btn${listening ? ' recording' : ''}`}
        >
          {listening ? <Square size={17} /> : <Mic size={18} />}
        </motion.button>

        <input
          id="chat-input"
          ref={inputRef}
          type="text"
          value={displayValue}
          onChange={(e) => {
            if (!listening) setInput(e.target.value);
          }}
          placeholder={
            listening
              ? interim || 'Listening… speak clearly'
              : t('chat_placeholder')
          }
          readOnly={listening}
          className="chat-input"
          style={listening ? { borderColor: 'var(--error)', boxShadow: '0 0 0 4px rgba(239,68,68,0.15)' } : undefined}
        />
        <motion.button
          type="submit"
          disabled={loading || !input.trim() || listening}
          aria-label={t('chat_send')}
          whileHover={loading || !input.trim() ? {} : { scale: 1.05 }}
          whileTap={loading || !input.trim() ? {} : { scale: 0.95 }}
          className="chat-send-btn"
          style={{ opacity: loading || !input.trim() || listening ? 0.55 : 1 }}
        >
          <Send size={17} />
        </motion.button>
      </form>
    </div>
  );
}
