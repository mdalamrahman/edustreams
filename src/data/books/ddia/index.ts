import { BookMetadata, BookChapter, BookPart } from './ddiaTypes';
import { PREFACE } from './preface';
import { CHAPTER_1 } from './chapter1';
import { CHAPTER_2 } from './chapter2';
import { CHAPTER_3 } from './chapter3';
import { CHAPTER_4 } from './chapter4';
import { CHAPTER_5 } from './chapter5';
import { CHAPTER_6 } from './chapter6';
import { CHAPTER_7 } from './chapter7';
import { CHAPTER_8 } from './chapter8';
import { CHAPTER_9 } from './chapter9';
import { CHAPTER_10 } from './chapter10';
import { CHAPTER_11 } from './chapter11';

export * from './ddiaTypes';

export const DDIA_PARTS: BookPart[] = [
  {
    id: 'part-0',
    title: 'Front Matter',
    subtitle: 'Preface & Orientation',
    description: 'Introduction to data-intensive applications, scope, audience, and architectural thinking.',
    chapterIds: ['chapter-0']
  },
  {
    id: 'part-1',
    title: 'Part I. Foundations of Data Systems',
    subtitle: 'Single-Node Architecture & Data Modeling',
    description: 'Fundamental ideas that apply to all data systems: reliability, scalability, maintainability, data models, storage engines, and encoding.',
    chapterIds: ['chapter-1', 'chapter-2', 'chapter-3', 'chapter-4']
  },
  {
    id: 'part-2',
    title: 'Part II. Distributed Data',
    subtitle: 'Multiple Machines, Replication & Consistency',
    description: 'Scaling across multiple machines: replication topologies, partitioning/sharding, transactions, distributed network faults, and consensus.',
    chapterIds: ['chapter-5', 'chapter-6', 'chapter-7', 'chapter-8', 'chapter-9']
  },
  {
    id: 'part-3',
    title: 'Part III. Derived Data',
    subtitle: 'Heterogeneous Systems & Batch/Stream Pipelines',
    description: 'Integrating multiple disparate systems: batch processing workflows (MapReduce, Spark) and stream processing pipelines (Kafka, CDC, Event Sourcing).',
    chapterIds: ['chapter-10', 'chapter-11']
  }
];

export const DDIA_METADATA: BookMetadata = {
  title: 'Designing Data-Intensive Applications',
  subtitle: 'The Big Ideas Behind Reliable, Scalable, and Maintainable Systems',
  author: 'Martin Kleppmann',
  publisher: 'O’Reilly Media',
  isbn: '978-1-491-90309-4',
  year: '2016 / 2017 First Edition',
  description: 'The definitive handbook for software engineers and architects building reliable, scalable, and maintainable systems.',
  parts: DDIA_PARTS
};

export const DDIA_CHAPTERS: BookChapter[] = [
  PREFACE,
  CHAPTER_1,
  CHAPTER_2,
  CHAPTER_3,
  CHAPTER_4,
  CHAPTER_5,
  CHAPTER_6,
  CHAPTER_7,
  CHAPTER_8,
  CHAPTER_9,
  CHAPTER_10,
  CHAPTER_11
];

export interface SearchResult {
  chapterId: string;
  chapterNumber: number;
  chapterTitle: string;
  sectionId: string;
  sectionTitle: string;
  snippet: string;
  matchIndex: number;
}

export function searchDDIABook(query: string): SearchResult[] {
  if (!query || query.trim().length < 2) return [];
  const q = query.toLowerCase().trim();
  const results: SearchResult[] = [];

  for (const ch of DDIA_CHAPTERS) {
    for (const sec of ch.sections) {
      // Check section title
      if (sec.title.toLowerCase().includes(q)) {
        results.push({
          chapterId: ch.id,
          chapterNumber: ch.number,
          chapterTitle: ch.title,
          sectionId: sec.id,
          sectionTitle: sec.title,
          snippet: sec.content[0] ? sec.content[0].slice(0, 160) + '...' : sec.title,
          matchIndex: 0
        });
        continue;
      }

      // Check section paragraphs
      for (const p of sec.content) {
        const lowerP = p.toLowerCase();
        const idx = lowerP.indexOf(q);
        if (idx !== -1) {
          const start = Math.max(0, idx - 60);
          const end = Math.min(p.length, idx + q.length + 60);
          const snippet = (start > 0 ? '...' : '') + p.slice(start, end) + (end < p.length ? '...' : '');
          results.push({
            chapterId: ch.id,
            chapterNumber: ch.number,
            chapterTitle: ch.title,
            sectionId: sec.id,
            sectionTitle: sec.title,
            snippet,
            matchIndex: idx
          });
          break; // limit to 1 hit per section to keep search results clean
        }
      }
    }
  }

  return results;
}
