 import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, Code2, BarChart2, RefreshCw, Copy, Check, X } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useQuery } from '@tanstack/react-query';
import { aiAPI } from '@/services/api';
import toast from 'react-hot-toast';

const MODES = [
  { id: 'teacher', label: '👨‍🏫 Teacher', desc: 'Step-by-step explanations' },
  { id: 'interviewer', label: '👔 Interviewer', desc: 'Strict FAANG-style' },
  { id: 'hint', label: '💡 Hint Mode', desc: 'Guided discovery' },
  { id: 'debug', label: '🔍 Debug', desc: 'Code review & bugs' }
];

const QUICK_PROMPTS = [
  'Explain Binary Search with code',
  'Solve Two Sum — hash map approach',
  'What is Dynamic Programming?',
  'Explain BFS vs DFS',
  'Time complexity of Quick Sort',
  'Explain the STAR interview method'
];

const INITIAL_AI_MSG = {
  role: 'assistant',
  content: `Hello! I'm your NeuralPath AI Tutor 🤖\n\nI can help you with:\n• **DSA concepts** — algorithms, data structures, complexity\n• **Aptitude problems** — step-by-step solutions & tricks\n• **Interview prep** — HR questions, system design\n• **Code review** — debug & optimize your code\n\nWhat would you like to learn today?`,
  timestamp: new Date()
};

function MessageContent({ content }) {
  const lines = content.split('\n');
  return (
    <div className="space-y-1 text-sm leading-relaxed">
      {lines.map((line, i) => {
        if (line.startsWith('```')) return null;
        if (line.startsWith('**') && line.endsWith('**')) {
          return <p key={i} className="font-semibold text-primary">{line.replace(/\*\*/g, '')}</p>;
        }
        if (line.startsWith('• ') || line.startsWith('- ')) {
          return <div key={i} className="flex gap-2"><span className="text-accent mt-0.5">•</span><span>{line.slice(2)}</span></div>;
        }
        if (line.match(/^\d+\./)) {
          return <div key={i} className="flex gap-2"><span className="text-cyan-400 font-mono text-xs mt-0.5">{line.split('.')[0]}.</span><span>{line.split('.').slice(1).join('.').trim()}</span></div>;
        }
        if (line.startsWith('# ')) return <p key={i} className="font-bold text-base">{line.slice(2)}</p>;
        if (line.trim() === '') return <div key={i} className="h-1" />;
        const parts = line.split(/`([^`]+)`/);
        if (parts.length > 1) {
          return (
            <p key={i} className="break-words">
              {parts.map((p, j) => j % 2 === 0
                ? p
                : <code key={j} className="bg-surface px-1.5 py-0.5 rounded text-cyan-400 font-mono text-xs break-all">{p}</code>
              )}
            </p>
          );
        }
        return <p key={i} className="break-words">{line}</p>;
      })}
    </div>
  );
}

function CodePanelContent({ codeContent, copied, copyCode }) {
  return (
    <>
      <div className="p-3 border-b border-surface flex items-center justify-between">
        <div className="text-xs font-semibold text-accent flex items-center gap-1.5">
          <Code2 size={13} /> Code Playground
        </div>
        <button onClick={copyCode} className="p-1.5 hover:bg-surface3 rounded text-secondary hover:text-primary transition-colors">
          {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
        </button>
      </div>
      <div className="flex-1 overflow-auto">
        <pre className="code-block rounded-none border-0 text-xs h-full m-0 leading-relaxed whitespace-pre-wrap break-words">
          <code className="text-secondary">{codeContent}</code>
        </pre>
      </div>

      <div className="p-3 border-t border-surface">
        <div className="text-xs font-semibold text-amber-400 mb-2 flex items-center gap-1.5">
          <BarChart2 size={13} /> AI Analysis
        </div>
        <div className="space-y-2">
          {[
            { l: 'Time Complexity', v: 'O(log n)', c: 'text-emerald-400' },
            { l: 'Space Complexity', v: 'O(1)', c: 'text-emerald-400' },
            { l: 'Approach', v: 'Divide & Conquer', c: 'text-cyan-400' },
            { l: 'Difficulty', v: 'Easy', c: 'text-amber-400' }
          ].map(a => (
            <div key={a.l} className="flex justify-between text-xs border-b border-surface pb-1.5">
              <span className="text-muted">{a.l}</span>
              <span className={`font-semibold ${a.c}`}>{a.v}</span>
            </div>
          ))}
        </div>
        <div className="mt-3 text-[11px] text-muted leading-relaxed">
          💡 <span className="text-secondary">Binary search requires sorted input. Always verify the array is sorted before applying.</span>
        </div>
      </div>
    </>
  );
}

export default function AITutor() {
  const { user } = useAuthStore();
  const { problemId } = useParams();
  const [mode, setMode] = useState('teacher');
  const [messages, setMessages] = useState([INITIAL_AI_MSG]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [showCodePanel, setShowCodePanel] = useState(false);
  const [codeContent, setCodeContent] = useState(`// AI will generate code here\n// Ask me to explain any algorithm!\n\nfunction binarySearch(arr, target) {\n  let left = 0, right = arr.length - 1;\n  while (left <= right) {\n    const mid = Math.floor((left + right) / 2);\n    if (arr[mid] === target) return mid;\n    if (arr[mid] < target) left = mid + 1;\n    else right = mid - 1;\n  }\n  return -1;\n}`);
  const [copied, setCopied] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const abortRef = useRef(null);

  const { data: usage } = useQuery({
    queryKey: ['ai-usage'],
    queryFn: () => aiAPI.getUsage().then(r => r.data.usage),
    refetchInterval: 30000
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = useCallback(async (text) => {
    const msg = text || input.trim();
    if (!msg || isStreaming) return;

    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: msg, timestamp: new Date() }]);

    const streamId = Date.now();
    setMessages(prev => [...prev, { role: 'assistant', content: '', timestamp: new Date(), streaming: true, id: streamId }]);
    setIsStreaming(true);

    try {
      const token = JSON.parse(localStorage.getItem('neuralpath-auth') || '{}')?.state?.token;
      const ctrl = new AbortController();
      abortRef.current = ctrl;

      const res = await fetch(`${import.meta.env.VITE_API_URL || '/api'}/ai/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          message: msg,
          mode,
          sessionId,
          conversationHistory: messages.slice(-8).map(m => ({ role: m.role, content: m.content })),
          problemId
        }),
        signal: ctrl.signal
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'AI request failed');
      }
      const data = await res.json();

      setMessages(prev =>
        prev.map(m =>
          m.id === streamId
            ? { ...m, content: data.response, streaming: false }
            : m
        )
      );

      if (data.sessionId && !sessionId) {
        setSessionId(data.sessionId);
      }
      const codeMatch = data.response.match(
        /```(?:javascript|python|java|cpp)?\n([\s\S]+?)```/
      );

      if (codeMatch) {
        setCodeContent(codeMatch[1]);
      }
      setMessages(prev => prev.map(m => m.id === streamId ? { ...m, streaming: false } : m));
    } catch (err) {
      if (err.name === 'AbortError') return;

      const fallbacks = {
        teacher: `Great question! Let me explain this step by step...\n\nBased on your query about **"${msg}"**:\n\n1. **Core Concept**: Understanding the fundamental approach\n2. **Algorithm**: Step-by-step process\n3. **Complexity**: Time and space analysis\n4. **Practice**: Related problems\n\nWant me to generate practice problems on this topic? 🚀`,
        interviewer: `[Interview Mode]\n\nInteresting question. Let me evaluate your understanding...\n\n**Score: 7/10**\n\n**Strengths**: You've shown awareness of the problem\n**Improvements**: Work on explaining the algorithmic approach\n\n**Follow-up**: Can you explain the time complexity?`,
        hint: `💡 **Hint 1**: Think about the data structure that allows O(1) lookup...\n\nDon't give up! What data structure can store key-value pairs efficiently?`,
        debug: `🔍 **Code Analysis**:\n\n**Issues found**: Check edge cases for empty input\n**Optimization**: Consider using a Map instead of nested loops\n**Complexity**: Current O(n²) can be reduced to O(n)`
      };

      const fallback = fallbacks[mode] || fallbacks.teacher;
      setMessages(prev => prev.map(m =>
        m.id === streamId ? { ...m, content: fallback, streaming: false } : m
      ));

      const errMsg = err.message || 'AI error';
      if (errMsg.includes('limit')) toast.error(errMsg);
    } finally {
      setIsStreaming(false);
    }
  }, [input, mode, messages, sessionId, problemId, isStreaming]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([INITIAL_AI_MSG]);
    setSessionId(null);
  };

  const copyCode = () => {
    navigator.clipboard.writeText(codeContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('Code copied!');
  };

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden relative">
      {/* Chat panel */}
      <div className="flex-1 flex flex-col bg-surface2 border-r border-surface min-w-0">
        {/* Header */}
        <div className="px-3 sm:px-4 py-3 border-b border-surface flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-br from-accent to-cyan-500 flex items-center justify-center text-base sm:text-lg flex-shrink-0">🤖</div>
            <div className="min-w-0">
              <div className="text-sm font-semibold truncate">NeuralPath AI Tutor</div>
              <div className="text-[10px] sm:text-xs text-emerald-400 truncate">
                ● Online · {usage?.remaining === 'unlimited' ? 'Unlimited' : `${usage?.remaining || 0} left`}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            {/* Mobile-only button to open code panel */}
            <button
              onClick={() => setShowCodePanel(true)}
              className="lg:hidden p-2 hover:bg-surface3 rounded-lg text-secondary hover:text-primary transition-colors"
              title="Open Code Playground"
            >
              <Code2 size={16} />
            </button>
            <button onClick={clearChat} className="p-2 hover:bg-surface3 rounded-lg text-secondary hover:text-primary transition-colors">
              <RefreshCw size={14} />
            </button>
          </div>
        </div>

        {/* Mode selector */}
        <div className="px-3 sm:px-4 py-2 border-b border-surface flex gap-1.5 overflow-x-auto">
          {MODES.map(m => (
            <button
              key={m.id}
              onClick={() => setMode(m.id)}
              title={m.desc}
              className={`px-2.5 sm:px-3 py-1.5 rounded-full text-[11px] sm:text-xs font-medium whitespace-nowrap transition-all flex-shrink-0 ${
                mode === m.id
                  ? 'bg-accent/20 border border-accent/40 text-accent'
                  : 'border border-surface text-secondary hover:text-primary'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-4">
          <AnimatePresence initial={false}>
            {messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' && (
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-accent to-cyan-500 flex items-center justify-center text-sm flex-shrink-0 mt-1 mr-2">🤖</div>
                )}
                <div className={`max-w-[85%] sm:max-w-[80%] px-3 sm:px-4 py-2.5 sm:py-3 rounded-2xl ${
                  msg.role === 'user'
                    ? 'bg-gradient-to-br from-accent to-accent-2 text-white rounded-br-sm'
                    : 'bg-surface3 border border-surface text-primary rounded-bl-sm'
                }`}>
                  {msg.role === 'assistant' && (
                    <div className="text-[10px] text-accent font-semibold mb-1.5 flex items-center gap-1">
                      <Bot size={10} /> NeuralPath AI
                    </div>
                  )}
                  {msg.streaming && msg.content === '' ? (
                    <div className="flex gap-1 py-1">
                      {[0, 1, 2].map(i => (
                        <div key={i} className="w-1.5 h-1.5 rounded-full bg-slate-500 typing-dot" style={{ animationDelay: `${i * 0.2}s` }} />
                      ))}
                    </div>
                  ) : (
                    <MessageContent content={msg.content} />
                  )}
                  {msg.streaming && msg.content && (
                    <span className="inline-block w-0.5 h-4 bg-accent ml-0.5 animate-pulse" />
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>

        {/* Quick prompts */}
        <div className="px-3 sm:px-4 py-2 border-t border-surface flex gap-1.5 overflow-x-auto">
          {QUICK_PROMPTS.map(p => (
            <button
              key={p}
              onClick={() => sendMessage(p)}
              disabled={isStreaming}
              className="px-2.5 py-1 bg-surface3 border border-surface rounded-full text-[11px] text-secondary hover:text-primary hover:border-accent/40 whitespace-nowrap transition-all flex-shrink-0"
            >
              {p}
            </button>
          ))}
        </div>

        {/* Input */}
        <div className="p-3 sm:p-4 border-t border-surface">
          <div className="flex gap-2 items-end">
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask me anything..."
              rows={1}
              className="flex-1 input resize-none max-h-32 py-2.5 min-w-0 text-sm"
              style={{ minHeight: '42px' }}
              onInput={e => {
                e.target.style.height = 'auto';
                e.target.style.height = Math.min(e.target.scrollHeight, 128) + 'px';
              }}
            />
            <button
              onClick={() => sendMessage()}
              disabled={isStreaming || !input.trim()}
              className="btn-primary h-[42px] px-3 disabled:opacity-40 flex-shrink-0"
            >
              <Send size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* Code panel — desktop (inline) */}
      <div className="w-80 flex-col border-l border-surface hidden lg:flex">
        <CodePanelContent codeContent={codeContent} copied={copied} copyCode={copyCode} />
      </div>

      {/* Code panel — mobile (bottom sheet overlay) */}
      <AnimatePresence>
        {showCodePanel && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCodePanel(false)}
              className="lg:hidden fixed inset-0 bg-black/60 z-40"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'tween', duration: 0.25 }}
              className="lg:hidden fixed bottom-0 left-0 right-0 h-[75vh] bg-surface2 border-t border-surface z-50 flex flex-col rounded-t-2xl overflow-hidden"
            >
              <div className="flex items-center justify-end p-2 border-b border-surface">
                <button
                  onClick={() => setShowCodePanel(false)}
                  className="p-1.5 hover:bg-surface3 rounded text-secondary hover:text-primary"
                >
                  <X size={16} />
                </button>
              </div>
              <div className="flex-1 flex flex-col overflow-hidden">
                <CodePanelContent codeContent={codeContent} copied={copied} copyCode={copyCode} />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}