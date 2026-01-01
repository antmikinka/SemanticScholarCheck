import React from 'react';
import { Paper, SearchQuery } from '../types';
import { PaperCard } from './PaperCard';
import { Search } from 'lucide-react';

interface ResultsSectionProps {
  query: SearchQuery;
  results: Paper[];
  savedPaperIds: Set<string>;
  onSave: (paper: Paper) => void;
  isLoading: boolean;
}

export const ResultsSection: React.FC<ResultsSectionProps> = ({ 
  query, 
  results, 
  savedPaperIds, 
  onSave,
  isLoading 
}) => {
  return (
    <div className="mb-8 last:mb-0">
      <div className="bg-indigo-50 border-l-4 border-indigo-500 p-4 mb-4 rounded-r-lg">
        <h3 className="font-semibold text-indigo-900 text-lg flex items-center gap-2">
          <Search className="w-5 h-5" />
          {query.query}
        </h3>
        <p className="text-indigo-700 text-sm mt-1">{query.rationale}</p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
           {[1, 2, 3].map((i) => (
             <div key={i} className="h-40 bg-slate-100 rounded-xl animate-pulse" />
           ))}
        </div>
      ) : results.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {results.map((paper) => (
            <PaperCard 
              key={paper.paperId} 
              paper={paper} 
              onSave={onSave}
              isSaved={savedPaperIds.has(paper.paperId)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-slate-500 bg-white rounded-xl border border-slate-100 border-dashed">
          No papers found for this specific query.
        </div>
      )}
    </div>
  );
};
