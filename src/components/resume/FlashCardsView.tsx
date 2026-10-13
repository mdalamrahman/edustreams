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
      {/* 1. HEADER & CONTROLS (OBSIDIAN TELEMETRY) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-white/[0.08] bg-[#0c101a] p-5 shadow-xl">
        <div className="flex items-center space-x-3">
          <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 shadow-lg shadow-cyan-500/10">
            <Brain className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span>Interview Prep Flashcards</span>
              <span className="px-2 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 text-[10px] font-mono font-bold">
                3D Interactive
              </span>
            </h2>
            <p className="text-xs text-stitch-dim">
              Role-specific questions generated by SDETube AI from your resume &amp; target JD
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center">
          <button
            onClick={handleShuffle}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stitch-surface hover:bg-stitch-card border border-white/[0.08] text-stitch-dim hover:text-white text-xs font-mono font-bold transition-all shadow-sm cursor-pointer"
            title="Randomize card sequence"
          >
            <Shuffle className="w-3.5 h-3.5 text-cyan-400" />
            <span>Shuffle</span>
          </button>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#070a12] border border-white/[0.08] text-stitch-dim text-xs font-mono font-bold">
            <BookmarkCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>{masteredCards.size}/{filteredCards.length} Mastered</span>
          </div>
        </div>
      </div>

      {/* 2. CATEGORY & DIFFICULTY FILTER BAR */}
      <div className="rounded-xl border border-white/[0.08] bg-[#070a12] p-4 shadow-lg space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          
          {/* Category Pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-mono font-bold text-stitch-dim mr-1">Category:</span>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => { setSelectedCategory(cat); setIsFlipped(false); }}
                className={`px-3 py-1 rounded-lg font-mono font-bold transition-all cursor-pointer text-xs ${
                  selectedCategory.toLowerCase() === cat.toLowerCase()
                    ? 'bg-cyan-500 text-white shadow-md shadow-cyan-500/30'
                    : 'bg-[#0e1422] text-stitch-dim hover:text-white border border-white/[0.08]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Difficulty Pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-mono font-bold text-stitch-dim mr-1">Difficulty:</span>
            {difficulties.map(diff => (
              <button
                key={diff}
                onClick={() => { setSelectedDifficulty(diff); setIsFlipped(false); }}
                className={`px-2.5 py-1 rounded-lg font-mono text-[11px] font-bold transition-all cursor-pointer ${
                  selectedDifficulty.toLowerCase() === diff.toLowerCase()
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                    : 'bg-[#0e1422] text-stitch-dim hover:text-white border border-white/[0.08]'
                }`}
              >
                {diff}
              </button>
            ))}
          </div>

        </div>

        {/* Progress Bar */}
        <div className="w-full bg-[#0c101a] h-1.5 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 transition-all duration-300 rounded-full"
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
            className="absolute inset-0 w-full h-full p-6 sm:p-8 rounded-2xl border border-cyan-500/30 bg-[#0c101a] shadow-2xl flex flex-col justify-between"
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
                  <span className="text-xs font-bold text-cyan-300 font-mono tracking-wide uppercase">
                    {activeCard.category} Round Question
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border ${getDifficultyColor(activeCard.difficulty)}`}>
                    {activeCard.difficulty}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-[#070a12] border border-white/[0.08] text-[10px] font-mono text-stitch-dim">
                    #{currentIndex + 1}/{filteredCards.length}
                  </span>
                </div>
              </div>

              {/* Question Text */}
              <div className="my-6">
                <span className="text-[11px] font-mono uppercase font-bold text-cyan-400/80 tracking-wider">
                  Target Question:
                </span>
                <h3 className="text-lg sm:text-xl font-extrabold text-white mt-2 leading-relaxed">
                  "{activeCard.question}"
                </h3>
              </div>
            </div>

            {/* Hint & Flip Trigger */}
            <div className="pt-4 border-t border-white/[0.06] flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-mono text-cyan-300">
                <RotateCcw className="w-3.5 h-3.5 animate-spin-slow" />
                <span>Click card or press [Space] to reveal suggested answer</span>
              </div>
              <span className="px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-500/30 text-[10px] font-mono text-cyan-300">
                Front
              </span>
            </div>
          </div>

          {/* ===================== BACK OF CARD (ANSWER) ===================== */}
          <div
            className="absolute inset-0 w-full h-full p-6 sm:p-8 rounded-2xl border border-emerald-500/40 bg-[#0c101a] shadow-2xl flex flex-col justify-between"
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
                  <span className="px-2.5 py-0.5 rounded-full bg-[#070a12] border border-white/[0.08] text-[10px] font-mono text-stitch-dim">
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
            <div className="pt-4 border-t border-white/[0.06] flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-mono text-emerald-300">
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Click card to see question again</span>
              </div>
              <span className="px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-500/30 text-[10px] font-mono text-emerald-300">
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
          className={`px-4 py-2.5 rounded-xl text-xs font-bold font-mono transition-all flex items-center gap-2 cursor-pointer ${
            isCurrentMastered
              ? 'bg-emerald-950 text-emerald-300 border border-emerald-600 shadow-md shadow-emerald-500/20'
              : 'bg-[#0c101a] hover:bg-stitch-card text-stitch-dim border border-white/[0.08]'
          }`}
        >
          <CheckCircle2 className={`w-4 h-4 ${isCurrentMastered ? 'text-emerald-400' : 'text-slate-500'}`} />
          <span>{isCurrentMastered ? '✓ Mastered' : 'Mark as Mastered'}</span>
        </button>

        {/* Prev / Flip / Next Buttons */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={handlePrev}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#0c101a] hover:bg-stitch-card text-white border border-white/[0.08] text-xs font-mono font-bold transition-all shadow-md active:scale-95 cursor-pointer"
            title="Previous question [Left Arrow]"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Previous</span>
          </button>

          <button
            onClick={handleFlip}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-mono font-bold transition-all shadow-lg shadow-cyan-500/20 active:scale-95 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>{isFlipped ? 'Show Question' : 'Flip to Answer'}</span>
          </button>

          <button
            onClick={handleNext}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#0c101a] hover:bg-stitch-card text-white border border-white/[0.08] text-xs font-mono font-bold transition-all shadow-md active:scale-95 cursor-pointer"
            title="Next question [Right Arrow]"
          >
            <span className="hidden sm:inline">Next</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Card Index Badge */}
        <div className="text-xs font-mono text-stitch-dim">
          Question <span className="font-bold text-white">{currentIndex + 1}</span> of <span className="font-bold text-white">{filteredCards.length}</span>
        </div>
      </div>

      {/* 5. INTERVIEW TIPS FOOTER */}
      <div className="rounded-xl border border-white/[0.08] bg-[#070a12] p-5 space-y-2">
        <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-300 font-mono flex items-center gap-1.5">
          <Lightbulb className="w-4 h-4 text-amber-300" />
          <span>FAANG Interview Tips</span>
        </h4>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-stitch-dim font-mono">
          <li className="flex items-start gap-1.5">
            <span className="text-cyan-400">•</span>
            <span><strong>STAR Method:</strong> Detail Situation, Task, personal Action, and quantified Result.</span>
          </li>
          <li className="flex items-start gap-1.5">
            <span className="text-cyan-400">•</span>
            <span><strong>Think Out Loud:</strong> Interviewers prioritize trade-off analysis over memorized syntax.</span>
          </li>
          <li className="flex items-start gap-1.5">
            <span className="text-cyan-400">•</span>
            <span><strong>Defend Invariants:</strong> For system design, define caching TTLs, partition keys, and failovers.</span>
          </li>
          <li className="flex items-start gap-1.5">
            <span className="text-cyan-400">•</span>
            <span><strong>Clarify Ambiguity:</strong> Ask 1-2 scoping questions on traffic volume before answering.</span>
          </li>
        </ul>
      </div>

    </div>
  );
};
