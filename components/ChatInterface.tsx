import React, { useState, useRef, useEffect } from 'react';
import type { ChatMessage } from '../types';
import { BotIcon, UserIcon, SendIcon } from '../constants';
import ChartComponent from './ChartComponent';

interface ChatInterfaceProps {
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  isLoading: boolean;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ messages, onSendMessage, isLoading }) => {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  const Message: React.FC<{ message: ChatMessage }> = ({ message }) => {
    const isBot = message.sender === 'bot';
    return (
      <div className={`flex items-start gap-3 my-4 ${isBot ? '' : 'justify-end'}`}>
        {isBot && <BotIcon />}
        <div className={`w-full max-w-xl p-4 rounded-lg ${isBot ? 'bg-gray-100 text-gray-800' : 'bg-blue-600 text-white'}`}>
          {message.isLoading ? (
            <div className="flex items-center justify-center">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s] mx-1"></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
            </div>
          ) : (
            <>
              {message.text && (
                 <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: message.text.replace(/\n/g, '<br />') }} />
              )}
              {message.chart && (
                <div className="mt-4 bg-gray-50 rounded-lg p-2">
                    <ChartComponent data={message.chart} />
                </div>
              )}
            </>
          )}
        </div>
        {!isBot && <UserIcon />}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm h-full flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800">Chat with your Data</h2>
      </div>
      <div className="flex-1 p-4 overflow-y-auto">
        {messages.map((msg) => (
          <Message key={msg.id} message={msg} />
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-4 border-t border-gray-200">
        <form onSubmit={handleSendMessage} className="flex items-center gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question about your data..."
            disabled={isLoading}
            className="flex-1 bg-gray-100 border border-gray-300 rounded-lg p-3 text-gray-800 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="bg-blue-600 text-white p-3 rounded-lg disabled:bg-gray-400 disabled:cursor-not-allowed hover:bg-blue-500 transition-colors"
          >
            <SendIcon />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatInterface;