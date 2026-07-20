'use client';

import { useEffect, useRef, useState } from 'react';

const WELCOME = {
  role: 'assistant',
  content:
    "Hi! I'm Egay's Assistant 🪵 Ask me about our wood carvings, wooden trophies, name plates, styrofoam sculpture, or commissions.",
};

const SUGGESTIONS = [
  'What pieces are available?',
  'Do you take custom orders?',
  'Where are you located?',
];

export default function ChatBot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([WELCOME]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading, open]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  const send = async (text) => {
    const content = (text ?? input).trim();
    if (!content || loading) return;

    const next = [...messages, { role: 'user', content }];
    setMessages(next);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: next.filter((m) => m !== WELCOME) }),
      });
      const data = await res.json().catch(() => ({}));
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: res.ok
            ? data.reply
            : data.error || 'Sorry, something went wrong. Please try again.',
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Network error. Please try again.' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    send();
  };

  return (
    <>
      {/* Launcher button */}
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? 'Close chat' : 'Open chat assistant'}
        className="fixed bottom-5 right-5 z-50 h-14 w-14 rounded-full bg-ink text-paper
                   shadow-card-hover flex items-center justify-center hover:scale-105 active:scale-95
                   transition-transform"
      >
        {open ? (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        ) : (
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 11.5a8.38 8.38 0 0 1-8.5 8.5 8.5 8.5 0 0 1-3.6-.8L3 21l1.9-5.4A8.38 8.38 0 0 1 4 12a8.5 8.5 0 0 1 8.5-8.5A8.38 8.38 0 0 1 21 11.5z" />
          </svg>
        )}
      </button>

      {/* Chat panel */}
      {open && (
        <div
          className="fixed z-50 bottom-24 right-4 left-4 sm:left-auto sm:right-5 sm:w-96
                     max-h-[70vh] flex flex-col rounded-xl overflow-hidden shadow-card-hover
                     border border-ink/10 bg-paper animate-float-up"
        >
          {/* Header */}
          <div className="bg-ink text-paper px-4 py-3.5 flex items-center gap-3">
            <span className="h-9 w-9 rounded-full bg-brass text-ink flex items-center justify-center font-serif">
              E
            </span>
            <div className="leading-tight">
              <p className="font-serif text-base">Egay&apos;s Assistant</p>
              <p className="mt-0.5 text-[10px] uppercase tracking-label text-paper/50">
                Usually replies instantly
              </p>
            </div>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                    m.role === 'user'
                      ? 'bg-ink text-paper rounded-br-sm'
                      : 'bg-white text-ink/80 border border-ink/8 rounded-bl-sm'
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-white border border-ink/8 rounded-2xl rounded-bl-sm px-4 py-3">
                  <span className="flex gap-1">
                    <span className="h-1.5 w-1.5 bg-ink/30 rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <span className="h-1.5 w-1.5 bg-ink/30 rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <span className="h-1.5 w-1.5 bg-ink/30 rounded-full animate-bounce" />
                  </span>
                </div>
              </div>
            )}

            {/* Quick suggestions, shown only at the start */}
            {messages.length === 1 && !loading && (
              <div className="flex flex-wrap gap-2 pt-1">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    className="text-xs px-3 py-1.5 rounded-full border border-ink/12
                               text-ink/60 bg-white hover:border-ink hover:text-ink transition"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Composer */}
          <form onSubmit={handleSubmit} className="p-3 border-t border-ink/10 bg-white flex gap-2">
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about our woodwork..."
              className="flex-1 px-3 py-2 rounded-lg border border-ink/12 text-sm
                         focus:outline-none focus:border-brass focus:ring-1 focus:ring-brass/30"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              aria-label="Send message"
              className="h-10 w-10 flex-shrink-0 rounded-lg bg-ink text-paper
                         flex items-center justify-center hover:bg-brass hover:text-ink transition
                         disabled:opacity-40"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 2 11 13M22 2l-7 20-4-9-9-4 20-7z" />
              </svg>
            </button>
          </form>
        </div>
      )}
    </>
  );
}
