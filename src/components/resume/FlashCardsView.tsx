import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Brain,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Sparkles,
  Star,
  CheckCircle2,
  HelpCircle,
  Shuffle,
  Lightbulb,
  BookmarkCheck,
  Check,
  X,
  Volume2
} from 'lucide-react';
import { FlashCard } from '../../lib/resumeAnalyzerService';

interface FlashCardsViewProps {
  flashcards: FlashCard[];
}

export const FlashCardsView: React.FC<FlashCardsViewProps> = ({ flashcards }) => {
  const [cardsList, setCardsList] = useState<FlashCard[]>(flashcards || []);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('All');
  const [masteredCards, setMasteredCards] = useState<Set<number>>(new Set());

  // Keep internal list in sync when prop changes
  useEffect(() => {
    if (flashcards && flashcards.length > 0) {
      setCardsList(flashcards);
      setCurrentIndex(0);
      setIsFlipped(false);
    }
  }, [flashcards]);

  // Extract unique categories & difficulties
  const categories = useMemo(() => {
    const set = new Set<string>();
    cardsList.forEach(c => { if (c.category) set.add(c.category); });
    return ['All', ...Array.from(set)];
  }, [cardsList]);

  const difficulties = useMemo(() => {
    return ['All', 'Easy', 'Medium', 'Hard'];
  }, []);

  // Filtered cards
  const filteredCards = useMemo(() => {
    return cardsList.filter(card => {
      const matchCat = selectedCategory === 'All' || card.category.toLowerCase() === selectedCategory.toLowerCase();
      const matchDiff = selectedDifficulty === 'All' || card.difficulty.toLowerCase() === selectedDifficulty.toLowerCase();
      return matchCat && matchDiff;
    });
  }, [cardsList, selectedCategory, selectedDifficulty]);

  // Keep index within bounds
  useEffect(() => {
    if (currentIndex >= filteredCards.length && filteredCards.length > 0) {
      setCurrentIndex(0);
    }
  }, [filteredCards.length, currentIndex]);

  const handleNext = useCallback(() => {
    if (filteredCards.length === 0) return;
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex(prev => (prev + 1) % filteredCards.length);
    }, 150);
  }, [filteredCards.length]);

  const handlePrev = useCallback(() => {
    if (filteredCards.length === 0) return;
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex(prev => (prev - 1 + filteredCards.length) % filteredCards.length);
    }, 150);
  }, [filteredCards.length]);

  const handleFlip = () => {
    setIsFlipped(prev => !prev);
  };

  const handleShuffle = () => {
    setIsFlipped(false);
    const shuffled = [...cardsList].sort(() => Math.random() - 0.5);
    setCardsList(shuffled);
    setCurrentIndex(0);
  };

  const toggleMastered = (idx: number) => {
    setMasteredCards(prev => {
      const next = new Set(prev);
      if (next.has(idx)) {
        next.delete(idx);
      } else {
        next.add(idx);
      }
      return next;
    });
  };

  // Keyboard navigation (ArrowLeft, ArrowRight, Space)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.code === 'Space') {
        e.preventDefault();
        handleFlip();
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        handleNext();
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        handlePrev();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNext, handlePrev]);

  const activeCard = filteredCards[currentIndex];

  const getDifficultyColor = (diff: string) => {
    switch (diff?.toLowerCase()) {
      case 'easy':
        return 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60';
      case 'medium':
        return 'bg-amber-950/80 text-amber-300 border-amber-700/60';
      case 'hard':
        return 'bg-rose-950/80 text-rose-300 border-rose-700/60';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category?.toLowerCase()) {
      case 'technical':
        return '💻';
      case 'behavioral':
        return '🤝';
      case 'situational':
        return '🎯';
      default:
        return '💡';
    }
  };

  if (!activeCard || filteredCards.length === 0) {
    return (
      <div className="glass-panel p-12 rounded-3xl border border-slate-800 text-center max-w-xl mx-auto space-y-4">
        <Brain className="w-12 h-12 text-slate-500 mx-auto" />
        <h3 className="text-lg font-bold text-slate-200">No Flashcards Match Filters</h3>
        <p className="text-xs text-slate-400">Try selecting "All" categories and difficulties to see all interview questions.</p>
        <button
          onClick={() => { setSelectedCategory('All'); setSelectedDifficulty('All'); }}
          className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all cursor-pointer"
        >
          Reset Filters
        </button>
      </div>
    );
  }

  const isCurrentMastered = masteredCards.has(currentIndex);

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fadeIn">
      {/* 1. HEADER & CONTROLS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-5 rounded-3xl border border-slate-800 bg-slate-900/80 shadow-xl">
        <div className="flex items-center space-x-3">
          <div className="p-3 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-600/20">
            <Brain className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <span>Interview Prep Flashcards</span>
              <span className="px-2 py-0.5 rounded-full bg-purple-950 border border-purple-800 text-purple-300 text-[10px] font-mono font-bold">
                3D Interactive
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Role-specific questions generated by SDETube AI from your resume & target JD
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center">
          <button
            onClick={handleShuffle}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
            title="Randomize card sequence"
          >
            <Shuffle className="w-3.5 h-3.5 text-purple-400" />
            <span>Shuffle</span>
          </button>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 text-xs font-mono font-bold">
            <BookmarkCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>{masteredCards.size}/{filteredCards.length} Mastered</span>
          </div>
        </div>
      </div>

      {/* 2. CATEGORY & DIFFICULTY FILTER BAR */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800/80 bg-slate-950/60 shadow-lg space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          
          {/* Category Pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-mono font-bold text-slate-400 mr-1">Category:</span>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => { setSelectedCategory(cat); setIsFlipped(false); }}
                className={`px-3 py-1 rounded-xl font-bold transition-all cursor-pointer text-xs ${
                  selectedCategory.toLowerCase() === cat.toLowerCase()
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                    : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Difficulty Pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-mono font-bold text-slate-400 mr-1">Difficulty:</span>
            {difficulties.map(diff => (
              <button
                key={diff}
                onClick={() => { setSelectedDifficulty(diff); setIsFlipped(false); }}
                className={`px-2.5 py-1 rounded-xl font-mono text-[11px] font-bold transition-all cursor-pointer ${
                  selectedDifficulty.toLowerCase() === diff.toLowerCase()
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                {diff}
              </button>
            ))}
          </div>

        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-purple-500 via-indigo-500 to-sky-400 transition-all duration-300 rounded-full"
            style={{ width: `${((currentIndex + 1) / filteredCards.length) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* 3. 3D FLIP FLASHCARD COMPONENT */}
      <div className="relative perspective-1000 mx-auto w-full" style={{ minHeight: '380px' }}>
        <div
          onClick={handleFlip}
          className="w-full h-full relative cursor-pointer select-none"
          style={{
            minHeight: '380px',
            transformStyle: 'preserve-3d',
            transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
            transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
        >
          {/* ===================== FRONT OF CARD (QUESTION) ===================== */}
          <div
            className="absolute inset-0 w-full h-full p-6 sm:p-8 rounded-3xl border border-indigo-500/30 bg-gradient-to-br from-indigo-950/80 via-slate-900 to-slate-950 shadow-2xl flex flex-col justify-between"
            style={{
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden'
            }}
          >
            <div>
              {/* Card Meta Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{getCategoryIcon(activeCard.category)}</span>
                  <span className="text-xs font-bold text-indigo-300 font-mono tracking-wide uppercase">
                    {activeCard.category} Round Question
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border ${getDifficultyColor(activeCard.difficulty)}`}>
                    {activeCard.difficulty}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-[10px] font-mono text-slate-400">
                    #{currentIndex + 1}/{filteredCards.length}
                  </span>
                </div>
              </div>

              {/* Question Text */}
              <div className="my-6">
                <span className="text-[11px] font-mono uppercase font-bold text-indigo-400/80 tracking-wider">
                  Target Question:
                </span>
                <h3 className="text-lg sm:text-xl font-extrabold text-slate-100 mt-2 leading-relaxed">
                  "{activeCard.question}"
                </h3>
              </div>
            </div>

            {/* Hint & Flip Trigger */}
            <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-mono text-indigo-300">
                <RotateCcw className="w-3.5 h-3.5 animate-spin-slow" />
                <span>Click card or press [Space] to reveal suggested answer</span>
              </div>
              <span className="px-2 py-0.5 rounded bg-indigo-950 border border-indigo-800 text-[10px] font-mono text-indigo-300">
                Front
              </span>
            </div>
          </div>

          {/* ===================== BACK OF CARD (ANSWER) ===================== */}
          <div
            className="absolute inset-0 w-full h-full p-6 sm:p-8 rounded-3xl border border-emerald-500/40 bg-gradient-to-br from-emerald-950/80 via-slate-900 to-slate-950 shadow-2xl flex flex-col justify-between"
            style={{
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)'
            }}
          >
            <div>
              {/* Card Meta Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-xl">💡</span>
                  <span className="text-xs font-bold text-emerald-300 font-mono tracking-wide uppercase">
                    Suggested High-Scoring Response
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border ${getDifficultyColor(activeCard.difficulty)}`}>
                    {activeCard.difficulty}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-[10px] font-mono text-slate-400">
                    #{currentIndex + 1}/{filteredCards.length}
                  </span>
                </div>
              </div>

              {/* Answer Text */}
              <div className="my-4 max-h-[220px] overflow-y-auto pr-1">
                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-sans whitespace-pre-line">
                  {activeCard.answer}
                </p>
              </div>
            </div>

            {/* Hint & Flip Trigger */}
            <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-mono text-emerald-300">
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Click card to see question again</span>
              </div>
              <span className="px-2 py-0.5 rounded bg-emerald-950 border border-emerald-800 text-[10px] font-mono text-emerald-300">
                Answer
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. CONTROLS BAR (PREV, FLIP, NEXT, MASTERED TOGGLE) */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
        
        {/* Mastered Button */}
        <button
          onClick={() => toggleMastered(currentIndex)}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold font-mono transition-all flex items-center gap-2 cursor-pointer ${
            isCurrentMastered
              ? 'bg-emerald-950 text-emerald-300 border border-emerald-600 shadow-md shadow-emerald-500/20'
              : 'bg-slate-900 hover:bg-slate-800 text-slate-400 border border-slate-800'
          }`}
        >
          <CheckCircle2 className={`w-4 h-4 ${isCurrentMastered ? 'text-emerald-400' : 'text-slate-500'}`} />
          <span>{isCurrentMastered ? '✓ Mastered' : 'Mark as Mastered'}</span>
        </button>

        {/* Prev / Flip / Next Buttons */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={handlePrev}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer"
            title="Previous question [Left Arrow]"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Previous</span>
          </button>

          <button
            onClick={handleFlip}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold transition-all shadow-lg shadow-purple-600/30 active:scale-95 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>{isFlipped ? 'Show Question' : 'Flip to Answer'}</span>
          </button>

          <button
            onClick={handleNext}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer"
            title="Next question [Right Arrow]"
          >
            <span className="hidden sm:inline">Next</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Card Index Badge */}
        <div className="text-xs font-mono text-slate-400">
          Question <span className="font-bold text-slate-200">{currentIndex + 1}</span> of <span className="font-bold text-slate-200">{filteredCards.length}</span>
        </div>
      </div>

      {/* 5. INTERVIEW TIPS FOOTER */}
      <div className="glass-panel p-5 rounded-3xl border border-indigo-500/20 bg-gradient-to-r from-indigo-950/30 via-slate-900 to-slate-950 space-y-2">
        <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-300 font-mono flex items-center gap-1.5">
          <Lightbulb className="w-4 h-4 text-amber-300" />
          <span>FAANG Interview Tips</span>
        </h4>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300">
          <li className="flex items-start gap-1.5">
            <span className="text-indigo-400">•</span>
            <span><strong>STAR Method:</strong> Detail Situation, Task, specific personal Action, and quantified Result.</span>
          </li>
          <li className="flex items-start gap-1.5">
            <span className="text-indigo-400">•</span>
            <span><strong>Think Out Loud:</strong> Interviewers prioritize your trade-off analysis over memorized syntax.</span>
          </li>
          <li className="flex items-start gap-1.5">
            <span className="text-indigo-400">•</span>
            <span><strong>Defend Invariants:</strong> For system design questions, define caching TTLs, partition keys, and failure recovery.</span>
          </li>
          <li className="flex items-start gap-1.5">
            <span className="text-indigo-400">•</span>
            <span><strong>Clarify Ambiguity:</strong> Ask 1-2 scoping questions on traffic volume and consistency before answering.</span>
          </li>
        </ul>
      </div>

    </div>
  );
};
