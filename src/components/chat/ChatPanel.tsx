import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Send } from 'lucide-react';
import { useChatStore } from '../../stores/useChatStore';
import { ChatMessageBubble } from './ChatMessage';
import type { ChatMessage } from './ChatMessage';

export function ChatPanel({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const messages = useChatStore((s) => s.messages) as ChatMessage[];
  const isTyping = useChatStore((s) => s.isTyping);
  const sendMessage = useChatStore((s) => s.sendMessage);

  // Auto-scroll to bottom when messages change or typing starts
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  // Focus input when panel opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    sendMessage(trimmed);
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: 0.2 } }}
            exit={{ opacity: 0, transition: { duration: 0.15 } }}
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            className="relative w-full max-w-lg bg-gray-50 rounded-t-3xl flex flex-col"
            style={{ height: '70dvh' }}
            initial={{ y: '100%' }}
            animate={{ y: 0, transition: { type: 'spring', stiffness: 300, damping: 30 } }}
            exit={{ y: '100%', transition: { duration: 0.2 } }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200 bg-white rounded-t-3xl flex-shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                  <Sparkles size={14} className="text-white" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-gray-900">Spark</h2>
                  <p className="text-[10px] text-gray-400">Your ADHD coach</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X size={18} className="text-gray-400" />
              </button>
            </div>

            {/* Messages */}
            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto px-4 py-3 space-y-3"
            >
              {messages.length === 0 && !isTyping && (
                <div className="flex flex-col items-center justify-center h-full text-center px-6">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center mb-3">
                    <Sparkles size={20} className="text-amber-500" />
                  </div>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    Hey! I'm Spark, your ADHD coach. Ask me anything — task
                    priorities, calendar sync, or just need a pep talk.
                  </p>
                </div>
              )}

              {messages.map((msg, i) => (
                <ChatMessageBubble key={i} message={msg} />
              ))}

              {/* Typing indicator */}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="flex items-center gap-1 px-3 py-2 bg-white border border-gray-100 rounded-2xl rounded-bl-md shadow-sm">
                    <motion.span
                      className="w-1.5 h-1.5 rounded-full bg-amber-400"
                      animate={{ y: [0, -4, 0] }}
                      transition={{ duration: 0.5, repeat: Infinity, delay: 0 }}
                    />
                    <motion.span
                      className="w-1.5 h-1.5 rounded-full bg-amber-400"
                      animate={{ y: [0, -4, 0] }}
                      transition={{ duration: 0.5, repeat: Infinity, delay: 0.15 }}
                    />
                    <motion.span
                      className="w-1.5 h-1.5 rounded-full bg-amber-400"
                      animate={{ y: [0, -4, 0] }}
                      transition={{ duration: 0.5, repeat: Infinity, delay: 0.3 }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Input bar */}
            <div className="flex items-center gap-2 px-4 py-3 border-t border-gray-200 bg-white flex-shrink-0 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask Spark anything..."
                className="flex-1 px-4 py-2.5 bg-gray-50 rounded-xl text-sm border border-gray-200 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-100"
              />
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={handleSend}
                disabled={!input.trim()}
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-amber-500 text-white disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
              >
                <Send size={16} />
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
