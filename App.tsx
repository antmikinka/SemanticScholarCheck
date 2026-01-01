import React, { useState } from 'react';
import { InputSection } from './components/InputSection';
import { ResultsSection } from './components/ResultsSection';
import { CitationLibrary } from './components/CitationLibrary';
import { analyzePaperDraft } from './services/geminiService';
import { searchPapers } from './services/semanticScholarService';
import { Paper, SavedPaper, SearchQuery } from './types';
import { BookOpen, Settings, AlertTriangle } from 'lucide-react';

export default function App() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisSummary, setAnalysisSummary] = useState<string | null>(null);
  const [searchQueries, setSearchQueries] = useState<SearchQuery[]>([]);
  const [searchResults, setSearchResults] = useState<Record<string, Paper[]>>({});
  const [searchLoading, setSearchLoading] = useState<Record<string, boolean>>({});
  const [savedPapers, setSavedPapers] = useState<SavedPaper[]>([]);
  const [s2ApiKey, setS2ApiKey] = useState<string>('');
  const [showSettings, setShowSettings] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async (text: string) => {
    setIsAnalyzing(true);
    setError(null);
    setSearchResults({});
    setSearchQueries([]);
    setAnalysisSummary(null);

    try {
      // 1. Analyze with Gemini
      const analysis = await analyzePaperDraft(text);
      setAnalysisSummary(analysis.summary);
      setSearchQueries(analysis.searchQueries);

      // 2. Trigger searches for each query
      setIsAnalyzing(false); // Stop analyzing spinner, start searching spinners
      
      const newLoadingState: Record<string, boolean> = {};
      analysis.searchQueries.forEach(q => {
        newLoadingState[q.query] = true;
      });
      setSearchLoading(newLoadingState);

      // Parallel fetch for better UX
      await Promise.all(analysis.searchQueries.map(async (q) => {
        try {
          const papers = await searchPapers(q.query, s2ApiKey);
          setSearchResults(prev => ({ ...prev, [q.query]: papers }));
        } catch (err) {
            console.error(`Failed to fetch for ${q.query}`, err);
        } finally {
          setSearchLoading(prev => ({ ...prev, [q.query]: false }));
        }
      }));

    } catch (err: any) {
      console.error(err);
      let errorMessage = err.message || "An error occurred during analysis.";
      
      // Provide helpful context for common API errors
      if (errorMessage.includes("Failed to fetch") || errorMessage.includes("Network Error")) {
        errorMessage = "Connection failed. This may be due to browser privacy settings blocking the API proxy (CORS).";
      } else if (errorMessage.includes("429")) {
        errorMessage = "Rate limit exceeded. Please wait or add a Semantic Scholar API Key in settings.";
      }

      setError(errorMessage);
      setIsAnalyzing(false);
    }
  };

  const handleSavePaper = (paper: Paper) => {
    if (!savedPapers.find(p => p.paperId === paper.paperId)) {
      setSavedPapers([...savedPapers, { ...paper, savedAt: Date.now() }]);
    }
  };

  const handleRemovePaper = (id: string) => {
    setSavedPapers(savedPapers.filter(p => p.paperId !== id));
  };

  const savedPaperIds = new Set(savedPapers.map(p => p.paperId));

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-1.5 rounded-lg">
                <BookOpen className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold text-slate-800">ScholarScout</h1>
          </div>
          <button 
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
        
        {/* Settings Dropdown */}
        {showSettings && (
          <div className="max-w-7xl mx-auto px-4 pb-4">
             <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 max-w-md ml-auto shadow-lg">
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Semantic Scholar API Key (Optional)
                </label>
                <input 
                  type="password" 
                  value={s2ApiKey} 
                  onChange={(e) => setS2ApiKey(e.target.value)}
                  placeholder="Enter key to increase rate limits"
                  className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm"
                />
                <p className="text-xs text-slate-500 mt-2">
                  Without a key, you may hit rate limits (429 errors) quickly.
                </p>
             </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Input & Results */}
        <div className="lg:col-span-8 space-y-8">
          
          <InputSection onAnalyze={handleAnalyze} isAnalyzing={isAnalyzing} />

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3 text-red-700">
               <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
               <div>
                 <h3 className="font-semibold">Error</h3>
                 <p className="text-sm">{error}</p>
               </div>
            </div>
          )}

          {analysisSummary && (
            <div className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-6">
              <h2 className="text-sm font-bold text-indigo-900 uppercase tracking-wider mb-2">Research Summary</h2>
              <p className="text-slate-700 leading-relaxed">{analysisSummary}</p>
            </div>
          )}

          <div className="space-y-6">
            {searchQueries.map((query, idx) => (
              <ResultsSection
                key={idx}
                query={query}
                results={searchResults[query.query] || []}
                isLoading={searchLoading[query.query]}
                savedPaperIds={savedPaperIds}
                onSave={handleSavePaper}
              />
            ))}
          </div>
        </div>

        {/* Right Column: Library Sidebar */}
        <div className="lg:col-span-4">
          <CitationLibrary 
            savedPapers={savedPapers} 
            onRemove={handleRemovePaper} 
          />
        </div>

      </main>
    </div>
  );
}
