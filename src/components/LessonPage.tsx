import React, { useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Sparkles, 
  Database, 
  Code2, 
  HelpCircle 
} from 'lucide-react';
import { VideoPlayer } from './VideoPlayer';
import { ResourceCard } from './ResourceCard';
import { AINotesAndSimulation } from './AINotesAndSimulation';
import { useAppContext } from '../lib/AppContext';
import { MOCK_CHANNELS, MOCK_VIDEOS } from '../lib/supabase';
import { toSlug, PREDEFINED_SPECIAL_PROBLEMS } from '../lib/problemService';
import { SDE_SHEET_DATA, SDEProblem } from '../lib/dsaSheetsData';

export const LessonPage: React.FC = () => {
  const { videoId } = useParams<{ videoId?: string }>();
  const navigate = useNavigate();

  const {
    dynamicVideos,
    selectedVideo,
    setSelectedVideo,
    videoArtifacts,
    catalogLoading,
    activeVideoQuiz,
    isGeneratingMoreQuiz,
    handleAttemptMoreQuestions,
    handleQuizSubmitted,
    handleAutoComplete,
    openAskAIWithMode,
  } = useAppContext();

  // If videoId is provided in URL, sync selectedVideo
  useEffect(() => {
    if (!videoId) return;
    const decoded = decodeURIComponent(videoId);
    const list = dynamicVideos.length > 0 ? dynamicVideos : MOCK_VIDEOS;
    const found = list.find(
      (v) =>
        v.id === decoded ||
        v.title === decoded ||
        String(v.telegram_message_id) === decoded
    );
    if (found && found.id !== selectedVideo.id) {
      setSelectedVideo(found);
    }
  }, [videoId, dynamicVideos, selectedVideo.id, setSelectedVideo]);

  const activeChannelObj = useMemo(() => {
    return MOCK_CHANNELS.find((c) => c.id === selectedVideo.channel_id) || MOCK_CHANNELS[0];
  }, [selectedVideo.channel_id]);

  const channelVideos = useMemo(() => {
    const list = dynamicVideos.length > 0 ? dynamicVideos : MOCK_VIDEOS;
    return list.filter((v) => v.channel_id === selectedVideo.channel_id);
  }, [dynamicVideos, selectedVideo.channel_id]);

  const currentIndex = useMemo(() => {
    return channelVideos.findIndex((v) => v.id === selectedVideo.id);
  }, [channelVideos, selectedVideo.id]);

  const hasNextLecture = currentIndex >= 0 && currentIndex < channelVideos.length - 1;
  const hasPrevLecture = currentIndex > 0;

  const handleNextLecture = () => {
    if (hasNextLecture) {
      const nextVid = channelVideos[currentIndex + 1];
      setSelectedVideo(nextVid);
      navigate(`/lesson/${encodeURIComponent(nextVid.id)}`);
    }
  };

  const handlePrevLecture = () => {
    if (hasPrevLecture) {
      const prevVid = channelVideos[currentIndex - 1];
      setSelectedVideo(prevVid);
      navigate(`/lesson/${encodeURIComponent(prevVid.id)}`);
    }
  };

  const handleOpenCodingIde = () => {
    const cleanName = selectedVideo.title.replace(/\.(mp4|mkv)$/i, '').replace(/_/g, ' ');
    const videoSlug = toSlug(cleanName);
    navigate(`/problem/${videoSlug}`);
  };

  const isSqlLesson = useMemo(() => {
    const chName = (activeChannelObj?.name || '').toLowerCase();
    const title = (selectedVideo.title || '').toLowerCase();
    return (
      activeChannelObj?.id === 'ch-dbms-03' ||
      chName.includes('dbms') ||
      chName.includes('sql') ||
      chName.includes('database') ||
      title.includes('sql') ||
      title.includes('dbms') ||
      title.includes('query') ||
      title.includes('join') ||
      title.includes('database')
    );
  }, [activeChannelObj, selectedVideo.title]);

  const isCodingLesson = useMemo(() => {
    const chName = (activeChannelObj?.name || '').toLowerCase();
    const title = (selectedVideo.title || '').toLowerCase();
    return (
      activeChannelObj?.id === 'ch-dsa-01' ||
      activeChannelObj?.id === 'ch-sys-design' ||
      chName.includes('system design') ||
      chName.includes('lld') ||
      chName.includes('design') ||
      chName.includes('dsa') ||
      title.includes('dsa') ||
      title.includes('array') ||
      title.includes('tree') ||
      title.includes('graph') ||
      title.includes('solid') ||
      title.includes('srp') ||
      title.includes('ocp') ||
      title.includes('pattern') ||
      title.includes('design') ||
      Boolean(videoArtifacts?.coding_problem)
    );
  }, [activeChannelObj, selectedVideo.title, videoArtifacts]);

  return (
    <div className="space-y-6">
      {/* Top Workspace Lecture Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/90 p-3.5 rounded-2xl border border-slate-800 shadow-xl">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-bold border border-slate-700 transition-all shadow-sm active:scale-95 cursor-pointer"
            title="Return to previous screen"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>

          <div className="hidden md:flex items-center space-x-2">
            <span className="text-xs text-indigo-300 font-mono font-bold px-3 py-1 rounded-xl bg-indigo-950 border border-indigo-700/50 truncate max-w-sm">
              {selectedVideo.title}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => openAskAIWithMode('notes')}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-purple-950 hover:bg-purple-900 border border-purple-700/60 text-purple-300 text-xs font-bold transition-all shadow-sm cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Ask AI</span>
          </button>

          {isSqlLesson ? (
            <button
              onClick={() => navigate('/problem/sql-arena?type=sql')}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-cyan-600 via-sky-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white text-xs font-bold transition-all shadow-md active:scale-95 border border-cyan-400/40 cursor-pointer"
            >
              <Database className="w-4 h-4 text-cyan-200" />
              <span>Open SQL Compiler</span>
            </button>
          ) : isCodingLesson ? (
            <button
              onClick={handleOpenCodingIde}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold transition-all shadow-md active:scale-95 border border-indigo-400/40 cursor-pointer"
            >
              <Code2 className="w-4 h-4" />
              <span>Open Coding IDE</span>
            </button>
          ) : (
            <button
              onClick={() => openAskAIWithMode('quiz')}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-950 hover:bg-emerald-900 border border-emerald-700/60 text-emerald-300 text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer"
            >
              <HelpCircle className="w-4 h-4 text-emerald-400" />
              <span>Practice MCQ Quiz</span>
            </button>
          )}
        </div>
      </div>

      {/* Split Screen Grid: Left Video, Right Algomaster SDE Notes & Simulation */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Video Player with Next/Prev Controls */}
        <div className="lg:col-span-6 xl:col-span-6 space-y-6">
          <VideoPlayer
            video={selectedVideo}
            videoArtifacts={videoArtifacts}
            onNextLecture={handleNextLecture}
            onPrevLecture={handlePrevLecture}
            hasNextLecture={hasNextLecture}
            hasPrevLecture={hasPrevLecture}
            onOpenAskAI={(mode, timestamp) => openAskAIWithMode(mode || 'video', timestamp)}
            onAutoComplete={handleAutoComplete}
          />
          <ResourceCard
            attachments={selectedVideo.attachments || []}
            channelId={selectedVideo.channel_id}
            messageId={selectedVideo.telegram_message_id}
          />
        </div>

        {/* Right Column: MCQ Quiz Primary View with SDE Study Notes & Simulation Tabs */}
        <div className="lg:col-span-6 xl:col-span-6 min-h-[500px]">
          <AINotesAndSimulation
            video={selectedVideo}
            videoArtifacts={videoArtifacts}
            questions={activeVideoQuiz}
            isLoading={catalogLoading}
            onOpenAskAI={openAskAIWithMode}
            onQuizSubmitted={handleQuizSubmitted}
            onAttemptMoreQuestions={handleAttemptMoreQuestions}
            isGeneratingMoreQuiz={isGeneratingMoreQuiz}
          />
        </div>
      </div>
    </div>
  );
};
