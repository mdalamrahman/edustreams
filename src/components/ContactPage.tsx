import React, { useState } from 'react';
import { Mail, MapPin, Send, MessageSquare, CheckCircle2, ArrowLeft, Clock, Github } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { FormField } from './FormField';
import { LoadingButton } from './LoadingButton';

interface ContactPageProps {
  onBackToHome?: () => void;
  onNavigateToThankYou?: () => void;
}

export const ContactPage: React.FC<ContactPageProps> = ({
  onBackToHome,
  onNavigateToThankYou,
}) => {
  const navigate = useNavigate();
  const handleBack = onBackToHome || (() => (window.history.length > 1 ? window.history.back() : navigate('/')));
  const handleThankYou = onNavigateToThankYou || (() => navigate('/thank-you'));

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('General Inquiry');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = 'Please provide your full name.';
    if (!email.trim()) {
      errs.email = 'Email address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errs.email = 'Please enter a valid email address.';
    }
    if (!message.trim() || message.trim().length < 10) {
      errs.message = 'Message must be at least 10 characters.';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    // Simulate async submission with network delay
    await new Promise((res) => setTimeout(res, 800));
    setLoading(false);

    handleThankYou();
  };

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 space-y-8 animate-fadeIn text-slate-300">
      
      {/* Header */}
      <div className="space-y-3 pb-6 border-b border-slate-800">
        <button
          onClick={handleBack}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-400 hover:text-indigo-300 cursor-pointer mb-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Command Center</span>
        </button>
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 rounded-2xl bg-indigo-950/80 border border-indigo-500/30 text-indigo-300">
            <Mail className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Contact & Educational Support
            </h1>
            <p className="text-xs sm:text-sm text-slate-400">
              Have questions about curricula, code execution runtimes, or educational access? Reach out to our core team.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Direct Details */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-5">
            <h3 className="text-base font-bold text-slate-100">Direct Contact Channels</h3>

            <div className="space-y-4 text-xs sm:text-sm">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-indigo-950/80 border border-indigo-500/30 text-indigo-400 shrink-0">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-slate-200 font-bold">Official Support Email</div>
                  <a href="mailto:support@sdetube.pages.dev" className="text-indigo-400 hover:underline">
                    support@sdetube.pages.dev
                  </a>
                  <p className="text-[11px] text-slate-500 mt-0.5">Average response time: &lt; 24 hours</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-purple-950/80 border border-purple-500/30 text-purple-400 shrink-0">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-slate-200 font-bold">Registered Office Address</div>
                  <address className="not-italic text-slate-400 mt-0.5">
                    SDETube Open Learning Initiative<br />
                    Bengaluru Tech Corridor<br />
                    Karnataka, India 560103
                  </address>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-cyan-950/80 border border-cyan-500/30 text-cyan-400 shrink-0">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-slate-200 font-bold">Operational Hours</div>
                  <p className="text-slate-400 mt-0.5">Monday &ndash; Saturday, 09:00 &ndash; 19:00 IST</p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-indigo-950/20 border border-indigo-500/30 space-y-2">
            <h4 className="text-xs font-bold text-indigo-200 uppercase font-mono tracking-wider">Open Source Community</h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Found a bug in our code harnesses or test cases? You can also file issues directly on our public GitHub repository.
            </p>
            <a
              href="https://github.com/mdalamrahman/edustreams/issues"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-400 hover:text-indigo-300 pt-1"
            >
              <Github className="w-3.5 h-3.5" />
              <span>Open GitHub Issue Tracker &rarr;</span>
            </a>
          </div>
        </div>

        {/* Right Column: Contact Message Form */}
        <div className="lg:col-span-7">
          <form onSubmit={handleSubmit} className="p-6 sm:p-8 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-5">
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-indigo-400" />
              <span>Send Us a Direct Message</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="Full Name" error={errors.name} required>
                {({ id, className, ...rest }) => (
                  <input
                    id={id}
                    type="text"
                    placeholder="Jane Doe"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (errors.name) setErrors({ ...errors, name: '' });
                    }}
                    className={className}
                    {...rest}
                  />
                )}
              </FormField>

              <FormField label="Email Address" error={errors.email} required>
                {({ id, className, ...rest }) => (
                  <input
                    id={id}
                    type="email"
                    placeholder="jane@example.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errors.email) setErrors({ ...errors, email: '' });
                    }}
                    className={className}
                    {...rest}
                  />
                )}
              </FormField>
            </div>

            <FormField label="Subject Area">
              {({ id, className, ...rest }) => (
                <select
                  id={id}
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className={`${className} cursor-pointer`}
                  {...rest}
                >
                  <option value="General Inquiry">General Inquiry</option>
                  <option value="Problem / Testcase Bug Report">Problem / Testcase Bug Report</option>
                  <option value="Code Execution / SDETube Sandbox">Code Execution / SDETube Sandbox</option>
                  <option value="Virtual Credits / Billing Inquiry">Virtual Credits / Billing Inquiry</option>
                  <option value="Curriculum Collaboration">Curriculum Collaboration</option>
                </select>
              )}
            </FormField>

            <FormField label="Message Details" error={errors.message} hint="Min 10 characters" required>
              {({ id, className, ...rest }) => (
                <textarea
                  id={id}
                  rows={4}
                  placeholder="Describe your question or issue in detail..."
                  value={message}
                  onChange={(e) => {
                    setMessage(e.target.value);
                    if (errors.message) setErrors({ ...errors, message: '' });
                  }}
                  className={`${className} resize-none`}
                  {...rest}
                />
              )}
            </FormField>

            <div className="pt-2">
              <LoadingButton
                type="submit"
                loading={loading}
                loadingText="Dispatching Message..."
                icon={<Send className="w-4 h-4" />}
                className="w-full sm:w-auto"
              >
                Send Message
              </LoadingButton>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
};
