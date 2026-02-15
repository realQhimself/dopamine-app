import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export function ChatMessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === 'user';

  return (
    <motion.div
      className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
    >
      <div className={`max-w-[80%] ${isUser ? 'order-1' : 'order-1'}`}>
        {!isUser && (
          <div className="flex items-center gap-1 mb-0.5 ml-1">
            <Sparkles size={10} className="text-amber-500" />
            <span className="text-[10px] font-medium text-amber-600">Spark</span>
          </div>
        )}
        <div
          className={`px-3 py-2 rounded-2xl text-sm leading-relaxed ${
            isUser
              ? 'bg-amber-500 text-white rounded-br-md'
              : 'bg-white text-gray-800 border border-gray-100 shadow-sm rounded-bl-md'
          }`}
        >
          {message.content}
        </div>
        <span
          className={`text-[9px] text-gray-400 mt-0.5 block ${
            isUser ? 'text-right mr-1' : 'ml-1'
          }`}
        >
          {formatTime(message.timestamp)}
        </span>
      </div>
    </motion.div>
  );
}

function formatTime(timestamp: string): string {
  try {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  } catch {
    return '';
  }
}
