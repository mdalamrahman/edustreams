import React from 'react';
import { 
  Code2, 
  Cpu, 
  Layers, 
  Bot, 
  BookOpen, 
  ShieldCheck, 
  Mail, 
  MapPin, 
  Github, 
  ExternalLink,
  Heart,
  FileText,
  Cookie,
  HelpCircle
} from 'lucide-react';

import { useNavigate } from 'react-router-dom';

interface FooterProps {
  onNavigate?: (tab: any) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();

  const handleNav = (path: string, legacyTab: string) => {
    navigate(path);
    if (onNavigate) onNavigate(legacyTab);
  };

  const handleOpenCookiePreferences = () => {
    window.dispatchEvent(new CustomEvent('sdetube_open_cookie_preferences'));
  };


  return (
    <footer className="w-full mt-20 border-t border-slate-800/80 bg-slate-950/90 backdrop-blur-xl text-slate-400">
      {/* Top Banner Accent */}
      <div className="h-0.5 w-full bg-gradient-to-r from-sky-500 via-indigo-500 to-purple-500 opacity-60" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          
          {/* Column 1: Brand & Mission */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 p-0.5 shadow-lg shadow-indigo-600/30 flex items-center justify-center">
                <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                  <span className="font-mono font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400 text-lg">
                    &lt;/&gt;
                  </span>
                </div>
              </div>
              <div>
                <span className="text-lg font-black text-slate-100 tracking-tight">SDETube</span>
                <p className="text-[11px] font-mono text-indigo-400">AI-Powered SDE Arena</p>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-sm">
              An open, production-grade learning operating system for software engineering candidates. Master Data Structures, Algorithms, Low-Level Design, and Distributed Systems with in-workspace video streams and WebAssembly execution.
            </p>

            {/* Social & Code Repository Links */}
            <div className="flex items-center gap-3 pt-2">
              <a
                href="https://github.com/mdalamrahman/edustreams"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-all hover:scale-105"
                title="View GitHub Repository"
              >
                <Github className="w-4 h-4" />
              </a>
              <a
                href="mailto:support@sdetube.pages.dev"
                className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-all hover:scale-105"
                title="Email Support"
              >
                <Mail className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Column 2: Curricula & Sheets */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-200 uppercase font-mono tracking-wider">
              Learning Tracks
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => handleNav('/dsa-sheets', 'sde_sheet')}
                  className="hover:text-indigo-300 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Code2 className="w-3.5 h-3.5 text-indigo-400" />
                  <span>SDE Sheet 191</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('/dsa-sheets', 'sde_sheet')}
                  className="hover:text-indigo-300 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Code2 className="w-3.5 h-3.5 text-purple-400" />
                  <span>Curated DSA (474 Qs)</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('/dsa-problems', 'dsa_problems')}
                  className="hover:text-indigo-300 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Code2 className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Company DSA (3.4k+)</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('/lld', 'lld')}
                  className="hover:text-indigo-300 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Layers className="w-3.5 h-3.5 text-pink-400" />
                  <span>LLD Studio & SOLID</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('/hld', 'hld')}
                  className="hover:text-indigo-300 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Cpu className="w-3.5 h-3.5 text-teal-400" />
                  <span>HLD Boss Architecture</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Developer Tools */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-200 uppercase font-mono tracking-wider">
              Developer Tools
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => handleNav('/interview', 'interview')}
                  className="hover:text-indigo-300 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Bot className="w-3.5 h-3.5 text-amber-400" />
                  <span>AI Mock Interview</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('/channels', 'channels')}
                  className="hover:text-indigo-300 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <BookOpen className="w-3.5 h-3.5 text-sky-400" />
                  <span>Cloud Video Lectures</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('/analytics', 'analytics')}
                  className="hover:text-indigo-300 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Velocity Analytics</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('/profile', 'profile')}
                  className="hover:text-indigo-300 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
                  <span>Developer Profile & Stats</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact & Business Address */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-200 uppercase font-mono tracking-wider">
              Contact & Support
            </h4>
            <div className="space-y-2.5 text-xs text-slate-400">
              <div className="flex items-start gap-2">
                <Mail className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                <div>
                  <div className="text-slate-200 font-medium">Engineering Support:</div>
                  <a href="mailto:support@sdetube.pages.dev" className="text-indigo-400 hover:underline">
                    support@sdetube.pages.dev
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                <div>
                  <div className="text-slate-200 font-medium">Headquarters:</div>
                  <address className="not-italic text-slate-400">
                    SDETube Open Learning<br />
                    Bengaluru Tech Corridor<br />
                    Karnataka, India 560103
                  </address>
                </div>
              </div>

              <div className="pt-1">
                <button
                  onClick={() => handleNav('/contact', 'contact')}
                  className="text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer"
                >
                  <span>Contact Form & FAQ</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar: Legal Links & Copyright */}
        <div className="mt-12 pt-8 border-t border-slate-800/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-1">
            <span>&copy; {currentYear} SDETube Open Learning Initiative. Built with</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 inline" />
            <span>for engineering candidates worldwide.</span>
          </div>

          <div className="flex flex-wrap items-center gap-5">
            <button
              onClick={() => handleNav('/privacy', 'privacy')}
              className="hover:text-slate-300 transition-colors cursor-pointer"
            >
              Privacy Policy
            </button>
            <button
              onClick={() => handleNav('/terms', 'terms')}
              className="hover:text-slate-300 transition-colors cursor-pointer"
            >
              Terms of Service
            </button>

            <button
              onClick={handleOpenCookiePreferences}
              className="hover:text-slate-300 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Cookie className="w-3 h-3 text-indigo-400" />
              <span>Cookie Preferences</span>
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
};
