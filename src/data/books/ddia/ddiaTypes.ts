export interface BookEpigraph {
  quote: string;
  author: string;
}

export interface BookReference {
  id: number;
  text: string;
}

export interface BookKeyConcept {
  title: string;
  takeaway: string;
  interviewTip?: string;
}

export interface BookSection {
  id: string;
  title: string;
  level: 2 | 3;
  content: string[]; // Exact verbatim paragraphs from the book
  codeSnippet?: {
    language: string;
    code: string;
    caption?: string;
  };
  diagramId?: string; // If an interactive diagram is attached to this section
  keyConcept?: BookKeyConcept;
  footnote?: string;
}

export interface BookChapter {
  id: string;
  number: number;
  title: string;
  partId: string;
  partTitle: string;
  pageRange: string;
  epigraph?: BookEpigraph;
  sections: BookSection[];
  references: BookReference[];
}

export interface BookPart {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  chapterIds: string[];
}

export interface BookMetadata {
  title: string;
  subtitle: string;
  author: string;
  publisher: string;
  isbn: string;
  year: string;
  description: string;
  parts: BookPart[];
}
