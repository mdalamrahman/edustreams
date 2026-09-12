import { useEffect } from 'react';
import { Video } from './types';
import { SDEProblem, DSAProblem } from './dsaSheetsData';

interface SEOProps {
  activeTab: string;
  selectedVideo?: Video | null;
  activeProblem?: SDEProblem | DSAProblem | { title?: string; name?: string; difficulty?: string } | null;
  customTitle?: string;
  customDescription?: string;
}

const BASE_URL = 'https://sdetube.pages.dev';
const DEFAULT_OG_IMAGE = `${BASE_URL}/og-image.png`;

const TAB_METADATA: Record<string, { title: string; description: string; keywords: string }> = {
  dashboard: {
    title: 'SDETube — AI-Powered Computer Science & SDE Preparation Arena',
    description: 'Master technical software engineering interviews with in-browser video lectures, fullscreen Monaco LeetCode IDE, synchronized AI notes, and 743+ curated DSA problems.',
    keywords: 'SDE preparation, software engineer interview, LeetCode online IDE, DSA sheets, system design, LLD studio, HLD canvas, POTD, FAANG coding'
  },
  sde_sheet: {
    title: 'Curated SDE & DSA Sheets (743+ Problems) — SDETube Arena',
    description: 'Practice high-frequency interview questions from the Top 191 SDE Sheet, Striver A2Z 474 Sheet, and SDETube 79 Sheet with full in-browser compiler.',
    keywords: 'SDE sheet, Striver A2Z sheet, NeetCode 150, Blind 75, DSA sheet, coding interview questions, C++ Java Python code runner'
  },
  dsa_problems: {
    title: '3,400+ Company-Wise DSA Problems (Google, Amazon, Meta) — SDETube',
    description: 'Filter over 3,400 LeetCode coding problems by 659 top tech companies, timeframes (30 days, 3 months, 6 months), and topic tags.',
    keywords: 'company wise DSA questions, Google coding questions, Amazon interview questions, Meta LeetCode problems, Microsoft DSA sheet'
  },
  lld: {
    title: 'Low-Level Design (LLD) & OOP Architecture Studio — SDETube',
    description: 'Master Object-Oriented Low-Level Design (LLD) with live C++ & Java class diagrams, SRP/OCP principles, Parking Lot, Elevator, and Cache system design.',
    keywords: 'Low level design, LLD interview questions, object oriented design patterns, SOLID principles, machine coding round'
  },
  hld: {
    title: 'High-Level System Design (HLD) & Distributed Systems Hub — SDETube',
    description: 'Interactive architectural canvas and boss sheets for distributed systems, microservices, Kafka, Redis, rate limiting, and scalable cloud architectures.',
    keywords: 'High level design, HLD interview, distributed systems design, microservices architecture, system design interview guide'
  },
  system_design: {
    title: 'High-Level System Design (HLD) & Distributed Systems Hub — SDETube',
    description: 'Interactive architectural canvas and boss sheets for distributed systems, microservices, Kafka, Redis, rate limiting, and scalable cloud architectures.',
    keywords: 'High level design, system design, distributed systems, architecture interview'
  },
  interview: {
    title: 'AI Multi-Round Mock Interview Companion (SDE-1/2/3) — SDETube',
    description: 'Conduct real-time multi-round AI mock interviews covering DSA, System Design, LLD, and Behavioral questions with instant performance scorecards.',
    keywords: 'AI mock interview, software engineer mock interview, SDE-1 SDE-2 interview prep, AI coding companion, technical interview simulator'
  },
  channels: {
    title: 'Cloud HD Video Channels & Ingested Curricula — SDETube',
    description: 'Watch curated HD computer science lecture streams with synchronized transcripts, smart study notes, and real-time WebAssembly code execution.',
    keywords: 'CS video lectures, DSA video course, system design video tutorial, synchronized lecture notes, coding video player'
  },
  lesson: {
    title: 'Interactive Lecture & Coding Workspace — SDETube',
    description: 'Watch technical video lessons with in-sync notes, AI teaching assistant, and real-time coding or SQL execution.',
    keywords: 'interactive coding lesson, lecture notes, video coding workspace, ask AI tutor'
  },
  analytics: {
    title: 'Student Velocity Analytics & Performance Trajectory — SDETube',
    description: 'Track your 7-day problem-solving velocity, active coding hours, accuracy percentage, and topic mastery across LeetCode & GFG profiles.',
    keywords: 'coding analytics, LeetCode progress tracker, SDE readiness score, developer velocity'
  },
  profile: {
    title: 'Developer Profile, 365-Day Activity Heatmap & Badges — SDETube',
    description: 'Showcase your unified developer credentials, linked LeetCode and GeeksforGeeks statistics, and milestone completion certificates.',
    keywords: 'developer portfolio, LeetCode profile card, coding heatmap, SDE certificate'
  },
  privacy: {
    title: 'Privacy Policy & Data Protection (GDPR & CCPA) — SDETube',
    description: 'Understand how SDETube protects your personal data, code telemetry, and session credentials in strict compliance with GDPR and global privacy standards.',
    keywords: 'SDETube privacy policy, GDPR compliance, data security, developer privacy'
  },
  terms: {
    title: 'Terms and Conditions of Service & Code Sandbox Policies — SDETube',
    description: 'Review terms of use, code execution sandbox acceptable use policies, credit usage, and intellectual property rights on SDETube.',
    keywords: 'terms of service, code execution terms, user agreement, acceptable use policy'
  },
  thank_you: {
    title: 'Thank You & Action Confirmation — SDETube',
    description: 'Confirmation and receipt for your completed action on the SDETube platform.',
    keywords: 'confirmation, thank you, success'
  },
  not_found: {
    title: '404 Page Not Found — SDETube',
    description: 'The requested page or interview pathway could not be found. Return to SDETube dashboard to continue your preparation.',
    keywords: '404 error, page not found'
  },
  contact: {
    title: 'Contact Us & Educational Support — SDETube',
    description: 'Get in touch with the SDETube core engineering team for curriculum support, platform bug reports, and educational partnerships.',
    keywords: 'contact SDETube, customer support, educational inquiry, developer assistance'
  }
};

function updateMetaTag(attrName: 'name' | 'property', attrValue: string, content: string) {
  let element = document.querySelector(`meta[${attrName}="${attrValue}"]`) as HTMLMetaElement | null;
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attrName, attrValue);
    document.head.appendChild(element);
  }
  element.setAttribute('content', content);
}

function updateCanonicalLink(url: string) {
  let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  if (!link) {
    link = document.createElement('link');
    link.setAttribute('rel', 'canonical');
    document.head.appendChild(link);
  }
  link.setAttribute('href', url);
}

export function useSEO({
  activeTab,
  selectedVideo,
  activeProblem,
  customTitle,
  customDescription
}: SEOProps) {
  useEffect(() => {
    const meta = TAB_METADATA[activeTab] || TAB_METADATA.dashboard;

    let pageTitle = customTitle || meta.title;
    let pageDescription = customDescription || meta.description;
    let pageUrl = `${BASE_URL}/#/${activeTab}`;

    if (activeProblem) {
      const probTitle = ('name' in activeProblem ? activeProblem.name : activeProblem.title) || 'Problem';
      const difficulty = 'difficulty' in activeProblem && activeProblem.difficulty ? ` (${activeProblem.difficulty})` : '';
      pageTitle = `Solve ${probTitle}${difficulty} — SDETube Monaco IDE`;
      pageDescription = `Code and run solution for ${probTitle} with multi-language execution in C++, Java, Python, and JavaScript on SDETube.`;
      const slug = ('slug' in activeProblem && activeProblem.slug) ? activeProblem.slug : probTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      pageUrl = `${BASE_URL}/#/problem/${slug}`;
    } else if (activeTab === 'lesson' && selectedVideo) {
      pageTitle = `${selectedVideo.title.replace(/\.(mp4|mkv)$/i, '')} — SDETube Cloud Lecture`;
      pageDescription = selectedVideo.telegram_caption 
        ? selectedVideo.telegram_caption.slice(0, 160).trim() + '...'
        : `Watch ${selectedVideo.title} with in-sync AI notes and practice coding problems directly on SDETube.`;
      pageUrl = `${BASE_URL}/#/lesson/${selectedVideo.channel_id}/${selectedVideo.telegram_message_id || selectedVideo.id}`;
    }

    // 1. Update Document Title
    document.title = pageTitle;

    // 2. Update Standard Meta Description and Keywords
    updateMetaTag('name', 'description', pageDescription);
    updateMetaTag('name', 'keywords', meta.keywords);

    // 3. Open Graph Tags
    updateMetaTag('property', 'og:title', pageTitle);
    updateMetaTag('property', 'og:description', pageDescription);
    updateMetaTag('property', 'og:url', pageUrl);
    updateMetaTag('property', 'og:image', DEFAULT_OG_IMAGE);
    updateMetaTag('property', 'og:image:alt', pageTitle);
    updateMetaTag('property', 'og:site_name', 'SDETube');
    updateMetaTag('property', 'og:type', 'website');

    // 4. Twitter Card Tags
    updateMetaTag('name', 'twitter:card', 'summary_large_image');
    updateMetaTag('name', 'twitter:title', pageTitle);
    updateMetaTag('name', 'twitter:description', pageDescription);
    updateMetaTag('name', 'twitter:image', DEFAULT_OG_IMAGE);
    updateMetaTag('name', 'twitter:image:alt', pageTitle);

    // 5. Canonical Link
    updateCanonicalLink(pageUrl);

  }, [activeTab, selectedVideo, activeProblem, customTitle, customDescription]);
}
