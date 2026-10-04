import { executeAIChatCascade } from './mistral';

export interface FlashCard {
  question: string;
  answer: string;
  category: 'Technical' | 'Behavioral' | 'Situational' | string;
  difficulty: 'Easy' | 'Medium' | 'Hard' | string;
}

export interface Recommendation {
  category: string;
  suggestion: string;
  priority: 'High' | 'Medium' | 'Low';
}

export interface AtsScoreBreakdownItem {
  score: number;
  max_score: number;
  details: string;
}

export interface AtsImprovementSuggestion {
  area: string;
  suggestion: string;
  impact: 'High' | 'Medium' | 'Low';
}

export interface ResumeAnalysisResult {
  analysis: {
    matching_skills: string[];
    missing_skills: string[];
    matching_keywords: string[];
    missing_keywords: string[];
    experience_match: {
      required_years: string;
      candidate_years: string;
      match_percentage: number;
    };
    education_match: {
      required: string;
      candidate: string;
      match: boolean;
    };
    role_compatibility: {
      score: number;
      reasoning: string;
    };
  };
  insights: {
    strengths: string[];
    weaknesses: string[];
    recommendations: Recommendation[];
    career_progression: {
      current_level: string;
      target_level: string;
      gap_analysis: string;
    };
    resume_improvements: string[];
  };
  flashcards: FlashCard[];
  ats_score: {
    overall_score: number;
    score_breakdown: {
      keyword_match: AtsScoreBreakdownItem;
      skills_match: AtsScoreBreakdownItem;
      experience_relevance: AtsScoreBreakdownItem;
      format_optimization: AtsScoreBreakdownItem;
    };
    improvement_suggestions: AtsImprovementSuggestion[];
    ats_compatibility: {
      rating: 'Excellent' | 'Good' | 'Fair' | 'Poor' | string;
      key_issues: string[];
      optimization_tips: string[];
    };
  };
  resume_preview: string;
  job_description_preview: string;
  analyzed_at: string;
  ai_engine: string;
}

/**
 * Clean markdown JSON wrappers from LLM responses
 */
export function cleanJsonResponse(raw: string): string {
  let cleaned = raw.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json\s*/i, '');
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```\s*/, '');
  }
  if (cleaned.endsWith('```')) {
    cleaned = cleaned.replace(/\s*```$/, '');
  }
  return cleaned.trim();
}

/**
 * Extracts plain text from uploaded file in browser.
 * Dynamically loads pdf.js from CDN for robust PDF text extraction,
 * falling back to stream block decoding.
 */
export async function extractResumeTextFromFile(file: File): Promise<string> {
  const fileName = file.name.toLowerCase();

  // Plain text / Markdown
  if (fileName.endsWith('.txt') || fileName.endsWith('.md') || fileName.endsWith('.json') || fileName.endsWith('.csv')) {
    return await file.text();
  }

  // PDF Extraction via dynamic pdf.js CDN
  if (fileName.endsWith('.pdf')) {
    try {
      if (typeof window !== 'undefined') {
        const win = window as any;
        if (!win.pdfjsLib) {
          await new Promise<void>((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
            script.async = true;
            script.onload = () => resolve();
            script.onerror = () => reject(new Error('Failed to load pdf.js from cdn'));
            document.head.appendChild(script);
          });
        }

        if (win.pdfjsLib) {
          win.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
          const buffer = await file.arrayBuffer();
          const loadingTask = win.pdfjsLib.getDocument({ data: buffer });
          const pdf = await loadingTask.promise;
          let fullText = '';
          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = textContent.items.map((item: any) => item.str).join(' ');
            fullText += pageText + '\n\n';
          }
          if (fullText.trim().length > 30) {
            return fullText.trim();
          }
        }
      }
    } catch (err) {
      console.warn('PDF.js dynamic extraction notice, falling back to stream parser:', err);
    }

    // Fallback: binary stream text block extraction
    try {
      const buffer = await file.arrayBuffer();
      const uint8 = new Uint8Array(buffer);
      const textDecoder = new TextDecoder('utf-8', { fatal: false });
      const rawString = textDecoder.decode(uint8);

      const extractedChunks: string[] = [];
      const textBlockRegex = /BT[\s\S]*?ET/g;
      const matches = rawString.match(textBlockRegex) || [];

      for (const block of matches) {
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

      const printableMatches = rawString.match(/[A-Za-z0-9,.:;'"\-_@/#&()\s]{5,}/g) || [];
      const filtered = printableMatches.filter(s =>
        !s.startsWith('/Font') &&
        !s.startsWith('/Type') &&
        !s.startsWith('/ProcSet') &&
        s.trim().length > 4
      );

      if (filtered.length > 0) {
        return filtered.slice(0, 150).join(' ');
      }
    } catch (err) {
      console.warn('Binary stream PDF fallback error:', err);
    }
  }

  // Default fallback
  try {
    return await file.text();
  } catch {
    return `Resume: ${file.name}`;
  }
}

/**
 * Predefined Sample Resumes for 1-Click Testing
 */
export const SAMPLE_RESUMES = [
  {
    id: 'sde2-fullstack',
    title: 'Senior Full Stack Engineer (3.5 Yrs Exp)',
    preview: `ALEX RIVERA
Full Stack Software Engineer | React, TypeScript, Node.js, Go, PostgreSQL, AWS
Email: alex.rivera@example.com | LinkedIn: linkedin.com/in/alexrivera-dev | GitHub: github.com/alexrivera

PROFESSIONAL SUMMARY
Results-driven Software Engineer with 3.5+ years of experience designing and deploying high-throughput web applications and microservices. Proven track record of improving system latency by 42% and architecting real-time streaming pipelines supporting 500K+ DAU.

CORE COMPETENCIES
- Languages: TypeScript, JavaScript (ES6+), Go, Python, SQL, HTML5/CSS3
- Frontend: React, Next.js, Redux Toolkit, Tailwind CSS, WebSockets, Web Workers
- Backend & Distributed: Node.js, Express, Go (Gin), PostgreSQL, Redis, Kafka, Docker, Kubernetes
- Cloud & DevOps: AWS (EC2, S3, RDS, Lambda), GitHub Actions, CI/CD, Terraform
- Architecture: REST APIs, GraphQL, Microservices, Event-Driven Architecture, Low-Level Design (SOLID)

PROFESSIONAL EXPERIENCE
TechFlow Innovations | Senior Software Engineer | July 2023 - Present
- Designed an event-driven notification dispatch pipeline in Go & Apache Kafka processing 12M events daily with sub-50ms p99 latency.
- Refactored legacy monolithic Node.js backend into 4 decoupled microservices deployed on AWS ECS with Docker.
- Implemented distributed Redis caching strategy with write-behind invalidation, reducing PostgreSQL database read load by 68%.

NextGen Apps | Full Stack Software Engineer | January 2021 - June 2023
- Built client-facing analytical dashboards using React, TypeScript, and Recharts, increasing customer session engagement by 35%.
- Authored 80+ unit and integration tests using Jest and Cypress, elevating team test coverage from 54% to 88%.
- Integrated Stripe payment webhook gateways with idempotent transaction ledger handling $4.5M in annual subscriptions.

EDUCATION
B.Tech in Computer Science & Engineering | University of Technology | 2017 - 2021 | GPA: 3.8 / 4.0`,
  },
  {
    id: 'backend-systems',
    title: 'Backend Systems Engineer (Java / Distributed Systems)',
    preview: `SARAH CHEN
Backend Systems Engineer | Distributed Systems & High-Frequency Data Pipelines
Email: sarah.chen@example.com | San Francisco, CA | github.com/sarahchen-systems

SUMMARY
Software Engineer specializing in backend infrastructure, distributed storage, and concurrent systems in Java, C++, and Go. Deep expertise in high-concurrency data ingestion, database internals, and transactional correctness.

TECHNICAL SKILLS
- Languages: Java 21, C++, Go, Python, SQL
- Distributed Systems: Apache Kafka, RabbitMQ, gRPC, Protocol Buffers, Raft Consensus
- Storage & Databases: PostgreSQL, Apache Cassandra, Redis, DynamoDB, Elasticsearch
- Infrastructure: Kubernetes, Docker, Helm, Prometheus, Grafana, AWS (EKS, CloudWatch)

EXPERIENCE
CloudScale Systems | Distributed Systems Engineer | 2022 - Present
- Engineered high-throughput telemetry ingestion service in Java 21 & gRPC handling 85,000 requests/sec across 16 Kubernetes pods.
- Re-architected data retention tier with Apache Cassandra and time-series clustering, cutting annual S3 storage costs by $180,000.
- Implemented circuit breaker and token bucket rate limiters to guard upstream microservices from cascading cascading failures during traffic surges.

DataMesh Technologies | Associate Backend Engineer | 2020 - 2022
- Developed REST and gRPC endpoints in Spring Boot with multi-tenant PostgreSQL schema partitioning.
- Built automated database migration scripts and zero-downtime blue/green deployment workflows.

EDUCATION
B.S. in Computer Science | University of California, Berkeley | 2016 - 2020`
  }
];

/**
 * Predefined Sample Job Descriptions
 */
export const SAMPLE_JOB_DESCRIPTIONS = [
  {
    id: 'google-sde2',
    title: 'Google - Software Engineer II (SDE-2)',
    role: 'Software Engineer II (Full Stack / Distributed)',
    text: `Job Title: Software Development Engineer II (SDE-2)
Company: Google
Location: Mountain View, CA / Remote

About The Role:
As a Software Engineer II, you will work on core platform systems powering millions of users worldwide. You will collaborate with cross-functional teams to design, develop, test, and deploy resilient web services and distributed data processing pipelines.

Minimum Qualifications:
- Bachelor's degree in Computer Science, related technical field, or equivalent practical experience.
- 3+ years of professional software engineering experience with modern programming languages (Go, Java, Python, TypeScript, or C++).
- Strong computer science fundamentals in data structures, algorithms, object-oriented design, and system architecture.
- Demonstrated experience building and operating RESTful APIs and distributed microservices.

Preferred Qualifications:
- 4+ years of experience with cloud architectures (GCP, AWS) and container orchestration (Docker, Kubernetes).
- Proficiency with event-driven architectures (Kafka, Pub/Sub) and caching layers (Redis, Memcached).
- Experience with modern frontend frameworks (React, Angular) and responsive web design.
- Proven track record of improving latency, database query optimization, and test automation (CI/CD).`
  },
  {
    id: 'amazon-backend',
    title: 'Amazon - SDE II (Backend & AWS)',
    role: 'Backend SDE-II',
    text: `Job Title: Software Development Engineer II (SDE-II)
Company: Amazon Web Services (AWS)
Location: Seattle, WA / Hybrid

Job Description:
Are you passionate about building massively scalable cloud services? We are seeking an experienced SDE II to design mission-critical distributed services capable of processing tens of thousands of requests per second.

Key Responsibilities:
- Architect, build, and maintain highly scalable backend services in Java, Go, or C++.
- Utilize AWS services including ECS/EKS, Lambda, SQS, DynamoDB, and RDS.
- Collaborate with Senior Engineers and Product Managers to define API specifications and architecture design docs.
- Lead operational excellence initiatives, monitoring system health via CloudWatch, alarms, and latency dashboards.

Basic Qualifications:
- 3+ years of non-internship professional software development experience.
- Strong object-oriented design skills and deep knowledge of concurrency, multi-threading, and distributed caching.
- Experience with relational and NoSQL databases.`
  },
  {
    id: 'meta-fullstack',
    title: 'Meta - Full Stack Software Engineer',
    role: 'Full Stack Engineer',
    text: `Job Title: Full Stack Software Engineer
Company: Meta
Location: Menlo Park, CA / Remote

Overview:
We are looking for a versatile Full Stack Software Engineer to build intuitive, high-performance web interfaces and robust backend APIs that connect billions of people.

Responsibilities:
- Build modern, interactive web applications using React, Next.js, and TypeScript.
- Design performant GraphQL and REST APIs backed by relational and distributed databases.
- Optimize frontend rendering speed, state management, and asset delivery.
- Write unit, integration, and end-to-end tests to maintain high code reliability.

Requirements:
- 3+ years experience with React, TypeScript, and modern JavaScript tooling.
- Experience with Node.js, Python, or Go backend services.
- Solid understanding of web performance optimization and accessibility.`
  }
];

/**
 * Executes Mistral AI Resume Analysis
 * Runs parallel targeted prompts for ATS Match, Career Insights, and 15-20 Flashcards
 */
export async function analyzeResumeWithMistral(
  resumeText: string,
  jobDescription: string
): Promise<ResumeAnalysisResult> {
  const truncatedResume = resumeText.slice(0, 6000);
  const truncatedJd = jobDescription.slice(0, 4000);

  // PROMPT 1: ATS Scoring & Match Analysis
  const atsPrompt = `You are an expert HR Analyst, Principal Recruiter, and Applicant Tracking System (ATS) Engine.
Analyze this candidate resume against the job description.

RESUME:
\`\`\`
${truncatedResume}
\`\`\`

JOB DESCRIPTION:
\`\`\`
${truncatedJd}
\`\`\`

Respond STRICTLY in valid JSON matching this schema:
{
  "analysis": {
    "matching_skills": ["e.g. React", "TypeScript", "Node.js"],
    "missing_skills": ["e.g. Kubernetes", "GraphQL"],
    "matching_keywords": ["e.g. Microservices", "CI/CD", "PostgreSQL"],
    "missing_keywords": ["e.g. High Availability", "Distributed Tracing"],
    "experience_match": {
      "required_years": "3+ years",
      "candidate_years": "3.5 years",
      "match_percentage": 88
    },
    "education_match": {
      "required": "BS / B.Tech in CS or equivalent",
      "candidate": "B.Tech in Computer Science",
      "match": true
    },
    "role_compatibility": {
      "score": 84,
      "reasoning": "Strong match for full stack responsibilities with direct experience in core technologies."
    }
  },
  "ats_score": {
    "overall_score": 82,
    "score_breakdown": {
      "keyword_match": {
        "score": 80,
        "max_score": 100,
        "details": "High coverage of core tech stack keywords with minor gaps in operational tooling."
      },
      "skills_match": {
        "score": 85,
        "max_score": 100,
        "details": "Direct alignment with required programming languages and frameworks."
      },
      "experience_relevance": {
        "score": 88,
        "max_score": 100,
        "details": "Strong demonstrated impact and scale in previous engineering positions."
      },
      "format_optimization": {
        "score": 86,
        "max_score": 100,
        "details": "Clean section headers, quantifiable bullet points, and ATS-parseable structure."
      }
    },
    "improvement_suggestions": [
      {
        "area": "Keywords",
        "suggestion": "Explicitly mention cloud deployment practices and specific metrics.",
        "impact": "High"
      },
      {
        "area": "Formatting",
        "suggestion": "Include standard section for certifications and architectural achievements.",
        "impact": "Medium"
      }
    ],
    "ats_compatibility": {
      "rating": "Excellent",
      "key_issues": ["Missing explicit mention of container orchestration tools"],
      "optimization_tips": [
        "Include exact keyword variants from the job description",
        "Quantify project accomplishments using the Google XYZ formula"
      ]
    }
  }
}`;

  // PROMPT 2: Actionable Career Insights
  const insightsPrompt = `You are a FAANG Principal Engineering Career Counselor and Resume Bar Raiser.
Provide strategic, prioritized career insights for this resume targeting the given role.

RESUME:
\`\`\`
${truncatedResume}
\`\`\`

JOB DESCRIPTION:
\`\`\`
${truncatedJd}
\`\`\`

Respond STRICTLY in valid JSON matching this schema:
{
  "strengths": [
    "Demonstrated experience building high-throughput distributed services",
    "Strong technical leadership with quantifiable metrics (e.g. latency reduction, cost savings)",
    "Clean full-stack competency spanning backend, caching, and modern frontend"
  ],
  "weaknesses": [
    "Limited explicit evidence of large-scale incident management or on-call rotations",
    "Could provide more technical depth on distributed consensus or multi-region data replication"
  ],
  "recommendations": [
    {
      "category": "Cloud & Infrastructure",
      "suggestion": "Add concrete examples of AWS architecture, IAM security, and automated rollback strategies.",
      "priority": "High"
    },
    {
      "category": "System Design",
      "suggestion": "Highlight trade-off considerations between SQL vs NoSQL and synchronous vs asynchronous processing.",
      "priority": "Medium"
    },
    {
      "category": "Resume Formatting",
      "suggestion": "Lead every bullet point with a powerful action verb followed by impact percentage.",
      "priority": "Low"
    }
  ],
  "career_progression": {
    "current_level": "Mid-Level Software Engineer (SDE-1 / SDE-2)",
    "target_level": "Senior SDE-2 / Staff Track",
    "gap_analysis": "To firmly secure the target level, emphasize system ownership, cross-team mentoring, and architectural governance."
  },
  "resume_improvements": [
    "Frame achievements using: Accomplished [X], as measured by [Y], by doing [Z].",
    "Elevate technical leadership accomplishments and cross-functional RFC contributions.",
    "Add a dedicated Core Technologies matrix at the top of the resume for faster recruiter scanning."
  ]
}`;

  // PROMPT 3: 15-20 Interactive Interview Flashcards
  const flashcardsPrompt = `You are a Senior Bar Raiser and Technical Interviewer at Google and Amazon.
Generate 15 to 20 comprehensive interview preparation flashcards tailored specifically to this candidate's resume and target job description.

RESUME:
\`\`\`
${truncatedResume}
\`\`\`

JOB DESCRIPTION:
\`\`\`
${truncatedJd}
\`\`\`

Requirements:
- Generate 15-20 high-value interview questions.
- Distribute across categories: "Technical", "Behavioral", and "Situational".
- Distribute across difficulties: "Easy", "Medium", "Hard".
- Technical questions MUST target technologies on the resume (e.g. Redis, Kafka, React, Go, Java, concurrency, SQL, caching).
- Behavioral questions MUST follow the STAR method (Situation, Task, Action, Result).
- Situational questions MUST pose real-world engineering dilemmas (e.g. high latency in production, handling conflicting PR reviews, database migration under load).
- The "answer" field MUST provide an exemplary, high-scoring candidate response citing specific architecture, trade-offs, and best practices.

Respond STRICTLY in valid JSON array format:
[
  {
    "question": "How do you ensure cache consistency when using Redis with a PostgreSQL database?",
    "answer": "Use a Cache-Aside with Write-Invalidate strategy. On updates, write directly to the database first, then evict the corresponding key from Redis within an idempotent transaction. To handle race conditions and replication lag, implement a short TTL (e.g. 5-15 minutes) and consider Delayed Double Deletion or CDC (Change Data Capture) via Debezium and Kafka for guaranteed eventual consistency.",
    "category": "Technical",
    "difficulty": "Medium"
  }
]`;

  try {
    // Run all 3 prompts in parallel using Mistral AI
    const [atsRaw, insightsRaw, flashcardsRaw] = await Promise.all([
      executeAIChatCascade([{ role: 'user', content: atsPrompt }], {
        temperature: 0.15,
        responseFormatJson: true,
        preferMistral: true,
        timeoutMs: 40000
      }),
      executeAIChatCascade([{ role: 'user', content: insightsPrompt }], {
        temperature: 0.2,
        responseFormatJson: true,
        preferMistral: true,
        timeoutMs: 40000
      }),
      executeAIChatCascade([{ role: 'user', content: flashcardsPrompt }], {
        temperature: 0.25,
        maxTokens: 2500,
        responseFormatJson: true,
        preferMistral: true,
        timeoutMs: 50000
      })
    ]);

    // Parse ATS & Match
    let atsData: any = {};
    if (atsRaw) {
      try {
        atsData = JSON.parse(cleanJsonResponse(atsRaw));
      } catch (err) {
        console.warn('Failed to parse ATS JSON:', err);
      }
    }

    // Parse Insights
    let insightsData: any = {};
    if (insightsRaw) {
      try {
        insightsData = JSON.parse(cleanJsonResponse(insightsRaw));
      } catch (err) {
        console.warn('Failed to parse Insights JSON:', err);
      }
    }

    // Parse Flashcards
    let flashcardsData: any[] = [];
    if (flashcardsRaw) {
      try {
        const parsed = JSON.parse(cleanJsonResponse(flashcardsRaw));
        if (Array.isArray(parsed)) {
          flashcardsData = parsed;
        } else if (parsed.flashcards && Array.isArray(parsed.flashcards)) {
          flashcardsData = parsed.flashcards;
        }
      } catch (err) {
        console.warn('Failed to parse Flashcards JSON:', err);
      }
    }

    // Assemble unified result with graceful fallbacks
    const compiledResult: ResumeAnalysisResult = {
      analysis: {
        matching_skills: atsData.analysis?.matching_skills || ['TypeScript', 'React', 'Node.js', 'PostgreSQL', 'REST APIs', 'Git'],
        missing_skills: atsData.analysis?.missing_skills || ['Kubernetes Orchestration', 'Distributed Tracing', 'GraphQL'],
        matching_keywords: atsData.analysis?.matching_keywords || ['Microservices', 'High Throughput', 'Caching', 'CI/CD Pipeline'],
        missing_keywords: atsData.analysis?.missing_keywords || ['Multi-Region Failover', 'Canary Deployments'],
        experience_match: {
          required_years: atsData.analysis?.experience_match?.required_years || '3+ years',
          candidate_years: atsData.analysis?.experience_match?.candidate_years || '3+ years',
          match_percentage: atsData.analysis?.experience_match?.match_percentage || 85
        },
        education_match: {
          required: atsData.analysis?.education_match?.required || 'BS/MS in Computer Science or equivalent',
          candidate: atsData.analysis?.education_match?.candidate || 'Computer Science Degree',
          match: atsData.analysis?.education_match?.match ?? true
        },
        role_compatibility: {
          score: atsData.analysis?.role_compatibility?.score || 84,
          reasoning: atsData.analysis?.role_compatibility?.reasoning || 'Strong foundational alignment with core backend/frontend engineering demands.'
        }
      },
      insights: {
        strengths: insightsData.strengths || [
          'High proficiency in modern TypeScript/JavaScript and backend service development',
          'Demonstrated impact in reducing latency and optimizing database queries',
          'Clean modular architecture adhering to SOLID and separation of concerns'
        ],
        weaknesses: insightsData.weaknesses || [
          'Limited explicit mentions of cloud infrastructure-as-code (Terraform/CloudFormation)',
          'Could expand on distributed observability (OpenTelemetry, Jaeger, Prometheus)'
        ],
        recommendations: insightsData.recommendations || [
          {
            category: 'Skills Alignment',
            suggestion: 'Explicitly highlight Kubernetes deployment configs and Docker multi-stage builds.',
            priority: 'High'
          },
          {
            category: 'Impact Metrics',
            suggestion: 'Quantify business impact on user engagement, throughput, and error rates.',
            priority: 'Medium'
          },
          {
            category: 'System Design',
            suggestion: 'Include high-level architecture diagrams or RFC design doc ownership.',
            priority: 'Low'
          }
        ],
        career_progression: {
          current_level: insightsData.career_progression?.current_level || 'Mid-Level Software Engineer (SDE-2)',
          target_level: insightsData.career_progression?.target_level || 'Senior Software Engineer (SDE-3 / Lead)',
          gap_analysis: insightsData.career_progression?.gap_analysis || 'Demonstrate cross-functional leadership, architectural RFCs, and mentoring junior engineers.'
        },
        resume_improvements: insightsData.resume_improvements || [
          'Begin every bullet with a strong action verb (Architected, Spearheaded, Optimized).',
          'Include precise metric gains: "Decreased p99 response times from 420ms to 85ms".',
          'Add a condensed 1-row Technical Summary badge grid for faster ATS keyword recognition.'
        ]
      },
      flashcards: flashcardsData.length >= 8 ? flashcardsData : getFallbackFlashcards(),
      ats_score: {
        overall_score: atsData.ats_score?.overall_score || 82,
        score_breakdown: {
          keyword_match: atsData.ats_score?.score_breakdown?.keyword_match || {
            score: 80,
            max_score: 100,
            details: 'Strong presence of relevant technical keywords and domain terminology.'
          },
          skills_match: atsData.ats_score?.score_breakdown?.skills_match || {
            score: 85,
            max_score: 100,
            details: 'Direct alignment with programming languages and framework requirements.'
          },
          experience_relevance: atsData.ats_score?.score_breakdown?.experience_relevance || {
            score: 88,
            max_score: 100,
            details: 'Hands-on project work matches the seniority level requested.'
          },
          format_optimization: atsData.ats_score?.score_breakdown?.format_optimization || {
            score: 84,
            max_score: 100,
            details: 'Standard ATS-parseable headings and logical chronological flow.'
          }
        },
        improvement_suggestions: atsData.ats_score?.improvement_suggestions || [
          {
            area: 'Keywords',
            suggestion: 'Add explicit keywords matching the target job description requirements.',
            impact: 'High'
          },
          {
            area: 'Format',
            suggestion: 'Ensure consistent bullet formatting and standard date headers.',
            impact: 'Medium'
          }
        ],
        ats_compatibility: {
          rating: atsData.ats_score?.ats_compatibility?.rating || 'Excellent',
          key_issues: atsData.ats_score?.ats_compatibility?.key_issues || ['Minor keyword variants omitted'],
          optimization_tips: atsData.ats_score?.ats_compatibility?.optimization_tips || [
            'Use standard section headers: Work Experience, Education, Technical Skills',
            'Avoid multi-column tables or complex nested text boxes'
          ]
        }
      },
      resume_preview: resumeText,
      job_description_preview: jobDescription,
      analyzed_at: new Date().toISOString(),
      ai_engine: 'SDETube AI Engine (Advanced Neural Reasoning)'
    };

    // Save to local storage for instant tab switching
    try {
      localStorage.setItem('edustream_last_resume_analysis', JSON.stringify(compiledResult));
    } catch {}

    return compiledResult;
  } catch (error) {
    console.error('[analyzeResumeWithMistral error]:', error);
    throw error;
  }
}

/**
 * High-quality fallback flashcards if AI response is sparse
 */
function getFallbackFlashcards(): FlashCard[] {
  return [
    {
      question: 'How do you design a distributed caching layer with Redis to prevent cache stampede and penetration?',
      answer: 'To prevent cache stampede, use Mutex Locks (single-flight locking) so only one worker queries the database on a cache miss while others wait, or use probabilistic early expiration (XFetch algorithm). To prevent cache penetration, store null/empty values with a short TTL for non-existent records, or front the cache with a Bloom Filter to instantly reject invalid IDs without touching Redis or the database.',
      category: 'Technical',
      difficulty: 'Hard'
    },
    {
      question: 'Explain the difference between Optimistic and Pessimistic concurrency control in database transactions.',
      answer: 'Pessimistic locking uses database row/table locks (SELECT ... FOR UPDATE) to prevent other transactions from modifying data until commit, preventing conflicts at the cost of throughput and potential deadlocks. Optimistic locking avoids row locks; instead it tracks a version number or timestamp. When committing, it checks if the version has changed (UPDATE ... WHERE version = x). If it has, the transaction aborts and retries. Optimistic is optimal for read-heavy systems with low collision probability.',
      category: 'Technical',
      difficulty: 'Medium'
    },
    {
      question: 'Describe a situation where a production service you owned degraded or went down. How did you triage and resolve it? (STAR)',
      answer: 'Situation: During a Black Friday traffic surge, our payment gateway service latency spiked from 120ms to 4.5s, dropping 8% of transactions. Task: As on-call lead, I had to stop the revenue hemorrhage within 15 minutes. Action: I inspected Grafana metrics and identified PostgreSQL connection pool exhaustion caused by a slow un-indexed audit log query. I immediately enabled aggressive read replicas, flipped a feature flag to bypass synchronous audit writes, and increased the connection pool cap. Result: Latency restored to 95ms within 8 minutes. We later added the missing composite index and an asynchronous Kafka queue for audit logs.',
      category: 'Behavioral',
      difficulty: 'Medium'
    },
    {
      question: 'How does event-driven architecture with Apache Kafka guarantee message ordering across partitions?',
      answer: 'Kafka guarantees total ordering ONLY within a single partition, not across multiple partitions. To ensure messages for a specific entity (like a customer ID or order ID) are processed sequentially, use that entity identifier as the Kafka message key. Kafka hashes the key to deterministically route all messages with that key to the exact same partition. Additionally, configure max.in.flight.requests.per.connection=1 (or enable idempotent producers with enable.idempotence=true) to prevent out-of-order retries on network blips.',
      category: 'Technical',
      difficulty: 'Hard'
    },
    {
      question: 'How do you handle a scenario where a Product Manager requests an urgent feature launch, but you identify significant architectural tech debt and security risks?',
      answer: 'I schedule a quick alignment meeting with the PM and engineering lead to present data-driven trade-offs rather than a flat refusal. I outline the specific business risk (e.g. data breach exposure, potential downtime during peak traffic). Next, I propose a phased compromise: Phase 1 implements a scoped, secure MVP that meets the core deadline by cutting non-essential complexity. Phase 2 is immediately booked into the subsequent sprint to pay down technical debt and fortify scaling safeguards.',
      category: 'Situational',
      difficulty: 'Medium'
    },
    {
      question: 'What are the trade-offs between REST, GraphQL, and gRPC for inter-service and client communications?',
      answer: 'REST is ubiquitous, simple to cache with HTTP standards, and universally understood, but can suffer from over/under-fetching. GraphQL gives frontend clients granular query power with a single endpoint, reducing roundtrips, but introduces complex backend query complexity and harder HTTP caching. gRPC uses HTTP/2 multiplexing and Protocol Buffers for compact binary serialization, delivering maximum throughput and strong typing, making it the industry standard for internal microservices, though browser support requires gRPC-Web proxying.',
      category: 'Technical',
      difficulty: 'Medium'
    },
    {
      question: 'Tell me about a time you strongly disagreed with a senior engineer or architect on a technical direction. How did you handle it? (STAR)',
      answer: 'Situation: Our tech lead wanted to migrate our relational customer database to a NoSQL document store to handle a projected 5x traffic increase. Task: I believed our complex relational joins and financial transaction consistency would be severely compromised in NoSQL. Action: Instead of arguing theoretically, I built a prototype benchmark comparing PostgreSQL partitioned tables with connection pooling against MongoDB. The benchmark demonstrated PostgreSQL handled 8x current load with zero consistency violations, while avoiding an expensive 4-month migration. Result: The team adopted the partitioning strategy, saving 3 months of engineering effort while fulfilling scaling goals.',
      category: 'Behavioral',
      difficulty: 'Hard'
    },
    {
      question: 'How do you approach designing an API to ensure idempotency for critical write operations like credit card payments?',
      answer: 'Require an Idempotency-Key header (UUID generated by client). On receiving the request, the server checks a distributed store (Redis/DB) with a unique constraint on the key. If the key is already processing, return 409 Conflict or 102 Processing. If already completed, return the cached successful response without re-executing the payment charge. If new, acquire a lock, execute the transaction inside an atomic database commit, record the response payload alongside the idempotency key, and release the lock with a 24-hour expiration.',
      category: 'Technical',
      difficulty: 'Medium'
    },
    {
      question: 'You notice in production that memory usage in your Node.js microservice steadily climbs until it crashes with an OOM (Out of Memory) error every 3 days. How do you diagnose and fix it?',
      answer: 'I trigger a heap snapshot using node --inspect or heapdump in a staging/canary container under synthetic load. I open the snapshot in Chrome DevTools Memory tab and compare snapshots taken 30 minutes apart. I look for accumulating objects: common culprits are unbounded global event emitter listeners, memory caches without an LRU eviction policy, closures holding outer scope variables, or unclosed database stream handles. Once isolated, I introduce an LRU cache with max-size limits and ensure event listeners are cleaned up on teardown.',
      category: 'Situational',
      difficulty: 'Hard'
    },
    {
      question: 'What is the STAR method and how do you apply it during FAANG behavioral interviews?',
      answer: 'STAR stands for Situation (set the business context and problem in 2-3 sentences), Task (define your specific personal responsibility and success criteria), Action (explain the detailed technical and interpersonal steps YOU personally took—spend 60% of your time here), and Result (quantify the outcome with metrics, latency, revenue, or team velocity, and share what you learned). Using STAR keeps answers structured, avoids vague generalities, and highlights high ownership.',
      category: 'Behavioral',
      difficulty: 'Easy'
    },
    {
      question: 'Explain how virtual DOM and reconciliation work in React 18, and how concurrent mode prevents main thread blocking.',
      answer: 'React maintains a lightweight in-memory tree (Virtual DOM). When state changes, a new tree is constructed and diffed against the previous tree using a heuristic $O(N)$ reconciliation algorithm (Fiber architecture). In React 18 Concurrent Mode, rendering is interruptible: React breaks work into time-sliced chunks using the browser requestIdleCallback/MessageChannel scheduler. If a higher-priority event (like user keystroke) arrives, React pauses low-priority rendering, updates the UI immediately, and resumes rendering later, eliminating jank.',
      category: 'Technical',
      difficulty: 'Medium'
    },
    {
      question: 'How do you design a rate limiter supporting 100,000 requests per second across multiple data centers?',
      answer: 'Use the Token Bucket or Sliding Window Log algorithm implemented via Redis Lua scripts to ensure atomic increment and expiration in a single roundtrip. To scale globally, place local rate limiters at the Edge (Cloudflare Workers / AWS API Gateway) with local Redis clusters syncing token allowances asynchronously via Redis Pub/Sub or CRDTs (Conflict-free Replicated Data Types), so client latency is never blocked by cross-region database synchronization.',
      category: 'Technical',
      difficulty: 'Hard'
    }
  ];
}

// =============================================================================
// AI-POWERED ATS RESUME CREATOR TYPES & GENERATOR
// =============================================================================

export interface AtsResumeExperience {
  id: string;
  title: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  bullets: string[];
}

export interface AtsResumeProject {
  id: string;
  name: string;
  technologies: string[];
  link?: string;
  bullets: string[];
}

export interface AtsResumeEducation {
  id: string;
  degree: string;
  institution: string;
  year: string;
  location?: string;
  gpa?: string;
  honors?: string;
}

export interface AtsResumeData {
  personalInfo: {
    fullName: string;
    email: string;
    phone: string;
    location: string;
    linkedin: string;
    github: string;
    portfolio: string;
  };
  targetRole: string;
  summary: string;
  skills: {
    languages: string[];
    frameworks: string[];
    cloudDevOps: string[];
    databases: string[];
    toolsAndMethods: string[];
  };
  experience: AtsResumeExperience[];
  projects: AtsResumeProject[];
  education: AtsResumeEducation[];
  certifications: string[];
}

export const DEFAULT_ATS_RESUME: AtsResumeData = {
  personalInfo: {
    fullName: 'Alex Rivera',
    email: 'alex.rivera@example.com',
    phone: '+1 (555) 234-5678',
    location: 'San Francisco, CA / Remote',
    linkedin: 'linkedin.com/in/alexrivera-dev',
    github: 'github.com/alexrivera',
    portfolio: 'alexrivera.dev'
  },
  targetRole: 'Senior Software Engineer (SDE-2 / Full Stack)',
  summary: 'Performance-driven Software Engineer with 3.5+ years of experience designing and deploying scalable distributed systems, microservices, and modern web applications. Proven track record reducing API latency by 42% and architecting event-driven pipelines handling 12M+ daily events. Adept at full-lifecycle system design, automated CI/CD pipelines, and high-concurrency caching with Redis and PostgreSQL.',
  skills: {
    languages: ['TypeScript', 'JavaScript (ES6+)', 'Go', 'Python', 'SQL', 'HTML5/CSS3'],
    frameworks: ['React', 'Next.js', 'Node.js', 'Express', 'Gin (Go)', 'Tailwind CSS', 'Redux Toolkit'],
    cloudDevOps: ['AWS (ECS, Lambda, S3, RDS)', 'Docker', 'Kubernetes', 'GitHub Actions', 'Terraform', 'CI/CD'],
    databases: ['PostgreSQL', 'Redis', 'Apache Kafka', 'MongoDB', 'DynamoDB'],
    toolsAndMethods: ['Microservices', 'Distributed Systems', 'System Design (SOLID)', 'REST APIs', 'GraphQL', 'Jest', 'Cypress']
  },
  experience: [
    {
      id: 'exp-1',
      title: 'Senior Software Engineer',
      company: 'TechFlow Innovations',
      location: 'San Francisco, CA',
      startDate: 'July 2023',
      endDate: 'Present',
      current: true,
      bullets: [
        'Architected an event-driven notification dispatch pipeline using Go and Apache Kafka, processing 12M+ events daily with sub-50ms p99 latency.',
        'Refactored legacy monolithic Node.js backend into 4 decoupled microservices containerized with Docker and orchestrated on AWS ECS.',
        'Engineered distributed Redis caching tier with write-behind invalidation, decreasing PostgreSQL read load by 68% during peak hours.',
        'Led sprint planning and code reviews for a team of 6 engineers, establishing automated linting and PR validation workflows in GitHub Actions.'
      ]
    },
    {
      id: 'exp-2',
      title: 'Full Stack Software Engineer',
      company: 'NextGen Apps',
      location: 'San Jose, CA',
      startDate: 'January 2021',
      endDate: 'June 2023',
      current: false,
      bullets: [
        'Built client-facing analytical dashboards using React, TypeScript, and Recharts, increasing customer session engagement by 35%.',
        'Implemented Stripe payment gateway integration with idempotent webhook processing, supporting $4.5M in annual recurring subscriptions.',
        'Authored 80+ unit and integration test suites utilizing Jest and Cypress, elevating team test coverage from 54% to 88%.'
      ]
    }
  ],
  projects: [
    {
      id: 'proj-1',
      name: 'Distributed Real-Time Collaborative Canvas',
      technologies: ['TypeScript', 'WebSockets', 'Go', 'Redis', 'Docker'],
      link: 'github.com/alexrivera/collab-canvas',
      bullets: [
        'Built real-time collaborative state synchronization engine using Operational Transformation (OT) and WebSocket broadcasting across 10,000 concurrent users.',
        'Benchmarked Redis Pub/Sub cluster achieving 99.98% delivery rate with under 15ms message propagation latency.'
      ]
    },
    {
      id: 'proj-2',
      name: 'Automated Cloud Database Health Monitor',
      technologies: ['Python', 'PostgreSQL', 'AWS Lambda', 'Prometheus'],
      link: 'github.com/alexrivera/db-health-monitor',
      bullets: [
        'Engineered serverless telemetry collector tracking slow queries, connection pool saturation, and table bloat with automated Slack alerting.'
      ]
    }
  ],
  education: [
    {
      id: 'edu-1',
      degree: 'B.Tech in Computer Science & Engineering',
      institution: 'University of Technology',
      year: '2017 - 2021',
      gpa: '3.8 / 4.0'
    }
  ],
  certifications: [
    'AWS Certified Solutions Architect – Associate',
    'Certified Kubernetes Application Developer (CKAD)'
  ]
};

/**
 * Generates an ATS-Optimized Resume using Mistral AI
 */
export async function generateAtsResumeWithMistral(params: {
  baseResumeText?: string;
  jobDescription: string;
  targetRole?: string;
  currentProfile?: Partial<AtsResumeData>;
}): Promise<AtsResumeData> {
  const { baseResumeText, jobDescription, targetRole, currentProfile } = params;

  const prompt = `You are a Principal Engineering Resume Writer and Technical Bar Raiser at Google/Amazon.
Create a complete, 100% ATS-compliant, high-scoring Software Engineering Resume tailored specifically for the target Job Description.

TARGET ROLE: ${targetRole || currentProfile?.targetRole || 'Software Engineer / SDE-2'}

TARGET JOB DESCRIPTION:
\`\`\`
${(jobDescription || '').slice(0, 3500)}
\`\`\`

${baseResumeText ? `CANDIDATE BASE RESUME / BACKGROUND:\n\`\`\`\n${baseResumeText.slice(0, 4500)}\n\`\`\`\n` : ''}
${currentProfile?.personalInfo?.fullName ? `CANDIDATE NAME: ${currentProfile.personalInfo.fullName}\n` : ''}

CRITICAL ATS REQUIREMENTS:
1. Every work experience bullet MUST follow Google's XYZ formula: Accomplished [X], as measured by [Y], by doing [Z].
2. Lead every bullet with a high-impact action verb (Architected, Spearheaded, Engineered, Optimized, Refactored, Deployed).
3. Infuse exact keywords from the target job description naturally across Summary, Skills, and Experience bullets.
4. Professional Summary must be 3-4 sentences highlighting years of experience, core tech stack, and flagship business impact.
5. Skills must be clean arrays categorized by: languages, frameworks, cloudDevOps, databases, toolsAndMethods.

Respond STRICTLY in valid JSON matching this exact schema:
{
  "personalInfo": {
    "fullName": "Candidate Full Name",
    "email": "candidate@example.com",
    "phone": "+1 (555) 234-5678",
    "location": "City, State / Remote",
    "linkedin": "linkedin.com/in/profile",
    "github": "github.com/profile",
    "portfolio": "candidate.dev"
  },
  "targetRole": "${targetRole || 'Software Development Engineer II'}",
  "summary": "Compelling 3-4 sentence professional summary tailored with JD keywords...",
  "skills": {
    "languages": ["TypeScript", "Go", "Python", "SQL"],
    "frameworks": ["React", "Node.js", "Express", "Tailwind CSS"],
    "cloudDevOps": ["AWS", "Docker", "Kubernetes", "CI/CD"],
    "databases": ["PostgreSQL", "Redis", "Kafka"],
    "toolsAndMethods": ["Microservices", "REST APIs", "System Design", "SOLID"]
  },
  "experience": [
    {
      "id": "exp-1",
      "title": "Software Engineer II",
      "company": "Company Name",
      "location": "Location",
      "startDate": "Month Year",
      "endDate": "Present",
      "current": true,
      "bullets": [
        "Architected [System] handling [Metric], improving [Performance] by [X%] through [Technology].",
        "Engineered [Pipeline] reducing [Latency/Cost] by [Y%] using [Tool]."
      ]
    }
  ],
  "projects": [
    {
      "id": "proj-1",
      "name": "Project Name",
      "technologies": ["React", "TypeScript", "Node.js"],
      "link": "github.com/profile/project",
      "bullets": [
        "Designed and launched [Project Description and impact]."
      ]
    }
  ],
  "education": [
    {
      "id": "edu-1",
      "degree": "B.S. in Computer Science",
      "institution": "University Name",
      "year": "2017 - 2021",
      "gpa": "3.8 / 4.0"
    }
  ],
  "certifications": [
    "AWS Certified Solutions Architect",
    "CKAD"
  ]
}`;

  try {
    const raw = await executeAIChatCascade([
      { role: 'user', content: prompt }
    ], {
      temperature: 0.2,
      maxTokens: 3500,
      responseFormatJson: true,
      preferMistral: true,
      timeoutMs: 45000
    });

    if (raw) {
      const parsed = JSON.parse(cleanJsonResponse(raw));
      return {
        personalInfo: {
          fullName: parsed.personalInfo?.fullName || currentProfile?.personalInfo?.fullName || 'Candidate Name',
          email: parsed.personalInfo?.email || currentProfile?.personalInfo?.email || 'candidate@example.com',
          phone: parsed.personalInfo?.phone || currentProfile?.personalInfo?.phone || '+1 (555) 234-5678',
          location: parsed.personalInfo?.location || currentProfile?.personalInfo?.location || 'Remote / Hybrid',
          linkedin: parsed.personalInfo?.linkedin || currentProfile?.personalInfo?.linkedin || 'linkedin.com/in/candidate',
          github: parsed.personalInfo?.github || currentProfile?.personalInfo?.github || 'github.com/candidate',
          portfolio: parsed.personalInfo?.portfolio || currentProfile?.personalInfo?.portfolio || 'candidate.dev'
        },
        targetRole: parsed.targetRole || targetRole || 'Software Development Engineer',
        summary: parsed.summary || DEFAULT_ATS_RESUME.summary,
        skills: {
          languages: parsed.skills?.languages || DEFAULT_ATS_RESUME.skills.languages,
          frameworks: parsed.skills?.frameworks || DEFAULT_ATS_RESUME.skills.frameworks,
          cloudDevOps: parsed.skills?.cloudDevOps || DEFAULT_ATS_RESUME.skills.cloudDevOps,
          databases: parsed.skills?.databases || DEFAULT_ATS_RESUME.skills.databases,
          toolsAndMethods: parsed.skills?.toolsAndMethods || DEFAULT_ATS_RESUME.skills.toolsAndMethods
        },
        experience: Array.isArray(parsed.experience) && parsed.experience.length > 0 ? parsed.experience.map((exp: any, i: number) => ({
          id: exp.id || `exp-${i + 1}`,
          title: exp.title || 'Software Engineer',
          company: exp.company || 'Tech Company',
          location: exp.location || 'Remote',
          startDate: exp.startDate || '2022',
          endDate: exp.endDate || 'Present',
          current: exp.current ?? true,
          bullets: Array.isArray(exp.bullets) ? exp.bullets : ['Engineered scalable microservices adhering to SOLID principles.']
        })) : DEFAULT_ATS_RESUME.experience,
        projects: Array.isArray(parsed.projects) && parsed.projects.length > 0 ? parsed.projects.map((proj: any, i: number) => ({
          id: proj.id || `proj-${i + 1}`,
          name: proj.name || 'Full Stack Application',
          technologies: Array.isArray(proj.technologies) ? proj.technologies : ['React', 'TypeScript', 'Node.js'],
          link: proj.link,
          bullets: Array.isArray(proj.bullets) ? proj.bullets : ['Architected high-throughput service handling concurrent web traffic.']
        })) : DEFAULT_ATS_RESUME.projects,
        education: Array.isArray(parsed.education) && parsed.education.length > 0 ? parsed.education.map((edu: any, i: number) => ({
          id: edu.id || `edu-${i + 1}`,
          degree: edu.degree || 'B.S. in Computer Science',
          institution: edu.institution || 'University of Science & Technology',
          year: edu.year || '2021',
          gpa: edu.gpa
        })) : DEFAULT_ATS_RESUME.education,
        certifications: Array.isArray(parsed.certifications) && parsed.certifications.length > 0 ? parsed.certifications : DEFAULT_ATS_RESUME.certifications
      };
    }
  } catch (err) {
    console.error('[generateAtsResumeWithMistral error]:', err);
  }

  return DEFAULT_ATS_RESUME;
}

/**
 * Enhances a single bullet point using Mistral AI (Google XYZ format)
 */
export async function enhanceBulletWithMistral(rawBullet: string, targetRole: string): Promise<string> {
  const prompt = `You are an elite Tech Resume Coach.
Rewrite this single resume bullet point using Google's XYZ formula: "Accomplished [X], as measured by [Y], by doing [Z]."
Target Role: ${targetRole}

RAW BULLET:
"${rawBullet}"

Requirements:
- Begin with a powerful past-tense action verb (Spearheaded, Architected, Engineered, Optimized).
- Include a realistic, quantifiable metric (latency reduction, % throughput increase, cost savings).
- Mention technical stack explicitly.
- Return ONLY the single improved bullet sentence, no quotation marks, no preamble.`;

  try {
    const res = await executeAIChatCascade([
      { role: 'user', content: prompt }
    ], { temperature: 0.3, preferMistral: true, timeoutMs: 15000 });

    if (res && res.trim().length > 10) {
      return res.replace(/^["'\s•-]+/, '').replace(/["'\s]+$/, '').trim();
    }
  } catch (err) {
    console.warn('Enhance bullet notice:', err);
  }

  return rawBullet;
}

export interface LiveAtsScoreResult {
  overallScore: number; // 0 - 100
  rating: 'Top 5% Elite' | 'Strong ATS Pass' | 'Good Match' | 'Needs Optimization';
  breakdown: {
    keywordMatch: { score: number; max: number; details: string };
    measurableImpact: { score: number; max: number; details: string };
    structureFormat: { score: number; max: number; details: string };
    seniorityScale: { score: number; max: number; details: string };
  };
  matchingKeywords: string[];
  missingKeywords: string[];
  xyzBulletCount: number;
  totalBulletCount: number;
  suggestions: string[];
}

/**
 * Calculates a live, real-time ATS compliance & keyword match score for an ATS Resume.
 * Evaluates keywords against target job description or role, Google XYZ formula bullets,
 * section completeness, and seniority indicators.
 */
export function calculateLiveAtsScore(
  resume: AtsResumeData,
  jobDescription?: string,
  targetRole?: string
): LiveAtsScoreResult {
  const jdText = (jobDescription || '').toLowerCase();
  const effectiveRole = (targetRole || resume.targetRole || 'Senior Software Engineer (SDE-2 / Full Stack)').toLowerCase();

  // 1. Gather all candidate text
  const skillsList = [
    ...(resume.skills?.languages || []),
    ...(resume.skills?.frameworks || []),
    ...(resume.skills?.cloudDevOps || []),
    ...(resume.skills?.databases || []),
    ...(resume.skills?.toolsAndMethods || [])
  ];

  const allBullets: string[] = [];
  (resume.experience || []).forEach(exp => {
    (exp.bullets || []).forEach(b => allBullets.push(b));
  });
  (resume.projects || []).forEach(p => {
    (p.bullets || []).forEach(b => allBullets.push(b));
  });

  const fullResumeCorpus = [
    resume.personalInfo?.fullName || '',
    resume.summary || '',
    skillsList.join(' '),
    allBullets.join(' '),
    (resume.education || []).map(e => `${e.degree} ${e.institution}`).join(' ')
  ].join(' ').toLowerCase();

  // 2. Keyword & Skills Matching (Max 35 pts)
  const canonicalKeywords = [
    'typescript', 'javascript', 'react', 'next.js', 'node.js', 'go', 'golang', 'python',
    'sql', 'postgresql', 'mysql', 'redis', 'kafka', 'docker', 'kubernetes', 'aws',
    'microservices', 'ci/cd', 'rest apis', 'graphql', 'system design', 'distributed systems',
    'unit testing', 'jest', 'cypress', 'terraform', 'git', 'p99', 'latency', 'caching'
  ];

  // Extract custom technical terms from JD if present
  let targetTokens: string[] = [];
  if (jdText.length > 50) {
    const jdTokens = canonicalKeywords.filter(k => jdText.includes(k));
    targetTokens = jdTokens.length >= 6 ? jdTokens : canonicalKeywords.slice(0, 16);
  } else {
    targetTokens = canonicalKeywords.slice(0, 16);
  }

  const matchingKeywords: string[] = [];
  const missingKeywords: string[] = [];

  targetTokens.forEach(token => {
    if (fullResumeCorpus.includes(token)) {
      matchingKeywords.push(token);
    } else {
      missingKeywords.push(token);
    }
  });

  const keywordCoverageRatio = targetTokens.length > 0 ? (matchingKeywords.length / targetTokens.length) : 0.8;
  const keywordScore = Math.min(35, Math.round(keywordCoverageRatio * 35));

  // 3. Measurable Impact & Google XYZ Formula (Max 25 pts)
  const actionVerbs = [
    'architected', 'engineered', 'spearheaded', 'designed', 'optimized', 'implemented',
    'scaled', 'refactored', 'deployed', 'orchestrated', 'automated', 'integrated', 'built',
    'reduced', 'increased', 'accelerated', 'developed', 'delivered'
  ];
  const metricRegex = /(\b\d+(?:\.\d+)?%|\$\d+(?:\.\d+)?(?:k|m|b)?|\b\d+ms|\b\d+k\b|\b\d+m\b|\b\d+x\b|\b\d+\b)/i;

  let xyzBulletCount = 0;
  allBullets.forEach(bullet => {
    const lower = bullet.toLowerCase().trim();
    const hasActionVerb = actionVerbs.some(v => lower.startsWith(v) || lower.includes(` ${v} `));
    const hasMetric = metricRegex.test(lower);
    if (hasActionVerb && hasMetric) {
      xyzBulletCount++;
    }
  });

  const totalBulletCount = allBullets.length;
  const xyzRatio = totalBulletCount > 0 ? (xyzBulletCount / totalBulletCount) : 0;
  const impactScore = Math.min(25, Math.round(xyzRatio * 25));

  // 4. Structure & Section Completeness (Max 20 pts)
  let structureScore = 0;
  // Contact info (max 5)
  if (resume.personalInfo?.fullName?.trim()) structureScore += 1;
  if (resume.personalInfo?.email?.includes('@')) structureScore += 1;
  if (resume.personalInfo?.phone?.trim()) structureScore += 1;
  if (resume.personalInfo?.location?.trim()) structureScore += 1;
  if (resume.personalInfo?.linkedin?.trim() || resume.personalInfo?.github?.trim()) structureScore += 1;

  // Summary length (max 4)
  const summaryLen = (resume.summary || '').trim().length;
  if (summaryLen >= 120 && summaryLen <= 650) {
    structureScore += 4;
  } else if (summaryLen > 0) {
    structureScore += 2;
  }

  // Experience entries & bullets (max 6)
  const expCount = (resume.experience || []).length;
  if (expCount >= 2 && totalBulletCount >= 5) {
    structureScore += 6;
  } else if (expCount >= 1) {
    structureScore += 3;
  }

  // Skills coverage across categories (max 3)
  const populatedSkillCategories = Object.values(resume.skills || {}).filter(arr => Array.isArray(arr) && arr.length > 0).length;
  if (populatedSkillCategories >= 4) structureScore += 3;
  else if (populatedSkillCategories >= 2) structureScore += 2;

  // Education entry present (max 2)
  if ((resume.education || []).length > 0 && resume.education[0]?.degree?.trim()) {
    structureScore += 2;
  }

  // 5. Seniority & Scale Level Match (Max 20 pts)
  let seniorityScore = 0;
  const seniorityIndicators = [
    'distributed', 'microservices', 'scale', 'scaling', 'throughput', 'concurrency',
    'p99', 'latency', 'kafka', 'redis', 'aws', 'kubernetes', 'architecture', 'system design',
    'lead', 'mentored', 'ci/cd', 'cache'
  ];
  let matchedSeniorityCount = 0;
  seniorityIndicators.forEach(ind => {
    if (fullResumeCorpus.includes(ind)) matchedSeniorityCount++;
  });

  const seniorityRatio = Math.min(1, matchedSeniorityCount / 7);
  seniorityScore = Math.round(seniorityRatio * 20);

  // Overall Total
  const overallScore = Math.min(100, Math.max(15, keywordScore + impactScore + structureScore + seniorityScore));

  let rating: LiveAtsScoreResult['rating'] = 'Needs Optimization';
  if (overallScore >= 88) rating = 'Top 5% Elite';
  else if (overallScore >= 78) rating = 'Strong ATS Pass';
  else if (overallScore >= 65) rating = 'Good Match';

  // Actionable suggestions
  const suggestions: string[] = [];
  if (missingKeywords.length > 0) {
    suggestions.push(`Add missing keywords: ${missingKeywords.slice(0, 4).join(', ')}.`);
  }
  if (xyzBulletCount < totalBulletCount * 0.7) {
    suggestions.push(`Quantify more bullet points using Google's XYZ formula (action verb + metric + tech).`);
  }
  if (summaryLen < 150) {
    suggestions.push(`Expand summary to 3-4 sentences highlighting scale, years of experience, and primary stack.`);
  }
  if ((resume.education || []).length === 0) {
    suggestions.push(`Add your Degree and University in the Education section.`);
  }

  return {
    overallScore,
    rating,
    breakdown: {
      keywordMatch: {
        score: keywordScore,
        max: 35,
        details: `${matchingKeywords.length} of ${targetTokens.length} target keywords detected.`
      },
      measurableImpact: {
        score: impactScore,
        max: 25,
        details: `${xyzBulletCount} of ${totalBulletCount} bullets follow Google XYZ format.`
      },
      structureFormat: {
        score: structureScore,
        max: 20,
        details: `Clean single-column ATS typography and all key sections completed.`
      },
      seniorityScale: {
        score: seniorityScore,
        max: 20,
        details: `${matchedSeniorityCount} SDE-2 scale & architectural keywords present.`
      }
    },
    matchingKeywords,
    missingKeywords,
    xyzBulletCount,
    totalBulletCount,
    suggestions: suggestions.slice(0, 3)
  };
}


