export type CategoryName = 'DSA' | 'System Design' | 'DBMS' | 'Computer Networks';

export interface Channel {
  id: string;
  telegram_channel_id: number;
  category_name: CategoryName;
  name?: string;
  total_videos?: number;
  description: string;
  icon: string;
  created_at: string;
  post_count?: number;
}

export interface Attachment {
  id: string;
  video_id: string;
  telegram_file_id: string;
  file_name: string;
  file_type: 'pdf' | 'docx' | 'zip' | 'sql' | 'rar' | 'txt' | 'mp4';
  file_size_bytes: number;
  download_url: string;
  created_at: string;
  caption?: string;
}

export interface QuizQuestion {
  id: string;
  video_id?: string;
  type: 'MCQ' | 'CODING';
  question: string;
  options?: string[];
  correct_answer?: number; // Index of correct option for MCQ
  starter_code?: string;
  solution_code?: string;
  explanation?: string;
  difficulty?: 'Easy' | 'Medium' | 'Hard';
}

export interface Video {
  id: string;
  channel_id: string;
  telegram_file_id: string;
  telegram_message_id?: number;
  telegram_caption: string;
  title: string;
  duration_seconds: number;
  transcript: string;
  quiz_json: QuizQuestion[];
  thumbnail_url: string;
  stream_url: string;
  created_at: string;
  sender_username?: string;
  attachments?: Attachment[];
}

export interface QuestionAttempt {
  id: string;
  user_id: string;
  video_id?: string;
  question_type: 'MCQ' | 'CODING';
  question_title?: string;
  time_taken_seconds: number;
  is_correct: boolean;
  attempted_at: string;
}

export interface UserAnalytics {
  id: string;
  user_id: string;
  activity_type: 'LECTURE' | 'QUIZ' | 'CODING';
  duration_seconds: number;
  logged_at: string;
}

export interface CodeExecutionResult {
  stdout: string;
  stderr: string;
  exit_code: number;
  execution_time_ms: number;
  memory_used_kb: number;
  status: 'SUCCESS' | 'ERROR' | 'TIMEOUT';
}

export interface AIDiagnosticReport {
  solving_velocity_qpm: number;
  academic_performance: string;
  strengths: string[];
  weaknesses: string[];
  recommended_lectures: string[];
  summary: string;
}
