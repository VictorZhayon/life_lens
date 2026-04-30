import { useState, useRef, useEffect } from 'react';
import { useReviews } from '../../hooks/useReviews';
import { chatWithLifeLens } from '../../services/gemini';

export default function AskLifeLens() {
  const { reviews } = useReviews();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const chatEndRef = useRef(null);

  const suggestions = [
    "What's my strongest life area?",
    "Which area has improved the most?",
    "What should I focus on next week?",
    "Give me a motivational summary of my journey"
  ];

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const sendMessage = async (text) => {
    if (!text.trim() || loading) return;
    const userMsg = { role: 'user', text: text.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    setError(null);

    try {
      const history = messages.map(m => ({ role: m.role, text: m.text }));
      const response = await chatWithLifeLens(text, reviews, history);
      setMessages(prev => [...prev, { role: 'assistant', text: response }]);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => { e.preventDefault(); sendMessage(input); };

  return (
    <div className="max-w-3xl mx-auto flex flex-col" style={{ height: 'calc(100vh - 10rem)' }}>
      <h1 className="text-2xl font-bold text-slate-100 mb-2">Ask LifeLens</h1>
      <p className="text-slate-400 text-sm mb-4">Chat with AI about your review history and progress.</p>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
        {messages.length === 0 && (
          <div className="text-center py-12 space-y-6">
            <p className="text-4xl">💬</p>
            <p className="text-slate-400">Ask me anything about your life reviews!</p>
            <div className="flex flex-wrap justify-center gap-2">
              {suggestions.map(s => (
                <button key={s} onClick={() => sendMessage(s)}
                  className="px-3 py-2 bg-slate-800/60 border border-slate-700 rounded-xl text-xs text-slate-300 hover:border-indigo-500/50 hover:text-indigo-400 transition-all">
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed
              ${msg.role === 'user'
                ? 'bg-indigo-500 text-white rounded-br-md'
                : 'bg-slate-800/60 text-slate-200 border border-slate-700 rounded-bl-md'}`}>
              <p className="whitespace-pre-wrap">{msg.text}</p>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-slate-800/60 border border-slate-700 rounded-2xl rounded-bl-md px-4 py-3">
              <div className="flex gap-1.5">
                <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-center">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input id="chat-input" type="text" value={input}
          onChange={(e) => setInput(e.target.value)} disabled={loading}
          placeholder="Ask about your progress, trends, or get advice..."
          className="flex-1 bg-slate-800/60 border border-slate-700 rounded-xl px-4 py-3
            text-slate-200 placeholder-slate-600 text-sm
            focus:outline-none focus:ring-2 focus:ring-indigo-500/50 disabled:opacity-50" />
        <button type="submit" disabled={loading || !input.trim()}
          className="px-5 py-3 bg-indigo-500 text-white rounded-xl font-medium text-sm
            hover:bg-indigo-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
          Send
        </button>
      </form>
    </div>
  );
}
