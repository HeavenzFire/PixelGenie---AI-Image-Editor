
import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { ImageUploader } from './components/ImageUploader';
import { Button } from './components/Button';
import { editImageWithGemini } from './services/geminiService';
import { EditHistoryItem } from './types';

const LOCAL_STORAGE_KEY = 'pixelgenie_session';

const App: React.FC = () => {
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [editedImage, setEditedImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<EditHistoryItem[]>([]);

  // Load state from localStorage on initial render
  useEffect(() => {
    try {
      const savedStateJSON = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (savedStateJSON) {
        const savedState = JSON.parse(savedStateJSON);
        setCurrentImage(savedState.currentImage || null);
        setEditedImage(savedState.editedImage || null);
        setHistory(savedState.history || []);
      }
    } catch (err) {
      console.error("Failed to load state from local storage", err);
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    }
  }, []);

  // Save state to localStorage whenever it changes
  useEffect(() => {
    // Don't save if there's no image, to avoid an empty session on refresh after reset
    if (!currentImage) {
        localStorage.removeItem(LOCAL_STORAGE_KEY);
        return;
    };

    try {
      const stateToSave = {
        currentImage,
        editedImage,
        history,
      };
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(stateToSave));
    } catch (err) {
      console.error("Failed to save state to local storage", err);
    }
  }, [currentImage, editedImage, history]);

  const handleImageSelected = (base64: string, fileName: string) => {
    setCurrentImage(base64);
    setEditedImage(null);
    setError(null);
    setPrompt('');
    setHistory([]);
  };

  const handleEdit = async () => {
    if (!currentImage || !prompt.trim()) return;

    setIsProcessing(true);
    setError(null);

    try {
      const result = await editImageWithGemini(currentImage, prompt);
      const newHistoryItem: EditHistoryItem = {
        id: crypto.randomUUID(),
        originalImage: editedImage || currentImage, // Chain edits from the last result
        editedImage: result,
        prompt: prompt,
        timestamp: Date.now()
      };
      setHistory(prev => [newHistoryItem, ...prev]);
      setEditedImage(result); // Update the main result view
      setCurrentImage(result); // Set the new "original" for the next edit
      
    } catch (err: any) {
      setError(err.message || "Failed to edit image.");
    } finally {
      setIsProcessing(false);
    }
  };

  const reset = () => {
    setCurrentImage(null);
    setEditedImage(null);
    setPrompt('');
    setError(null);
    setHistory([]);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8 max-w-6xl">
        {!currentImage ? (
          <div className="max-w-2xl mx-auto mt-20">
            <div className="text-center mb-8">
              <h1 className="text-5xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent mb-4">
                Magic Editor
              </h1>
              <p className="text-slate-400 text-lg">
                Edit your photos using plain English. Add objects, change styles, or remove backgrounds instantly.
              </p>
            </div>
            <ImageUploader onImageSelected={handleImageSelected} />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Editor Workspace */}
            <div className="lg:col-span-8 space-y-6">
              <div className="bg-slate-800 rounded-2xl overflow-hidden shadow-2xl border border-slate-700">
                <div className="flex items-center justify-between p-4 border-b border-slate-700 bg-slate-800/50">
                  <h2 className="font-semibold text-slate-200">Editor Canvas</h2>
                  <Button variant="ghost" onClick={reset} className="text-sm">
                    Upload New
                  </Button>
                </div>
                
                <div className="p-4 flex flex-col md:flex-row gap-4 justify-center items-start min-h-[400px]">
                  <div className="flex-1 w-full space-y-2">
                    <span className="text-xs uppercase tracking-wider font-bold text-slate-500">Image</span>
                    <div className="aspect-square relative rounded-xl overflow-hidden bg-slate-900 border border-slate-700">
                      <img src={currentImage} alt="Current" className="w-full h-full object-contain" />
                       {editedImage && (<a 
                          href={editedImage} 
                          download="pixelgenie-edit.png" 
                          className="absolute bottom-2 right-2 bg-indigo-600 p-2 rounded-lg hover:bg-indigo-700 transition-colors shadow-lg"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                        </a>)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Interaction Bar */}
              <div className="bg-slate-800 p-6 rounded-2xl shadow-xl border border-slate-700">
                <div className="flex flex-col gap-4">
                  <label className="text-sm font-medium text-slate-400">What would you like to change?</label>
                  <div className="flex gap-3">
                    <input 
                      type="text" 
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder="e.g., 'Make it look like a 1920s vintage photo' or 'Change the sky to a sunset'"
                      className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-200 placeholder-slate-600"
                      onKeyDown={(e) => e.key === 'Enter' && handleEdit()}
                    />
                    <Button 
                      onClick={handleEdit} 
                      isLoading={isProcessing}
                      disabled={!prompt.trim()}
                      className="min-w-[140px]"
                    >
                      Apply Magic
                    </Button>
                  </div>
                  {error && (
                    <div className="bg-rose-500/10 border border-rose-500/50 text-rose-400 p-3 rounded-lg text-sm flex items-center gap-2">
                      <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {error}
                    </div>
                  )}
                  <div className="flex flex-wrap gap-2 mt-2">
                    {['Add a retro filter', 'Make it cinematic', 'Change background to Mars', 'Add a cat next to the person'].map(suggestion => (
                      <button 
                        key={suggestion}
                        onClick={() => setPrompt(suggestion)}
                        className="text-xs bg-slate-700 hover:bg-slate-600 text-slate-300 px-3 py-1.5 rounded-full transition-colors border border-slate-600"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar / History */}
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700 h-full max-h-[800px] flex flex-col">
                <h3 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Recent Edits
                </h3>
                
                <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                  {history.length === 0 ? (
                    <div className="text-center py-12 text-slate-500 border-2 border-dashed border-slate-700 rounded-xl">
                      No edits yet
                    </div>
                  ) : (
                    history.map(item => (
                      <div 
                        key={item.id} 
                        className="bg-slate-900 rounded-xl p-3 border border-slate-700 hover:border-indigo-500/50 transition-all cursor-pointer group"
                        onClick={() => {
                          setCurrentImage(item.editedImage);
                          setEditedImage(item.editedImage);
                          setPrompt(item.prompt);
                        }}
                      >
                        <div className="flex gap-3 mb-2">
                          <img src={item.originalImage} className="w-12 h-12 object-cover rounded bg-black" alt="Small orig" />
                          <svg className="w-4 h-4 text-slate-600 self-center" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                          </svg>
                          <img src={item.editedImage} className="w-12 h-12 object-cover rounded bg-black" alt="Small edit" />
                        </div>
                        <p className="text-xs text-slate-400 line-clamp-2 italic">"{item.prompt}"</p>
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-[10px] text-slate-600">
                            {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          <span className="text-[10px] text-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity">
                            Restore to Canvas
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="py-6 border-t border-slate-800 text-center text-slate-500 text-sm">
        Built with Gemini 2.5 Flash Image & React
      </footer>
    </div>
  );
};

export default App;
