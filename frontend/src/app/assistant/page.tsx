'use client';

import { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, Bot, User, Compass } from 'lucide-react';
import { chatWithMusafir } from '@/lib/api';

const QUICK_PROMPTS = [
  'Is Babusar Pass currently open for travel?',
  'What should I budget for 5 days in Hunza?',
  'What local specialties should I try in Skardu?',
  'Do I need a 4x4 Jeep for Fairy Meadows?',
];

export default function AssistantPage() {
  const [messages, setMessages] = useState<Array<{ sender: 'user' | 'bot'; text: string }>>([
    {
      sender: 'bot',
      text: 'Assalam-o-Alaikum! I am Musafir.ai, your Pakistani travel companion and frontier guide. Ask me about Karakoram routes, high-altitude passes, seasonal packing, weather alerts, or realistic PKR budgeting!',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendQuery = async (queryText: string) => {
    if (!queryText.trim() || loading) return;

    setInput('');
    setMessages((prev) => [...prev, { sender: 'user', text: queryText }]);
    setLoading(true);

    try {
      const res = await chatWithMusafir(queryText);
      setMessages((prev) => [...prev, { sender: 'bot', text: res.reply }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'bot',
          text: 'Sorry, I am having trouble connecting to the travel intelligence service right now. Please verify backend connection!',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendQuery(input);
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#2D4A34] text-white flex items-center justify-center shadow-md">
            <Sparkles className="w-6 h-6 text-[#A3E635]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-serif font-bold text-stone-900">Musafir.ai</h1>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-[#2D4A34] text-[#A3E635] px-2.5 py-0.5 rounded-full">
                Live AI Companion
              </span>
            </div>
            <p className="text-xs text-stone-600 mt-0.5">
              Instant localized mountain guidance, passes status, and travel insights across Pakistan
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-stone-500 bg-white px-3 py-1.5 rounded-full border border-stone-200 shadow-sm self-start sm:self-auto">
          <Compass className="w-4 h-4 text-[#2D4A34]" />
          <span>Local Intel &amp; PKR Advice</span>
        </div>
      </div>

      {/* Quick Prompts */}
      <div className="flex flex-wrap gap-2">
        {QUICK_PROMPTS.map((prompt) => (
          <button
            key={prompt}
            onClick={() => sendQuery(prompt)}
            disabled={loading}
            className="text-xs bg-white hover:bg-[#EAF0EA] text-[#2D4A34] font-medium px-3.5 py-2 rounded-2xl border border-stone-200 shadow-sm transition disabled:opacity-50 text-left cursor-pointer"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Chat Container */}
      <div className="bg-white rounded-[2.5rem] border border-stone-200 shadow-lg p-6 sm:p-8 h-[540px] flex flex-col justify-between">
        <div className="overflow-y-auto space-y-4 pr-3">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex gap-3 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {m.sender === 'bot' && (
                <div className="w-8 h-8 rounded-xl bg-[#2D4A34] text-white flex items-center justify-center shrink-0 mt-1 shadow-sm">
                  <Bot className="w-4 h-4 text-[#A3E635]" />
                </div>
              )}
              <div
                className={`p-4 sm:p-5 rounded-2xl max-w-lg text-sm leading-relaxed ${
                  m.sender === 'user'
                    ? 'bg-[#2D4A34] text-white rounded-br-none shadow-sm'
                    : 'bg-stone-50 text-stone-800 rounded-bl-none border border-stone-100 shadow-sm'
                }`}
              >
                {m.text}
              </div>
              {m.sender === 'user' && (
                <div className="w-8 h-8 rounded-xl bg-stone-200 text-stone-700 flex items-center justify-center shrink-0 mt-1 shadow-sm">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}
          {loading && (
            <div className="flex items-center gap-2 text-xs text-stone-500 italic pl-11">
              <Sparkles className="w-3.5 h-3.5 animate-spin text-[#2D4A34]" /> Musafir.ai is thinking...
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSubmit} className="mt-4 flex gap-2 pt-3 border-t border-stone-100">
          <input
            type="text"
            placeholder="Ask about mountain roads, local food, fuel costs, permits..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
            className="flex-1 bg-stone-50 border border-stone-200 rounded-2xl px-5 py-3.5 text-sm text-stone-900 focus:outline-none focus:border-[#2D4A34]"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="px-6 py-3.5 bg-[#2D4A34] hover:bg-[#3F5E43] text-white font-semibold rounded-2xl flex items-center justify-center transition shadow disabled:opacity-50 cursor-pointer"
          >
            <Send className="w-4 h-4 text-[#A3E635]" />
          </button>
        </form>
      </div>
    </div>
  );
}
