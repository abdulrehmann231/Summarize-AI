'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, Loader2, Sparkles } from 'lucide-react';

export default function ChatInterface({ sessionId, sourceName, onReset }) {
  const [messages, setMessages] = useState([
    { role: 'ai', content: `Hello! I've analyzed **${sourceName}**. Ask me anything about it.` }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const question = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: question }]);
    setIsLoading(true);

    try {
      const res = await fetch('http://localhost:8000/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, session_id: sessionId }),
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Failed to get answer');
      
      setMessages(prev => [...prev, { role: 'ai', content: data.answer }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'ai', content: `Error: ${err.message}` }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col h-[600px] bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl shadow-2xl relative overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-white/10 flex justify-between items-center bg-black/20">
            <div className="flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-yellow-400" />
                <span className="text-gray-200 font-medium truncate max-w-xs">{sourceName}</span>
            </div>
            <button 
                onClick={onReset}
                className="text-xs text-gray-500 hover:text-white transition-colors"
            >
                Change Document
            </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
            {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`flex max-w-[80%] ${msg.role === 'user' ? 'flex-row-reverse space-x-reverse' : 'flex-row'} space-x-3`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                            msg.role === 'user' 
                                ? 'bg-gradient-to-br from-blue-500 to-cyan-500' // User avatar
                                : 'bg-gradient-to-br from-purple-500 to-pink-500' // AI avatar
                        }`}>
                            {msg.role === 'user' ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-white" />}
                        </div>
                        <div className={`p-4 rounded-2xl ${
                            msg.role === 'user'
                                ? 'bg-blue-600/20 border border-blue-500/30 text-white rounded-tr-sm'
                                : 'bg-white/5 border border-white/10 text-gray-100 rounded-tl-sm'
                        }`}>
                            <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                        </div>
                    </div>
                </div>
            ))}
            {isLoading && (
                <div className="flex justify-start">
                     <div className="flex flex-row space-x-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                            <Bot className="w-4 h-4 text-white" />
                        </div>
                        <div className="bg-white/5 border border-white/10 px-4 py-3 rounded-2xl rounded-tl-sm flex items-center space-x-2">
                            <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce delay-75"></div>
                            <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce delay-150"></div>
                        </div>
                    </div>
                </div>
            )}
            <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-white/10 bg-black/20">
            <form onSubmit={handleSend} className="relative">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask a question about the paper..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-4 pr-12 py-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
                />
                <button
                    type="submit"
                    disabled={!input.trim() || isLoading}
                    className="absolute right-2 top-2 p-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Send className="w-5 h-5" />
                </button>
            </form>
        </div>
    </div>
  );
}
