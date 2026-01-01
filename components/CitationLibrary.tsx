import React, { useState } from 'react';
import { SavedPaper } from '../types';
import { Download, Trash2, BookOpen, Copy, FileText, FileJson, Table, Code } from 'lucide-react';

interface CitationLibraryProps {
  savedPapers: SavedPaper[];
  onRemove: (id: string) => void;
}

export const CitationLibrary: React.FC<CitationLibraryProps> = ({ savedPapers, onRemove }) => {
  const [showExportMenu, setShowExportMenu] = useState(false);

  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    setShowExportMenu(false);
  };

  const exportBibtex = () => {
    const content = savedPapers.map(paper => {
      const authorText = paper.authors.map(a => a.name).join(' and ');
      // Simple citation key generation: FirstAuthor + Year + FirstWordOfTitle
      const firstAuthor = paper.authors[0]?.name.split(' ').pop()?.replace(/[^a-zA-Z]/g, '') || 'Unknown';
      const year = paper.year || 'nd';
      const titleWord = paper.title.split(' ')[0].replace(/[^a-zA-Z]/g, '') || 'Paper';
      const id = `${firstAuthor}${year}${titleWord}`;
      
      return `@article{${id},
  title={${paper.title}},
  author={${authorText}},
  journal={${paper.publicationVenue?.name || 'Unknown'}},
  year={${paper.year || 'Unknown'}},
  url={${paper.url}}
}`;
    }).join('\n\n');
    downloadFile(content, 'scholarscout_citations.bib', 'text/plain');
  };

  const exportJson = () => {
    const content = JSON.stringify(savedPapers, null, 2);
    downloadFile(content, 'scholarscout_library.json', 'application/json');
  };

  const exportCsv = () => {
    // CSV Header
    const headers = ['Paper ID', 'Title', 'Authors', 'Year', 'Venue', 'Citations', 'URL'];
    
    // CSV Rows
    const rows = savedPapers.map(p => {
      // Escape quotes by doubling them
      const escape = (str: string) => `"${(str || '').replace(/"/g, '""')}"`;
      
      return [
        escape(p.paperId),
        escape(p.title),
        escape(p.authors.map(a => a.name).join('; ')),
        p.year || '',
        escape(p.publicationVenue?.name || ''),
        p.citationCount,
        escape(p.url)
      ].join(',');
    });

    const content = [headers.join(','), ...rows].join('\n');
    downloadFile(content, 'scholarscout_library.csv', 'text/csv');
  };

  const exportTxt = () => {
    const content = savedPapers.map(p => 
      `${p.authors.map(a => a.name).join(', ')} (${p.year || 'n.d.'}). ${p.title}. ${p.publicationVenue?.name || ''}. ${p.url}`
    ).join('\n\n');
    downloadFile(content, 'scholarscout_references.txt', 'text/plain');
  };

  const handleCopy = () => {
     const text = savedPapers.map(p => 
        `${p.authors.map(a => a.name).join(', ')} (${p.year || 'n.d.'}). ${p.title}.`
     ).join('\n');
     navigator.clipboard.writeText(text);
     alert("Citations copied to clipboard!");
  };

  if (savedPapers.length === 0) {
    return (
      <div className="bg-slate-50 rounded-xl p-8 text-center border border-slate-200 border-dashed h-full flex flex-col justify-center items-center text-slate-500">
        <BookOpen className="w-12 h-12 mb-3 text-slate-300" />
        <p className="font-medium">Your library is empty</p>
        <p className="text-sm mt-1">Save papers from the search results to build your citation list.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col h-[calc(100vh-8rem)] sticky top-4">
      <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50 rounded-t-xl">
        <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-800">My Library</span>
            <span className="bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full text-xs font-bold">
                {savedPapers.length}
            </span>
        </div>
        <div className="flex gap-1 relative">
            <button onClick={handleCopy} className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-white rounded-md transition-colors" title="Copy to Clipboard">
                <Copy className="w-4 h-4" />
            </button>
            
            <div className="relative">
              <button 
                onClick={() => setShowExportMenu(!showExportMenu)} 
                className={`p-2 rounded-md transition-colors ${showExportMenu ? 'bg-indigo-100 text-indigo-600' : 'text-slate-500 hover:text-indigo-600 hover:bg-white'}`}
                title="Export Options"
              >
                  <Download className="w-4 h-4" />
              </button>

              {showExportMenu && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowExportMenu(false)} />
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-100 py-1 z-20 flex flex-col">
                    <div className="px-3 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-50 mb-1">Download As</div>
                    <button onClick={exportBibtex} className="text-left px-4 py-2 text-sm text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 flex items-center gap-2">
                      <Code className="w-4 h-4 text-slate-400" /> BibTeX (.bib)
                    </button>
                    <button onClick={exportCsv} className="text-left px-4 py-2 text-sm text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 flex items-center gap-2">
                      <Table className="w-4 h-4 text-slate-400" /> CSV (.csv)
                    </button>
                    <button onClick={exportJson} className="text-left px-4 py-2 text-sm text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 flex items-center gap-2">
                      <FileJson className="w-4 h-4 text-slate-400" /> JSON (.json)
                    </button>
                    <button onClick={exportTxt} className="text-left px-4 py-2 text-sm text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-slate-400" /> Plain Text (.txt)
                    </button>
                  </div>
                </>
              )}
            </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {savedPapers.map((paper) => (
          <div key={paper.paperId} className="group p-3 rounded-lg border border-slate-100 bg-slate-50 hover:bg-white hover:border-indigo-100 hover:shadow-sm transition-all relative">
            <div className="flex justify-between items-start gap-2">
              <h4 className="text-sm font-medium text-slate-900 leading-snug line-clamp-2 mb-1 pr-6">
                <a href={paper.url} target="_blank" rel="noreferrer" className="hover:underline">
                    {paper.title}
                </a>
              </h4>
              <button 
                onClick={() => onRemove(paper.paperId)}
                className="absolute top-3 right-3 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                title="Remove from library"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-slate-500 mb-1">
              {paper.authors[0]?.name} {paper.authors.length > 1 && 'et al.'} • {paper.year || 'n.d.'}
            </p>
             {paper.publicationVenue?.name && (
                <span className="inline-block px-1.5 py-0.5 bg-slate-200 text-slate-600 text-[10px] rounded-sm mt-1">
                  {paper.publicationVenue.name}
                </span>
             )}
          </div>
        ))}
      </div>
    </div>
  );
};