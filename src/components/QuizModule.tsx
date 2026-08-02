import React, { useState } from 'react';
import { HelpCircle, CheckCircle2, XCircle, Sparkles, ArrowRight, Award } from 'lucide-react';
import confetti from 'canvas-confetti';
import { QuizQuestion } from '../lib/types';

interface QuizModuleProps {
  questions: QuizQuestion[];
  onQuizSubmitted?: (timeTakenSeconds: number, isCorrect: boolean) => void;
}

export const QuizModule: React.FC<QuizModuleProps> = ({ questions, onQuizSubmitted }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [startTime] = useState(Date.now());

  if (!questions || questions.length === 0) {
    return (
      <div className="glass-panel rounded-2xl p-6 text-center border border-slate-800">
        <Sparkles className="w-8 h-8 text-indigo-400 mx-auto mb-2" />
        <h3 className="text-sm font-semibold text-slate-200">Generating AI Quiz...</h3>
        <p className="text-xs text-slate-400 mt-1">Mistral AI is parsing lecture transcript into conceptual MCQs.</p>
      </div>
    );
  }

  const currentQ = questions[currentIndex];

  const handleSelectOption = (idx: number) => {
    if (isAnswered) return;
    setSelectedOption(idx);
  };

  const handleSubmitAnswer = () => {
    if (selectedOption === null || isAnswered) return;
    setIsAnswered(true);

    const isCorrect = selectedOption === currentQ.correct_answer;
    if (isCorrect) {
      setScore((prev) => prev + 1);
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
    }

    const elapsedSeconds = Math.max(10, Math.round((Date.now() - startTime) / 1000));
    if (onQuizSubmitted) {
      onQuizSubmitted(elapsedSeconds, isCorrect);
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    }
  };

  return (
    <div className="glass-panel rounded-2xl p-5 border border-slate-800/80 shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-4">
        <div className="flex items-center space-x-2">
          <HelpCircle className="w-5 h-5 text-indigo-400" />
          <h3 className="text-sm font-semibold text-slate-100">Mistral AI Conceptual MCQ Quiz</h3>
        </div>

        <div className="flex items-center space-x-2 font-mono text-xs">
          <span className="px-2.5 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-slate-300">
            Question {currentIndex + 1} of {questions.length}
          </span>
          <span className="px-2.5 py-0.5 rounded-full bg-emerald-950 border border-emerald-800 text-emerald-300 font-bold">
            Score: {score}
          </span>
        </div>
      </div>

      {/* Question Text */}
      <div className="mb-5">
        <h4 className="text-sm sm:text-base font-semibold text-slate-100 leading-snug">
          {currentQ.question}
        </h4>
      </div>

      {/* Options List */}
      <div className="space-y-2.5 mb-5">
        {currentQ.options?.map((option, idx) => {
          let optionStyle = 'bg-slate-900/80 hover:bg-slate-800/80 border-slate-800 text-slate-300';
          
          if (selectedOption === idx) {
            optionStyle = 'bg-indigo-950/90 border-indigo-500 text-white font-semibold shadow-md shadow-indigo-600/20';
          }

          if (isAnswered) {
            if (idx === currentQ.correct_answer) {
              optionStyle = 'bg-emerald-950/90 border-emerald-500 text-emerald-200 font-semibold';
            } else if (selectedOption === idx && idx !== currentQ.correct_answer) {
              optionStyle = 'bg-red-950/90 border-red-500 text-red-200 font-semibold';
            }
          }

          return (
            <button
              key={idx}
              onClick={() => handleSelectOption(idx)}
              disabled={isAnswered}
              className={`w-full text-left p-3.5 rounded-xl border text-xs sm:text-sm transition-all flex items-center justify-between ${optionStyle}`}
            >
              <div className="flex items-center space-x-3">
                <span className="w-6 h-6 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center font-mono text-xs font-bold text-slate-400">
                  {String.fromCharCode(65 + idx)}
                </span>
                <span>{option}</span>
              </div>

              {isAnswered && idx === currentQ.correct_answer && (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
              )}
              {isAnswered && selectedOption === idx && idx !== currentQ.correct_answer && (
                <XCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
              )}
            </button>
          );
        })}
      </div>

      {/* Explanation Box */}
      {isAnswered && currentQ.explanation && (
        <div className="p-3.5 rounded-xl bg-slate-950 border border-indigo-900/50 mb-4 text-xs text-slate-300">
          <strong className="text-indigo-400 font-semibold flex items-center gap-1 mb-1">
            <Sparkles className="w-3.5 h-3.5" /> Mistral AI Explanation:
          </strong>
          {currentQ.explanation}
        </div>
      )}

      {/* Footer Controls */}
      <div className="flex justify-end">
        {!isAnswered ? (
          <button
            onClick={handleSubmitAnswer}
            disabled={selectedOption === null}
            className={`px-5 py-2 rounded-xl font-semibold text-xs transition-all shadow-md ${
              selectedOption !== null
                ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
            }`}
          >
            Submit Answer
          </button>
        ) : currentIndex < questions.length - 1 ? (
          <button
            onClick={handleNext}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-xs flex items-center space-x-2 shadow-md shadow-indigo-600/30"
          >
            <span>Next Question</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <div className="flex items-center space-x-2 text-emerald-400 text-xs font-bold bg-emerald-950/80 px-4 py-2 rounded-xl border border-emerald-800">
            <Award className="w-4 h-4" />
            <span>Quiz Complete! ({score}/{questions.length} Correct)</span>
          </div>
        )}
      </div>

    </div>
  );
};
