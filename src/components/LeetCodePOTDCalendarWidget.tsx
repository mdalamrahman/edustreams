import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Calendar, 
  ExternalLink, 
  CheckCircle2, 
  Code2, 
  ChevronLeft, 
  ChevronRight, 
  Flame, 
  Clock, 
  Sparkles,
  Award
} from 'lucide-react';
import { 
  fetchLeetCodeMonthlyPOTD, 
  LeetCodeMonthlyChallengeItem, 
  fetchLeetCodePOTD, 
  LeetCodeDailyQuestion 
} from '../lib/leetcodeApi';
import { SDEProblem } from '../lib/dsaSheetsData';
import { isProblemSlugSolved, markProblemSolved, toggleProblemSolvedGlobally } from '../lib/analytics';

interface LeetCodePOTDCalendarWidgetProps {
  onOpenCodingWorkspace?: (problem: SDEProblem) => void;
  className?: string;
}

export const LeetCodePOTDCalendarWidget: React.FC<LeetCodePOTDCalendarWidgetProps> = ({
  onOpenCodingWorkspace,
  className = ''
}) => {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonthIdx = now.getMonth(); // 0-indexed
  const todayDateNum = now.getDate();
  const todayYMD = now.toISOString().slice(0, 10);

  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedMonth, setSelectedMonth] = useState(currentMonthIdx + 1); // 1-indexed
  const [challenges, setChallenges] = useState<LeetCodeMonthlyChallengeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDayNum, setSelectedDayNum] = useState<number>(todayDateNum);
  const [todayPotd, setTodayPotd] = useState<LeetCodeDailyQuestion | null>(null);
  const [solveEventCount, setSolveEventCount] = useState(0);

  // UTC Countdown to Midnight (next POTD release)
  const [timeLeftStr, setTimeLeftStr] = useState<string>('');

  useEffect(() => {
    const updateCountdown = () => {
      const d = new Date();
      // Seconds remaining until next UTC midnight
      const nowSeconds = d.getUTCHours() * 3600 + d.getUTCMinutes() * 60 + d.getUTCSeconds();
      const remainingSeconds = 86400 - nowSeconds;
      const hours = Math.floor(remainingSeconds / 3600);
      const minutes = Math.floor((remainingSeconds % 3600) / 60);
      const seconds = remainingSeconds % 60;
      setTimeLeftStr(
        `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')} left`
      );
    };

    updateCountdown();
    const timer = setInterval(updateCountdown, 1000);
    return () => clearInterval(timer);
  }, []);

  // Listen for solve events
  useEffect(() => {
    const handleSolve = () => setSolveEventCount((c) => c + 1);
    window.addEventListener('sdetube_potd_solved', handleSolve);
    window.addEventListener('sdetube_problem_solved', handleSolve);
    window.addEventListener('storage', handleSolve);
    return () => {
      window.removeEventListener('sdetube_potd_solved', handleSolve);
      window.removeEventListener('sdetube_problem_solved', handleSolve);
      window.removeEventListener('storage', handleSolve);
    };
  }, []);

  // Fetch today's official POTD
  useEffect(() => {
    fetchLeetCodePOTD()
      .then((res) => {
        if (res?.title) setTodayPotd(res);
      })
      .catch(() => {});
  }, []);

  // Fetch monthly challenges
  const loadMonthChallenges = useCallback(async (y: number, m: number) => {
    setLoading(true);
    try {
      const list = await fetchLeetCodeMonthlyPOTD(y, m);
      setChallenges(list);

      // Auto-detect previous days solved from linked LeetCode profile submissionCalendar
      try {
        const rawLinked = localStorage.getItem('edustream_linked_profiles');
        const lcUser = rawLinked ? JSON.parse(rawLinked)?.leetcodeUsername?.trim() : '';
        if (lcUser) {
          const cachedProfile = localStorage.getItem(`sdetube_leetcode_profile_${lcUser.toLowerCase()}`);
          if (cachedProfile) {
            const parsed = JSON.parse(cachedProfile);
            const subCal = parsed?.matchedUser?.submissionCalendar;
            if (subCal) {
              const calObj = typeof subCal === 'string' ? JSON.parse(subCal) : subCal;
              for (const [secStr, count] of Object.entries(calObj)) {
                if (Number(count) > 0) {
                  const ymd = new Date(Number(secStr) * 1000).toISOString().slice(0, 10);
                  // If within current viewed month
                  const mm = String(m).padStart(2, '0');
                  if (ymd.startsWith(`${y}-${mm}-`)) {
                    if (localStorage.getItem(`sdetube_potd_leetcode_solved_${ymd}`) !== 'true') {
                      localStorage.setItem(`sdetube_potd_leetcode_solved_${ymd}`, 'true');
                      localStorage.setItem(`sdetube_potd_solved_${ymd}`, 'true');
                    }
                    // Also try to sync the slug into global solved list so DSA page shows tick
                    try {
                      // Look up cached monthly challenges to find the slug for this date
                      const cachedMonthlyKey = `sdetube_monthly_potd_${y}_${mm}`;
                      const cachedMonthly = localStorage.getItem(cachedMonthlyKey);
                      if (cachedMonthly) {
                        const monthItems: Array<{ date?: string; question?: { titleSlug?: string; title?: string } }> = JSON.parse(cachedMonthly);
                        const item = monthItems.find(i => i.date === ymd);
                        if (item?.question?.titleSlug) {
                          markProblemSolved(item.question.titleSlug, 0, item.question.titleSlug);
                        }
                      }
                    } catch {}
                  }
                }
              }
            }
          }
        }
      } catch {}
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMonthChallenges(selectedYear, selectedMonth);
  }, [selectedYear, selectedMonth, loadMonthChallenges, solveEventCount]);

  // Calendar calculations
  const calendarData = useMemo(() => {
    const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
    const firstDayOfWeek = new Date(selectedYear, selectedMonth - 1, 1).getDay(); // 0=Sun
    const isCurrentMonth = selectedYear === currentYear && selectedMonth === currentMonthIdx + 1;

    // Map challenges by day
    const challengeMap = new Map<number, LeetCodeMonthlyChallengeItem>();
    challenges.forEach((c) => {
      const dayNum = c.day || (c.date ? parseInt(c.date.split('-')[2], 10) : 0);
      if (dayNum > 0) challengeMap.set(dayNum, c);
    });

    // Ensure today's verified official POTD is always prioritized
    if (isCurrentMonth && todayPotd?.titleSlug) {
      const existing = challengeMap.get(todayDateNum);
      const isPlaceholder = !existing?.question?.titleSlug || 
                            existing.question.titleSlug === 'leetcode-potd-today' || 
                            existing.question.titleSlug.startsWith('daily-');
      if (!challengeMap.has(todayDateNum) || isPlaceholder) {
        challengeMap.set(todayDateNum, {
          date: todayYMD,
          day: todayDateNum,
          link: todayPotd.url,
          question: {
            questionFrontendId: todayPotd.questionFrontendId || todayPotd.questionId,
            title: todayPotd.title,
            titleSlug: todayPotd.titleSlug,
            difficulty: todayPotd.difficulty,
            topicTags: todayPotd.topicTags
          }
        });
      }
    }

    const days: Array<{
      day: number;
      dateStr: string;
      isToday: boolean;
      isFuture: boolean;
      hasChallenge: boolean;
      isSolved: boolean;
      challenge?: LeetCodeMonthlyChallengeItem;
    }> = [];

    let monthSolvedCount = 0;

    for (let d = 1; d <= daysInMonth; d++) {
      const mm = String(selectedMonth).padStart(2, '0');
      const dd = String(d).padStart(2, '0');
      const dateStr = `${selectedYear}-${mm}-${dd}`;
      const isToday = isCurrentMonth && d === todayDateNum;
      const isFuture = isCurrentMonth ? d > todayDateNum : (selectedYear > currentYear || (selectedYear === currentYear && selectedMonth > currentMonthIdx + 1));
      
      const item = challengeMap.get(d);
      const hasChallenge = Boolean(item && item.question?.title);

      // Check solved status
      const localSolved = localStorage.getItem(`sdetube_potd_leetcode_solved_${dateStr}`) === 'true';
      const itemFinished = item?.userStatus === 'Finish';
      const slugSolved = Boolean(item?.question?.titleSlug && isProblemSlugSolved(item.question.titleSlug));
      const isSolved = localSolved || itemFinished || slugSolved;

      if (isSolved && !isFuture) {
        monthSolvedCount++;
      }

      days.push({
        day: d,
        dateStr,
        isToday,
        isFuture,
        hasChallenge,
        isSolved,
        challenge: item
      });
    }

    const monthName = new Date(selectedYear, selectedMonth - 1, 1).toLocaleString('default', { month: 'short' });
    const fullMonthLabel = new Date(selectedYear, selectedMonth - 1, 1).toLocaleString('default', { month: 'long', year: 'numeric' });

    return {
      days,
      firstDayOfWeek,
      daysInMonth,
      monthName,
      fullMonthLabel,
      isCurrentMonth,
      monthSolvedCount
    };
  }, [selectedYear, selectedMonth, challenges, todayPotd, currentYear, currentMonthIdx, todayDateNum, todayYMD, solveEventCount]);

  // Selected Day Challenge Item
  const activeDay = useMemo(() => {
    return calendarData.days.find((d) => d.day === selectedDayNum) || 
      calendarData.days.find((d) => d.isToday) || 
      calendarData.days[0];
  }, [calendarData, selectedDayNum]);

  // Toggle solved status for active day
  const handleToggleSolved = (dayObj: typeof activeDay) => {
    if (!dayObj || dayObj.isFuture) return;
    const current = dayObj.isSolved;
    const next = !current;
    const titleSlug = dayObj.challenge?.question?.titleSlug;
    if (next) {
      localStorage.setItem(`sdetube_potd_leetcode_solved_${dayObj.dateStr}`, 'true');
      localStorage.setItem(`sdetube_potd_solved_${dayObj.dateStr}`, 'true');
      if (titleSlug) {
        // Sync into global solved slugs so DSA Problems page shows tick mark
        markProblemSolved(titleSlug, 0, titleSlug);
      }
    } else {
      localStorage.removeItem(`sdetube_potd_leetcode_solved_${dayObj.dateStr}`);
      // Remove from global solved slugs list
      if (titleSlug) {
        toggleProblemSolvedGlobally(titleSlug);
      }
    }
    window.dispatchEvent(new CustomEvent('sdetube_potd_solved', { detail: { platform: 'leetcode', date: dayObj.dateStr } }));
    setSolveEventCount((c) => c + 1);
  };

  // Solve in SDETube IDE Workspace
  const handleSolveInWorkspace = (dayObj: typeof activeDay) => {
    if (!dayObj?.challenge?.question || !onOpenCodingWorkspace) return;
    const q = dayObj.challenge.question;
    const sdeProblem: SDEProblem = {
      id: q.questionFrontendId ? parseInt(q.questionFrontendId, 10) : 9000 + dayObj.day,
      sheetType: 'sde',
      category: 'LeetCode Daily Challenge',
      subcategory: `POTD ${dayObj.dateStr}`,
      name: q.title,
      leetcode: `https://leetcode.com/problems/${q.titleSlug}/`,
      gfg: `https://www.geeksforgeeks.org/problems/${q.titleSlug}/1`,
      companies: ['LeetCode Daily POTD'],
      difficulty: q.difficulty || 'Medium',
      rating: 'Daily Challenge',
      slug: q.titleSlug
    };
    onOpenCodingWorkspace(sdeProblem);
  };

  const handlePrevMonth = () => {
    if (selectedMonth === 1) {
      setSelectedMonth(12);
      setSelectedYear((y) => y - 1);
    } else {
      setSelectedMonth((m) => m - 1);
    }
    setSelectedDayNum(1);
  };

  const handleNextMonth = () => {
    if (selectedMonth === 12) {
      setSelectedMonth(1);
      setSelectedYear((y) => y + 1);
    } else {
      setSelectedMonth((m) => m + 1);
    }
    setSelectedDayNum(1);
  };

  const diffColor = (diff?: string) => {
    switch ((diff || '').toLowerCase()) {
      case 'easy':
        return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
      case 'hard':
        return 'text-rose-400 bg-rose-500/10 border-rose-500/30';
      default:
        return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
    }
  };

  return (
    <div className={`rounded-2xl bg-[#0d121f] border border-slate-800 shadow-xl overflow-hidden ${className}`}>
      
      {/* 1. HEADER: LeetCode Authentic Style with Day & Countdown & Month Badge */}
      <div className="p-4 border-b border-slate-800/80 bg-slate-950/40">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-black text-white tracking-wide">
                Day {calendarData.isCurrentMonth ? todayDateNum : activeDay?.day || 1}
              </span>
              {calendarData.isCurrentMonth && timeLeftStr && (
                <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-cyan-400" />
                  {timeLeftStr}
                </span>
              )}
            </div>
            <div className="text-[10px] text-slate-500 font-mono mt-0.5">
              SDETube Daily Coding Challenge
            </div>
          </div>

          {/* Month Navigator with Badge */}
          <div className="flex items-center space-x-1">
            <button
              onClick={handlePrevMonth}
              className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
              title="Previous Month"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>

            <div className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-indigo-950/40 border border-indigo-500/30 text-indigo-300 text-xs font-bold font-mono">
              <Award className="w-3.5 h-3.5 text-amber-400" />
              <span>{calendarData.monthName}</span>
            </div>

            <button
              onClick={handleNextMonth}
              className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
              title="Next Month"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 2. CALENDAR MONTH GRID */}
      <div className="p-4 space-y-2">
        {/* Days of Week Header */}
        <div className="grid grid-cols-7 gap-1 text-center font-mono text-[11px] font-bold text-slate-500 pb-1">
          <div>S</div>
          <div>M</div>
          <div>T</div>
          <div>W</div>
          <div>T</div>
          <div>F</div>
          <div>S</div>
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 gap-1 text-[11px] font-mono">
          {/* Empty spacer cells */}
          {Array.from({ length: calendarData.firstDayOfWeek }).map((_, i) => (
            <div key={`spacer-${i}`} className="aspect-square" />
          ))}

          {/* Days */}
          {calendarData.days.map((d) => {
            const isSelected = activeDay?.day === d.day;
            const isAvailable = !d.isFuture && d.hasChallenge;

            // Determine tooltip: If NOT available (future or no data), strictly show "N/A"
            const tooltipText = d.isFuture || !d.hasChallenge
              ? 'N/A'
              : `${calendarData.monthName} ${d.day}: ${d.challenge?.question?.title || 'Challenge'} (${d.challenge?.question?.difficulty || 'Medium'}) • ${d.isSolved ? 'Solved ✓' : 'Unsolved'}`;

            return (
              <button
                key={d.day}
                onClick={() => {
                  if (isAvailable || d.isToday) {
                    setSelectedDayNum(d.day);
                  }
                }}
                title={tooltipText}
                className={`relative aspect-square flex items-center justify-center rounded-lg text-[11px] font-bold transition-all select-none
                  ${isSelected ? 'ring-2 ring-indigo-400 shadow-md' : ''}
                  ${d.isToday && !isSelected ? 'ring-1 ring-amber-400' : ''}
                  ${d.isFuture 
                    ? 'text-slate-700 bg-slate-900/20 cursor-not-allowed' 
                    : isAvailable || d.isToday
                      ? 'cursor-pointer hover:scale-105 active:scale-95'
                      : 'text-slate-600 cursor-default'
                  }
                  ${d.isSolved && !d.isFuture
                    ? 'bg-sky-500/25 text-sky-300 border border-sky-400/70 shadow-sm'
                    : !d.isFuture && (d.hasChallenge || d.isToday)
                      ? 'bg-slate-900/80 text-slate-300 hover:bg-slate-850 border border-slate-800/80'
                      : 'text-slate-600'
                  }
                `}
              >
                {/* Solved checkmark (exact LeetCode blue circular style) or day number */}
                {d.isSolved && !d.isFuture ? (
                  <span className="flex items-center justify-center w-full h-full text-sky-400 font-black">
                    ✓
                  </span>
                ) : (
                  <span>{d.day}</span>
                )}

                {/* Micro dot for days with available challenge that are not yet solved */}
                {!d.isSolved && d.hasChallenge && !d.isFuture && (
                  <span className="absolute bottom-0.5 w-1 h-1 rounded-full bg-amber-400/70" />
                )}
              </button>
            );
          })}
        </div>

        {/* Legend / Hover note */}
        <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono pt-1">
          <span>{calendarData.monthSolvedCount} / {calendarData.isCurrentMonth ? todayDateNum : calendarData.daysInMonth} Solved</span>
          <span className="text-slate-600">Hover day for details • Future days show N/A</span>
        </div>
      </div>

      {/* 3. SELECTED DAY / TODAY'S POTD DETAILS CARD */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-950/60 space-y-3">
        {(() => {
          const activeQ = activeDay?.challenge?.question;
          const activeSlug = activeQ?.titleSlug && !activeQ.titleSlug.startsWith('daily-') && activeQ.titleSlug !== 'leetcode-potd-today' 
            ? activeQ.titleSlug 
            : (activeDay?.isToday && todayPotd?.titleSlug ? todayPotd.titleSlug : '');
          const activeTitle = (activeDay?.isToday && todayPotd?.title)
            ? todayPotd.title
            : (activeQ?.title && activeQ.title !== "Today's Daily Challenge" ? activeQ.title : (activeDay?.isFuture ? "Challenge Not Yet Available" : "SDETube Daily Challenge"));
          const activeDiff = (activeDay?.isToday && todayPotd?.difficulty) ? todayPotd.difficulty : (activeQ?.difficulty || 'Medium');

          return (
            <>
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-bold font-mono text-cyan-400 uppercase tracking-wider">
                      {activeDay?.isToday ? "Today's POTD" : `${calendarData.monthName} ${activeDay?.day} Challenge`}
                    </span>
                    {activeDiff && (
                      <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold border ${diffColor(activeDiff)}`}>
                        {activeDiff}
                      </span>
                    )}
                    {activeDay?.isSolved && (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-sky-400 font-mono">
                        <CheckCircle2 className="w-3 h-3" /> Solved
                      </span>
                    )}
                  </div>

                  <h4 className="text-xs font-bold text-white truncate" title={activeTitle}>
                    {activeTitle}
                  </h4>
                </div>

                {/* Direct Link to Problem Source - only rendered if authentic LeetCode problem slug exists */}
                {activeSlug && (
                  <a
                    href={`https://leetcode.com/problems/${activeSlug}/`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-1 px-2 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 hover:text-amber-300 text-[11px] font-mono transition-all flex-shrink-0 cursor-pointer"
                    title="Solve on LeetCode"
                  >
                    <span>Solve on LeetCode</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-2 pt-1">
                {onOpenCodingWorkspace && activeSlug && (
                  <button
                    onClick={() => handleSolveInWorkspace(activeDay)}
                    className="flex-1 flex items-center justify-center space-x-1.5 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
                  >
                    <Code2 className="w-3.5 h-3.5" />
                    <span>Solve in SDETube IDE</span>
                  </button>
                )}

                {/* Mark as Solved Toggle */}
                {!activeDay?.isFuture && (
                  <button
                    onClick={() => handleToggleSolved(activeDay)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer whitespace-nowrap ${
                      activeDay?.isSolved
                        ? 'bg-sky-950/40 border-sky-500/40 text-sky-300 hover:bg-sky-900/50'
                        : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white hover:border-slate-700'
                    }`}
                  >
                    {activeDay?.isSolved ? 'Unmark Solved' : 'Mark Solved ✓'}
                  </button>
                )}
              </div>
            </>
          );
        })()}
      </div>

    </div>
  );
};
