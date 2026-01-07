'use client';

import React, { useState, useRef } from 'react';
import { Upload, Link, FileText, X, Loader2 } from 'lucide-react';

interface UploadAreaProps {
  onUploadComplete: (sessionId: string, source: string) => void;
}

export default function UploadArea({ onUploadComplete }: UploadAreaProps) {
  const [activeTab, setActiveTab] = useState<'pdf' | 'url'>('pdf');
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [url, setUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (uploadedFile: File) => {
    if (uploadedFile.type === 'application/pdf') {
      setFile(uploadedFile);
      setError('');
    } else {
      setError('Only PDF files are supported.');
    }
  };

  const handleUrlSubmit = async () => {
    if (!url) return;
    setIsUploading(true);
    setError('');
    
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/upload-url`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Failed to process URL');
      
      onUploadComplete(data.session_id, data.source);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileSubmit = async () => {
    if (!file) return;
    setIsUploading(true);
    setError('');
    
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/upload`, {
        method: 'POST',
        body: formData,
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Failed to upload file');
      
      onUploadComplete(data.session_id, data.filename);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6 shadow-2xl">
      <div className="flex space-x-4 mb-6">
        <button
          onClick={() => setActiveTab('pdf')}
          className={`flex-1 py-3 px-4 rounded-xl flex items-center justify-center transition-all duration-300 ${
            activeTab === 'pdf' 
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' 
              : 'bg-white/5 text-gray-400 hover:bg-white/10'
          }`}
        >
          <Upload className="w-5 h-5 mr-2" />
          <span>Upload PDF</span>
        </button>
        <button
          onClick={() => setActiveTab('url')}
          className={`flex-1 py-3 px-4 rounded-xl flex items-center justify-center transition-all duration-300 ${
            activeTab === 'url' 
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30' 
              : 'bg-white/5 text-gray-400 hover:bg-white/10'
          }`}
        >
          <Link className="w-5 h-5 mr-2" />
          <span>Paper URL</span>
        </button>
      </div>

      {activeTab === 'pdf' ? (
        <div className="space-y-4">
          <div 
            className={`relative border-2 border-dashed rounded-xl p-8 transition-all duration-300 ${
              dragActive ? 'border-blue-500 bg-blue-500/10' : 'border-gray-600 hover:border-gray-500 hover:bg-white/5'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              className="hidden"
              onChange={handleChange}
            />
            
            <div className="flex flex-col items-center justify-center text-center">
              {file ? (
                <div className="flex items-center space-x-3 p-4 bg-blue-500/20 rounded-lg border border-blue-500/50">
                  <FileText className="w-8 h-8 text-blue-400" />
                  <div className="text-left">
                    <p className="text-sm font-medium text-white">{file.name}</p>
                    <p className="text-xs text-gray-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                  <button 
                    onClick={(e) => { e.stopPropagation(); setFile(null); }}
                    className="p-1 hover:bg-red-500/20 rounded-full text-red-400 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <>
                  <div className="w-16 h-16 bg-gradient-to-tr from-blue-500 to-purple-500 rounded-full flex items-center justify-center mb-4 shadow-lg">
                    <Upload className="w-8 h-8 text-white" />
                  </div>
                  <p className="text-gray-300 mb-2">Drag & drop your research paper here</p>
                  <p className="text-sm text-gray-500 mb-4">or click to browse files</p>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors border border-white/10"
                  >
                    Select File
                  </button>
                </>
              )}
            </div>
          </div>
          
          {file && (
            <button
              onClick={handleFileSubmit}
              disabled={isUploading}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-medium shadow-lg hover:shadow-blue-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" /> Processing...
                </>
              ) : (
                'Start Analysis'
              )}
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm text-gray-400 ml-1">Research Paper URL</label>
            <input 
              type="url" 
              placeholder="https://arxiv.org/pdf/..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
            />
          </div>
          <button 
            onClick={handleUrlSubmit}
            disabled={!url || isUploading}
            className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-medium shadow-lg hover:shadow-purple-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isUploading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" /> Processing...
              </>
            ) : (
              'Fetch & Analyze'
            )}
          </button>
        </div>
      )}

      {error && (
        <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 text-red-200 text-sm rounded-lg flex items-center">
          <Loader2 className="w-4 h-4 mr-2 text-red-500" />
          {error}
        </div>
      )}
    </div>
  );
}
