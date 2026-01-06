'use client';

import { useState } from "react";
import UploadArea from "../components/UploadArea";
import ChatInterface from "../components/ChatInterface";
import { Sparkles } from "lucide-react";

interface Session {
  id: string;
  source: string;
}

export default function Home() {
  const [session, setSession] = useState<Session | null>(null);

  const handleUploadComplete = (sessionId: string, source: string) => {
    setSession({ id: sessionId, source });
  };

  const handleReset = () => {
    setSession(null);
  };

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white selection:bg-purple-500/30 relative">
      {/* Background Gradients */}
      <div className="fixed inset-0 z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-purple-900/20 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-blue-900/20 rounded-full blur-[120px] pointer-events-none"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8 min-h-screen flex flex-col">
        {/* Header */}
        <header className="flex items-center justify-between mb-12">
            <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg">
                    <Sparkles className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                    ResearchCore
                </h1>
            </div>
            <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-500">v1.0.0</span>
            </div>
        </header>

        {/* Content */}
        <div className="flex-1 flex flex-col items-center justify-center">
            {!session ? (
                <div className="w-full max-w-4xl animate-in fade-in slide-in-from-bottom-8 duration-700">
                    <div className="text-center mb-12 space-y-4">
                        <h2 className="text-5xl font-bold tracking-tight">
                            Chat with your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Research</span>
                        </h2>
                        <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                            Upload a paper or paste a URL to instantly extract insights, summaries, and answers strictly grounded in the text.
                        </p>
                    </div>
                    <UploadArea onUploadComplete={handleUploadComplete} />
                </div>
            ) : (
                <div className="w-full animate-in fade-in zoom-in duration-500">
                    <ChatInterface 
                        sessionId={session.id} 
                        sourceName={session.source} 
                        onReset={handleReset} 
                    />
                </div>
            )}
        </div>
      </div>
    </main>
  );
}
