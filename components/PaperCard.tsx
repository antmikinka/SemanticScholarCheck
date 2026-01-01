import React from 'react';
import { Paper } from '../types';
import { Plus, ExternalLink, Quote, Calendar, Users, Check } from 'lucide-react';

interface PaperCardProps {
  paper: Paper;
  onSave: (paper: Paper) => void;
  isSaved: boolean;
}

export const PaperCard: React.FC<PaperCardProps> = ({ paper, onSave, isSaved }) => {
  return (
    <div className={`
      relative p-5 rounded-xl border transition-all duration-200
      ${isSaved 
        ? 'bg-green-50 border-green-200' 
        : 'bg-white border-slate-200 hover:border-indigo-200 hover:shadow-md'}
    `}>
      <div className="flex justify-start items-start gap-4">
        <div className="flex-1 min-w-0">
          <a 
            href={paper.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-lg font-semibold text-slate-900 hover:text-indigo-600 leading-tight block mb-2"
          >
            {paper.title}
          </a>
          
          <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500 mb-3">
            {paper.year && (
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {paper.year}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Quote className="w-4 h-4" />
              {paper.citationCount} Citations
            </span>
            {paper.openAccessPdf && (
              <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full font-medium">
                PDF Available
              </span>
            )}
            {paper.publicationVenue && (
              <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-xs rounded-full">
                {paper.publicationVenue.name}
              </span>
            )}
          </div>

          <div className="text-sm text-slate-600 mb-3 line-clamp-3">
            {paper.abstract || "No abstract available."}
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Users className="w-4 h-4" />
            <span className="truncate">
              {paper.authors.slice(0, 3).map(a => a.name).join(', ')}
              {paper.authors.length > 3 && `, +${paper.authors.length - 3} more`}
            </span>
          </div>
        </div>

        <button
          onClick={() => onSave(paper)}
          disabled={isSaved}
          className={`
            shrink-0 p-2 rounded-lg transition-colors flex items-center justify-center
            ${isSaved 
              ? 'bg-green-100 text-green-700 cursor-default' 
              : 'bg-slate-50 text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 border border-slate-200 hover:border-indigo-200'}
          `}
          title={isSaved ? "Saved to Library" : "Add to Library"}
        >
          {isSaved ? <Check className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
        </button>
      </div>
    </div>
  );
};
