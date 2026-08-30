import { executeAIChatCascade } from './mistral';

export interface ParsedCandidateProfile {
  name: string;
  experienceYears: number | string;
  currentRole: string;
  techStack: string[];
  keyProjects: string[];
  strengths: string[];
  rawResumeText?: string;
}

/**
 * Extracts human-readable text from uploaded PDF or plain text files in the browser.
 */
export async function extractTextFromFile(file: File): Promise<string> {
  const fileName = file.name.toLowerCase();

  // 1. Plain text / Markdown / JSON files
  if (fileName.endsWith('.txt') || fileName.endsWith('.md') || fileName.endsWith('.json') || fileName.endsWith('.csv')) {
    return await file.text();
  }

  // 2. PDF file binary text extraction
  if (fileName.endsWith('.pdf')) {
    try {
      const buffer = await file.arrayBuffer();
      const uint8 = new Uint8Array(buffer);
      const textDecoder = new TextDecoder('utf-8', { fatal: false });
      const rawString = textDecoder.decode(uint8);

      // Extract text inside PDF stream text blocks (BT ... ET, Tj, TJ)
      const extractedChunks: string[] = [];
      const textBlockRegex = /BT[\s\S]*?ET/g;
      const matches = rawString.match(textBlockRegex) || [];

      for (const block of matches) {
        // Match string literals: (Text) Tj or [(T)(e)(x)(t)] TJ
        const literalRegex = /\(([^)]+)\)/g;
        let litMatch: RegExpExecArray | null;
        let blockText = '';
        while ((litMatch = literalRegex.exec(block)) !== null) {
          blockText += litMatch[1] + ' ';
        }
        if (blockText.trim().length > 0) {
          extractedChunks.push(blockText.trim());
        }
      }

      if (extractedChunks.length > 5) {
        return extractedChunks.join('\n');
      }

      // Fallback: Filter printable ASCII strings from raw PDF stream
      const printableMatches = rawString.match(/[A-Za-z0-9,.:;'"\-_@/#&()\s]{5,}/g) || [];
      const filtered = printableMatches.filter(s => 
        !s.startsWith('/Font') && 
        !s.startsWith('/Type') && 
        !s.startsWith('/ProcSet') &&
        s.trim().length > 4
      );

      return filtered.slice(0, 120).join(' ');
    } catch (err) {
      console.warn('PDF extraction notice:', err);
    }
  }

  // Fallback default
  try {
    return await file.text();
  } catch {
    return `Uploaded file: ${file.name}`;
  }
}

/**
 * Uses Mistral AI to parse and extract structured candidate profile and project context from resume text.
 */
export async function analyzeResumeWithAI(resumeText: string): Promise<ParsedCandidateProfile> {
  const prompt = `You are a Principal Engineering Recruiter and Technical Bar Raiser at a FAANG company.
Analyze this candidate's resume and extract their technical profile.

RESUME CONTENT:
\`\`\`
${resumeText.slice(0, 4000)}
\`\`\`

Respond STRICTLY in valid JSON matching this schema:
{
  "name": "Candidate Full Name (or Candidate if not found)",
  "experienceYears": 3,
  "currentRole": "Software Engineer / SDE-2",
  "techStack": ["Go", "React", "PostgreSQL", "Redis", "Kafka", "AWS"],
  "keyProjects": ["Real-time ride matching backend", "Microservices migration from monolithic Python"],
  "strengths": ["High-concurrency systems", "Distributed caching", "Clean API design"]
}`;

  try {
    const raw = await executeAIChatCascade([
      { role: 'user', content: prompt }
    ], { temperature: 0.1, responseFormatJson: true });

    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        name: parsed.name || 'Candidate',
        experienceYears: parsed.experienceYears || '2-4',
        currentRole: parsed.currentRole || 'Software Engineer',
        techStack: parsed.techStack || ['C++', 'Python', 'System Design'],
        keyProjects: parsed.keyProjects || ['Scalable Backend Architecture'],
        strengths: parsed.strengths || ['Problem Solving', 'Data Structures'],
        rawResumeText: resumeText
      };
    }
  } catch (err) {
    console.error('Resume AI analysis error:', err);
  }

  // Graceful fallback
  return {
    name: 'Candidate',
    experienceYears: 2,
    currentRole: 'Software Engineer',
    techStack: ['C++', 'Java', 'Python', 'System Design', 'SQL'],
    keyProjects: ['Distributed Backend Systems', 'Full Stack Architecture'],
    strengths: ['Algorithmic Problem Solving', 'Clean Code Modularity'],
    rawResumeText: resumeText
  };
}
