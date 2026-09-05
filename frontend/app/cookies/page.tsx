'use client';

import { useState, useEffect } from 'react';
import SoftBoxBlurBg from '@/components/SoftBoxBlurBg';
import GradualBlur from '@/components/GradualBlur';
import {
  Info,
  HelpCircle,
  ToggleLeft,
  ShieldAlert,
  Monitor,
  Settings,
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function CookiesPolicy() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [mounted, setMounted] = useState(false);
  // Mount animation
  useEffect(() => {
    setMounted(true);
    document.title = 'Cookies Policy | FinAnalysis';
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const sections = [
    {
      id: 'what-are-cookies',
      icon: <HelpCircle className="w-5 h-5 text-primary" />,
      title: 'What Are Cookies?',
      content: (
        <p className="font-sans text-sm text-muted-foreground leading-relaxed">
          Cookies are small text files stored directly on your computer or
          mobile device when you browse websites. They are widely used to make
          web applications work, or work more efficiently, as well as to provide
          reporting and behavioral data to website owners. Cookies allow
          websites to recognize your device and remember useful information
          (such as your session states, preferred languages, and login status).
        </p>
      ),
    },
    {
      id: 'how-we-use',
      icon: <ToggleLeft className="w-5 h-5 text-primary" />,
      title: 'How We Use Cookies',
      content: (
        <div className="space-y-3 font-sans text-sm text-muted-foreground leading-relaxed">
          <p>
            FinAnalysis utilizes cookies and local storage tokens to optimize
            platform efficiency. The primary use-cases are:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>
              <strong>Essential & Authentication:</strong> To maintain secure
              customer login sessions, coordinate multi-factor OTP tokens, and
              verify that transactions are executed under authentic contexts.
            </li>
            <li>
              <strong>Functional Preferences:</strong> To remember your
              configuration settings (such as calculations run on our calculator
              models, inputs selected, or custom diagnostic filters).
            </li>
            <li>
              <strong>Analytics & Diagnostics:</strong> To track anonymized
              usage metrics, loading latency, and API performance. This helps us
              optimize calculations, debug error logs, and train Virtual Arijit
              based on general query success metrics.
            </li>
          </ul>
        </div>
      ),
    },
    {
      id: 'cookies-we-set',
      icon: <Monitor className="w-5 h-5 text-primary" />,
      title: 'Details of Cookies We Set',
      content: (
        <div className="space-y-4 font-sans text-sm text-muted-foreground leading-relaxed">
          <p>
            Here is a breakdown of the core identifiers and storage keys we
            configure:
          </p>
          <div className="overflow-x-auto border border-border/40 rounded-2xl bg-white/20">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-primary/5 text-primary border-b border-border/30 font-semibold font-mono">
                  <th className="p-3">Key / Name</th>
                  <th className="p-3">Type</th>
                  <th className="p-3">Purpose</th>
                  <th className="p-3">Duration</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/20">
                <tr>
                  <td className="p-3 font-mono font-semibold">token</td>
                  <td className="p-3">LocalStorage</td>
                  <td className="p-3">
                    Stores user authentication token to maintain secure
                    sessions.
                  </td>
                  <td className="p-3">Persistent (until logout)</td>
                </tr>
                <tr>
                  <td className="p-3 font-mono font-semibold">cookieConsent</td>
                  <td className="p-3">LocalStorage</td>
                  <td className="p-3">
                    Remembers your preference (Accepted/Declined) for cookie
                    tracking.
                  </td>
                  <td className="p-3">1 Year</td>
                </tr>
                <tr>
                  <td className="p-3 font-mono font-semibold">_ga / _gid</td>
                  <td className="p-3">HTTP Cookie</td>
                  <td className="p-3">
                    Anonymized analytics tracking via Google Analytics (if
                    enabled).
                  </td>
                  <td className="p-3">Session to 2 Years</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      ),
    },
    {
      id: 'controlling-cookies',
      icon: <Settings className="w-5 h-5 text-primary" />,
      title: 'Controlling Cookie Preferences',
      content: (
        <div className="space-y-3 font-sans text-sm text-muted-foreground leading-relaxed">
          <p>
            We provide a cookie banner prompt upon your first visit. Accepting
            consent sets the `cookieConsent` key in your local storage to
            `accepted`, which allows functional analytics tracking. Declining
            sets it to `declined`, restricting tracking.
          </p>
          <p>
            Additionally, you can restrict or block cookies through your web
            browser configuration. You must adjust settings on each browser and
            device individually:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>
              <strong>Google Chrome:</strong> Go to Settings &gt; Privacy and
              Security &gt; Third-party Cookies.
            </li>
            <li>
              <strong>Apple Safari:</strong> Go to Settings &gt; Safari &gt;
              Privacy & Security &gt; Block All Cookies.
            </li>
            <li>
              <strong>Mozilla Firefox:</strong> Go to Settings &gt; Privacy &
              Security &gt; Enhanced Tracking Protection.
            </li>
          </ul>
          <p className="mt-2 text-xs italic">
            * Note: Restricting essential session cookies may prevent you from
            logging in or uploading statements for onboarding diagnostics.
          </p>
        </div>
      ),
    },
    {
      id: 'policy-updates',
      icon: <ShieldAlert className="w-5 h-5 text-primary" />,
      title: 'Updates to This Policy',
      content: (
        <p className="font-sans text-sm text-muted-foreground leading-relaxed">
          We may update this Cookies Policy periodically to align with
          modifications to our features (like introducing new analytics services
          or database protocols). We advise reviewing this document regularly to
          keep updated on our cookie usage practices.
        </p>
      ),
    },
  ];

  return (
    <main className="relative min-h-screen w-full bg-transparent text-foreground flex flex-col font-clash">
      {/* Fixed Background container with User's Gradient Theme */}
      <div className="page-backdrop fixed inset-0 z-0 select-none pointer-events-none">
        <SoftBoxBlurBg />
      </div>

      <Navbar isLoaded={isLoaded} />

      {/* Header Title Section */}
      <div className="relative z-10 flex flex-col justify-center items-center px-6 pt-44 pb-6 text-center max-w-5xl mx-auto">
        <h1
          className={`text-4xl md:text-7xl font-normal tracking-tight mt-12 mb-4 leading-none text-primary font-clash transition-all duration-[1200ms] ease-out ${
            isLoaded
              ? 'opacity-100 blur-none scale-100'
              : 'opacity-0 blur-lg scale-95'
          } delay-[200ms]`}
        >
          Cookies Policy
        </h1>
        <p
          className={`text-sm md:text-base text-muted-foreground max-w-xl mx-auto mb-10 leading-relaxed font-sans transition-all duration-[1200ms] ease-out ${
            isLoaded
              ? 'opacity-100 blur-none scale-100'
              : 'opacity-0 blur-md scale-95'
          } delay-[400ms]`}
        >
          Last updated: June 6, 2026. We explain how we use cookies and local
          storage to keep your session secure and optimize your calculators.
        </p>
      </div>

      {/* Main Content Layout */}
      <div
        className={`relative z-10 w-full max-w-5xl mx-auto px-6 pb-36 grid grid-cols-1 lg:grid-cols-12 gap-10 transition-all duration-[1200ms] ease-out ${
          isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
        } delay-[500ms]`}
      >
        {/* Left Column: Quick Navigation Menu (Hidden on mobile) */}
        <div className="hidden lg:block lg:col-span-4 self-start sticky top-32 bg-white/20 border border-border rounded-3xl p-6 shadow-sm backdrop-blur-2xl">
          <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest block mb-4">
            Table of Contents
          </span>
          <nav className="flex flex-col gap-3 font-sans text-sm text-left">
            {sections.map((sec) => (
              <a
                key={sec.id}
                href={`#${sec.id}`}
                className="text-muted-foreground hover:text-primary transition-colors duration-200 py-1.5 border-b border-border/10 last:border-0 hover:pl-1 transition-all duration-200"
              >
                {sec.title}
              </a>
            ))}
          </nav>
        </div>

        {/* Right Column: Content */}
        <div className="lg:col-span-8 bg-white/35 border border-border rounded-3xl p-8 md:p-10 shadow-md backdrop-blur-2xl space-y-10 flex flex-col justify-center text-left">
          {sections.map((sec) => (
            <div key={sec.id} id={sec.id} className="space-y-4 scroll-mt-32">
              <div className="flex items-center gap-3 border-b border-border/40 pb-2">
                {sec.icon}
                <h2 className="text-lg md:text-xl font-bold text-primary font-clash tracking-wide">
                  {sec.title}
                </h2>
              </div>
              {sec.content}
            </div>
          ))}
        </div>
      </div>

      <Footer />

      {isLoaded && (
        <GradualBlur
          preset="page-footer"
          height="2rem"
          style={{ zIndex: 30 }}
        />
      )}
    </main>
  );
}
