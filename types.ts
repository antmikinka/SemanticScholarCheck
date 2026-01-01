export interface Author {
  authorId: string;
  name: string;
}

export interface Paper {
  paperId: string;
  title: string;
  abstract: string | null;
  year: number | null;
  citationCount: number;
  url: string;
  authors: Author[];
  openAccessPdf?: {
    url: string;
    status: string;
  } | null;
  publicationVenue?: {
    name: string;
  } | null;
}

export interface SearchQuery {
  query: string;
  rationale: string;
}

export interface AnalysisResult {
  summary: string;
  searchQueries: SearchQuery[];
}

export interface SavedPaper extends Paper {
  notes?: string;
  savedAt: number;
}
