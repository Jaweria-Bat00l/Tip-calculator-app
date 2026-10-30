/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Monitor,
  Smartphone,
  Eye,
  X,
  Code2,
  FileCode,
  Sparkles,
  ExternalLink,
  Copy,
  Check,
  Bookmark,
  BookmarkCheck,
  Share2,
  Volume2,
  VolumeX,
  History
} from 'lucide-react';

interface AdviceSlip {
  id: number;
  advice: string;
}

const INITIAL_ADVICE: AdviceSlip = {
  id: 117,
  advice: "It is easy to sit up and take notice, what's difficult is getting up and taking action."
};

const CURATED_FALLBACKS: AdviceSlip[] = [
  { id: 117, advice: "It is easy to sit up and take notice, what's difficult is getting up and taking action." },
  { id: 71, advice: "It is not the mountain we conquer, but ourselves." },
  { id: 142, advice: "Always do what you are afraid to do." },
  { id: 198, advice: "When in doubt, just take the next small step." },
  { id: 224, advice: "Remind yourself that good things take time." },
  { id: 55, advice: "Never let yesterday use up too much of today." },
  { id: 89, advice: "The best preparation for tomorrow is doing your best today." },
  { id: 163, advice: "Happiness is not by chance, but by choice." }
];

export default function App() {
  const [advice, setAdvice] = useState<AdviceSlip>(INITIAL_ADVICE);
  const [isLoading, setIsLoading] = useState(false);
  const [favorites, setFavorites] = useState<AdviceSlip[]>([]);
  const [history, setHistory] = useState<AdviceSlip[]>([INITIAL_ADVICE]);
  const [showHistory, setShowHistory] = useState(false);
  const [activeTab, setActiveTab] = useState<'generator' | 'standalone' | 'code'>('generator');
  const [deviceMode, setDeviceMode] = useState<'desktop' | 'mobile'>('desktop');
  const [showDesignDiff, setShowDesignDiff] = useState(false);
  const [diffOpacity, setDiffOpacity] = useState(50);
  const [codeFile, setCodeFile] = useState<'html' | 'css' | 'js'>('html');
  const [copiedCode, setCopiedCode] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const playClickSound = useCallback(() => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.12); // A5
      gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.12);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.12);
    } catch {
      // AudioContext not permitted or supported
    }
  }, [soundEnabled]);

  const fetchNewAdvice = useCallback(async () => {
    if (isLoading) return;
    setIsLoading(true);
    playClickSound();

    try {
      // Use timestamp query to prevent browser or proxy caching of Advice Slip API
      const res = await fetch(`https://api.adviceslip.com/advice?t=${Date.now()}`);
      if (!res.ok) throw new Error('API failed');
      const data = await res.json();
      const newSlip = data.slip as AdviceSlip;

      setAdvice(newSlip);
      setHistory((prev) => {
        if (prev.some((item) => item.id === newSlip.id)) return prev;
        return [newSlip, ...prev.slice(0, 19)];
      });
    } catch {
      // Resilient fallback from curated pool
      const available = CURATED_FALLBACKS.filter((item) => item.id !== advice.id);
      const randomFallback = available[Math.floor(Math.random() * available.length)] || CURATED_FALLBACKS[0];
      setAdvice(randomFallback);
      setHistory((prev) => {
        if (prev.some((item) => item.id === randomFallback.id)) return prev;
        return [randomFallback, ...prev.slice(0, 19)];
      });
    } finally {
      // Subtle cooldown for animation and rate limiting
      setTimeout(() => {
        setIsLoading(false);
      }, 400);
    }
  }, [advice.id, isLoading, playClickSound]);

  const handleCopyQuote = async () => {
    const text = `“${advice.advice}” — Advice #${advice.id}`;
    try {
      await navigator.clipboard.writeText(text);
      showToast('Advice copied to clipboard!');
    } catch {
      showToast('Copied: ' + text);
    }
  };

  const toggleFavorite = () => {
    if (favorites.some((fav) => fav.id === advice.id)) {
      setFavorites(favorites.filter((fav) => fav.id !== advice.id));
      showToast('Removed from favorites');
    } else {
      setFavorites([advice, ...favorites]);
      showToast('Saved to favorites!');
    }
  };

  const isFavorite = favorites.some((fav) => fav.id === advice.id);

  const handleCopyCode = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedCode(true);
      showToast('Code copied to clipboard!');
      setTimeout(() => setCopiedCode(false), 2000);
    } catch {
      showToast('Copied');
    }
  };

  return (
    <div className="min-h-screen bg-[#202733] text-[#cee3e9] flex flex-col justify-between items-center selection:bg-[#52ffa8] selection:text-[#202733] font-['Manrope',sans-serif] relative">
      
      {/* Top Reviewer Controls Bar */}
      <header className="w-full max-w-5xl px-4 py-3 flex flex-wrap items-center justify-between gap-3 text-xs z-20 bg-[#313a48]/70 backdrop-blur border-b border-[#4f5d74]/30">
        <div className="flex items-center gap-2">
          <span className="font-extrabold text-white tracking-widest uppercase text-xs flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#52ffa8] shadow-[0_0_8px_#52ffa8]" />
            Advice Generator
          </span>
          <span className="text-[#4f5d74]">/</span>
          <span className="text-[#99aab8] hidden sm:inline">Frontend Mentor Challenge</span>
        </div>

        {/* Tab switchers */}
        <div className="flex items-center gap-1 bg-[#202733] p-1 rounded-lg border border-[#4f5d74]/40">
          <button
            onClick={() => setActiveTab('generator')}
            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-colors flex items-center gap-1.5 ${
              activeTab === 'generator'
                ? 'bg-[#313a48] text-[#52ffa8] shadow-sm'
                : 'text-[#99aab8] hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>App</span>
          </button>

          <button
            onClick={() => setActiveTab('standalone')}
            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-colors flex items-center gap-1.5 ${
              activeTab === 'standalone'
                ? 'bg-[#313a48] text-[#52ffa8] shadow-sm'
                : 'text-[#99aab8] hover:text-white'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>Pure HTML/CSS</span>
          </button>

          <button
            onClick={() => setActiveTab('code')}
            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-colors flex items-center gap-1.5 ${
              activeTab === 'code'
                ? 'bg-[#313a48] text-[#52ffa8] shadow-sm'
                : 'text-[#99aab8] hover:text-white'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>Source Code</span>
          </button>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-2">
          {activeTab === 'generator' && (
            <>
              {/* Responsive Frame Toggle */}
              <div className="bg-[#202733] border border-[#4f5d74]/40 rounded-lg p-0.5 flex items-center">
                <button
                  onClick={() => setDeviceMode('desktop')}
                  className={`p-1.5 rounded-md transition-colors ${
                    deviceMode === 'desktop'
                      ? 'bg-[#313a48] text-[#52ffa8]'
                      : 'text-[#99aab8] hover:text-white'
                  }`}
                  title="Desktop 1440px view"
                  aria-label="Desktop view"
                >
                  <Monitor className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setDeviceMode('mobile')}
                  className={`p-1.5 rounded-md transition-colors ${
                    deviceMode === 'mobile'
                      ? 'bg-[#313a48] text-[#52ffa8]'
                      : 'text-[#99aab8] hover:text-white'
                  }`}
                  title="Mobile 375px frame preview"
                  aria-label="Mobile frame preview"
                >
                  <Smartphone className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Design Spec Comparison Toggle */}
              <button
                onClick={() => setShowDesignDiff(!showDesignDiff)}
                className={`p-1.5 rounded-lg border transition-colors ${
                  showDesignDiff
                    ? 'bg-[#52ffa8] text-[#202733] border-[#52ffa8] font-bold'
                    : 'bg-[#202733] text-[#99aab8] border-[#4f5d74]/40 hover:border-[#52ffa8]/50'
                }`}
                title="Design Spec Comparison Diff"
                aria-pressed={showDesignDiff}
              >
                <Eye className="w-3.5 h-3.5" />
              </button>

              {/* Sound Toggle */}
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className="p-1.5 rounded-lg bg-[#202733] border border-[#4f5d74]/40 text-[#99aab8] hover:text-white transition-colors"
                title={soundEnabled ? 'Mute sound effects' : 'Enable sound effects'}
              >
                {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
              </button>

              {/* History / Favorites Toggle */}
              <button
                onClick={() => setShowHistory(!showHistory)}
                className={`flex items-center gap-1 px-2 py-1.5 rounded-lg border transition-colors ${
                  showHistory
                    ? 'bg-[#313a48] text-[#52ffa8] border-[#52ffa8]/40'
                    : 'bg-[#202733] text-[#99aab8] border-[#4f5d74]/40 hover:text-white'
                }`}
                title="View previous advice history"
              >
                <History className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">History ({history.length})</span>
              </button>
            </>
          )}

          {/* Share / Copy Advice */}
          <button
            onClick={handleCopyQuote}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#202733] border border-[#4f5d74]/40 text-[#cee3e9] hover:text-white transition-colors"
            title="Copy current quote"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Share</span>
          </button>
        </div>
      </header>

      {/* Design Diff Comparison Overlay Slider */}
      {showDesignDiff && activeTab === 'generator' && (
        <aside aria-label="Design comparison slider" className="fixed top-14 z-30 bg-[#313a48]/95 backdrop-blur border border-[#4f5d74] text-white rounded-lg px-4 py-2 flex items-center gap-3 shadow-2xl text-xs">
          <span className="text-[#52ffa8] font-bold">Design Mockup Match:</span>
          <input
            type="range"
            min="0"
            max="100"
            value={diffOpacity}
            onChange={(e) => setDiffOpacity(Number(e.target.value))}
            className="w-24 sm:w-32 accent-[#52ffa8] cursor-pointer"
            aria-label="Overlay opacity"
          />
          <span className="font-mono text-[#52ffa8] font-bold">{diffOpacity}%</span>
          <button
            onClick={() => setShowDesignDiff(false)}
            className="text-[#99aab8] hover:text-white p-0.5 ml-1"
            aria-label="Close diff slider"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </aside>
      )}

      {/* Main Content Area */}
      <main className="flex-1 w-full flex items-center justify-center p-4 sm:p-8">
        
        {/* TAB 1: Live Interactive Advice Generator */}
        {activeTab === 'generator' && (
          <div
            className={`transition-all duration-300 flex items-center justify-center ${
              deviceMode === 'mobile'
                ? 'w-[375px] max-w-full min-h-[667px] border-4 border-[#4f5d74]/50 rounded-[44px] p-4 bg-[#202733] shadow-2xl relative my-4'
                : 'w-full max-w-[540px]'
            }`}
          >
            {deviceMode === 'mobile' && (
              <div className="absolute top-2 left-1/2 -translate-x-1/2 w-28 h-4 bg-[#313a48] rounded-full" />
            )}

            {/* The Advice Card Container */}
            <article className="w-full bg-[#313a48] rounded-2xl pt-10 sm:pt-12 px-6 sm:px-12 pb-16 sm:pb-20 text-center relative shadow-[0_20px_40px_rgba(0,0,0,0.25)] border border-[#4f5d74]/20 transition-all duration-200">
              
              {/* Optional Design Comparison Layer */}
              {showDesignDiff && (
                <img
                  src="/advice-generator-app-main/design/desktop-design.jpg"
                  alt="Original challenge design reference"
                  className="absolute inset-0 w-full h-full object-cover pointer-events-none z-10 rounded-2xl"
                  style={{ opacity: diffOpacity / 100 }}
                />
              )}

              {/* Action Toolbar on Top of Card */}
              <div className="absolute top-4 right-4 flex items-center gap-1 text-[#4f5d74]">
                <button
                  onClick={toggleFavorite}
                  className={`p-1.5 rounded-md hover:text-[#52ffa8] transition-colors ${
                    isFavorite ? 'text-[#52ffa8]' : 'text-[#4f5d74]'
                  }`}
                  title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                  aria-label="Favorite quote"
                >
                  {isFavorite ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                </button>
                <button
                  onClick={handleCopyQuote}
                  className="p-1.5 rounded-md hover:text-[#52ffa8] transition-colors"
                  title="Copy quote"
                  aria-label="Copy quote"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>

              {/* Advice ID Header */}
              <h1 className="text-[#52ffa8] text-xs sm:text-[13px] font-extrabold uppercase tracking-[0.3em] mb-6 select-none">
                ADVICE #{advice.id}
              </h1>

              {/* Advice Quote */}
              <blockquote
                className={`text-[#cee3e9] text-2xl sm:text-[28px] font-extrabold leading-[1.38] mb-8 sm:mb-10 min-h-[96px] flex items-center justify-center transition-opacity duration-200 select-text ${
                  isLoading ? 'opacity-30' : 'opacity-100'
                }`}
              >
                “{advice.advice}”
              </blockquote>

              {/* Responsive Pattern Divider */}
              <div className="w-full flex justify-center items-center mb-2">
                <picture className="w-full max-w-[444px]">
                  <source media="(max-width: 640px)" srcSet="/advice-images/pattern-divider-mobile.svg" />
                  <img
                    src="/advice-images/pattern-divider-desktop.svg"
                    alt=""
                    aria-hidden="true"
                    className="w-full h-auto mx-auto block"
                  />
                </picture>
              </div>

              {/* Floating Glowing Dice Button */}
              <button
                type="button"
                onClick={fetchNewAdvice}
                disabled={isLoading}
                aria-label="Generate new piece of advice"
                title="Get new advice"
                className="dice-btn group shadow-[0_0_0_transparent]"
              >
                <img
                  src="/advice-images/icon-dice.svg"
                  alt=""
                  aria-hidden="true"
                  width={24}
                  height={24}
                  className={`w-6 h-6 transition-transform duration-300 ${
                    isLoading ? 'animate-spin' : 'group-hover:rotate-45'
                  }`}
                />
              </button>

            </article>

            {/* History Drawer Modal / Popover */}
            {showHistory && (
              <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="bg-[#313a48] border border-[#4f5d74] rounded-2xl p-6 max-w-md w-full max-h-[80vh] flex flex-col shadow-2xl relative">
                  <div className="flex items-center justify-between pb-3 border-b border-[#4f5d74]/40">
                    <div className="flex items-center gap-2">
                      <History className="w-4 h-4 text-[#52ffa8]" />
                      <h2 className="text-sm font-bold text-white">Advice History & Saved</h2>
                    </div>
                    <button
                      onClick={() => setShowHistory(false)}
                      className="text-[#99aab8] hover:text-white p-1"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="overflow-y-auto flex-1 my-3 pr-1 divide-y divide-[#4f5d74]/30 space-y-2">
                    {history.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => {
                          setAdvice(item);
                          setShowHistory(false);
                          showToast(`Loaded Advice #${item.id}`);
                        }}
                        className="pt-2 cursor-pointer group hover:bg-[#202733]/40 p-2 rounded-lg transition-colors"
                      >
                        <div className="flex items-center justify-between text-[11px] font-bold text-[#52ffa8] mb-1">
                          <span>ADVICE #{item.id}</span>
                          <span className="text-[#99aab8] text-[10px] group-hover:text-white">Load</span>
                        </div>
                        <p className="text-xs text-[#cee3e9] leading-snug font-medium">
                          “{item.advice}”
                        </p>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => setShowHistory(false)}
                    className="w-full py-2 bg-[#202733] text-xs font-bold text-[#52ffa8] rounded-lg hover:bg-[#52ffa8] hover:text-[#202733] transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}

          </div>
        )}

        {/* TAB 2: Standalone HTML/CSS/JS Iframe Preview */}
        {activeTab === 'standalone' && (
          <div className="w-full max-w-4xl bg-[#313a48] border border-[#4f5d74] rounded-2xl overflow-hidden shadow-2xl flex flex-col h-[700px]">
            <div className="bg-[#202733] px-4 py-3 border-b border-[#4f5d74]/40 flex items-center justify-between text-xs text-white">
              <div className="flex items-center gap-2">
                <div className="flex gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-red-400 inline-block" />
                  <span className="w-3 h-3 rounded-full bg-yellow-400 inline-block" />
                  <span className="w-3 h-3 rounded-full bg-green-400 inline-block" />
                </div>
                <span className="font-mono text-[#cee3e9] ml-2">/advice-generator-app-main/index.html (Pure HTML, CSS & Vanilla JS)</span>
              </div>
              <a
                href="/advice-generator/index.html"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-[#52ffa8] hover:underline font-bold"
              >
                <span>Open in New Tab</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
            <iframe
              src="/advice-generator/index.html"
              title="Advice Generator Pure HTML/CSS Preview"
              className="w-full flex-1 border-0 bg-[#202733]"
            />
          </div>
        )}

        {/* TAB 3: Source Code Viewer */}
        {activeTab === 'code' && (
          <div className="w-full max-w-3xl bg-[#313a48] border border-[#4f5d74] rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[720px]">
            <div className="bg-[#202733] px-4 py-3 border-b border-[#4f5d74]/40 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCodeFile('html')}
                  className={`px-3 py-1 rounded-md text-xs font-mono font-bold transition-colors ${
                    codeFile === 'html'
                      ? 'bg-[#52ffa8] text-[#202733]'
                      : 'text-[#99aab8] hover:text-white'
                  }`}
                >
                  index.html
                </button>
                <button
                  onClick={() => setCodeFile('css')}
                  className={`px-3 py-1 rounded-md text-xs font-mono font-bold transition-colors ${
                    codeFile === 'css'
                      ? 'bg-[#52ffa8] text-[#202733]'
                      : 'text-[#99aab8] hover:text-white'
                  }`}
                >
                  style.css
                </button>
                <button
                  onClick={() => setCodeFile('js')}
                  className={`px-3 py-1 rounded-md text-xs font-mono font-bold transition-colors ${
                    codeFile === 'js'
                      ? 'bg-[#52ffa8] text-[#202733]'
                      : 'text-[#99aab8] hover:text-white'
                  }`}
                >
                  script.js
                </button>
              </div>

              <button
                onClick={() => handleCopyCode(ADVICE_CODE[codeFile])}
                className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-[#52ffa8] text-[#202733] font-bold text-xs hover:bg-[#cee3e9] transition-colors"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>Copy {codeFile.toUpperCase()}</span>
              </button>
            </div>

            <pre className="p-5 overflow-auto text-xs font-mono text-[#cee3e9] leading-relaxed bg-[#202733] flex-1">
              <code>{ADVICE_CODE[codeFile]}</code>
            </pre>
          </div>
        )}

      </main>

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-12 z-50 bg-[#52ffa8] text-[#202733] font-bold text-xs px-4 py-2.5 rounded-full shadow-lg flex items-center gap-2"
        >
          <Check className="w-4 h-4 text-[#202733]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Challenge Attribution Footer */}
      <footer className="w-full text-center py-4 px-4 text-xs text-[#4f5d74] border-t border-[#4f5d74]/20 bg-[#202733]/60">
        Challenge by{' '}
        <a
          href="https://www.frontendmentor.io?ref=challenge"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#52ffa8] font-bold hover:underline"
        >
          Frontend Mentor
        </a>
        . Coded with ❤️ by{' '}
        <a
          href="https://github.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#cee3e9] font-bold hover:underline"
        >
          Batool Jaweria
        </a>
        .
      </footer>

    </div>
  );
}

const ADVICE_CODE = {
  html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="icon" type="image/png" sizes="32x32" href="./images/favicon-32x32.png">
  <title>Frontend Mentor | Advice generator app</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@800&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <main>
    <article class="advice-card" aria-live="polite">
      <h1 class="advice-id" id="advice-id">ADVICE #117</h1>
      <blockquote class="advice-quote" id="advice-quote">
        “It is easy to sit up and take notice, what's difficult is getting up and taking action.”
      </blockquote>
      <picture class="divider">
        <source media="(max-width: 640px)" srcset="./images/pattern-divider-mobile.svg">
        <img src="./images/pattern-divider-desktop.svg" alt="" aria-hidden="true" width="444" height="16">
      </picture>
      <button type="button" class="dice-btn" id="dice-btn" aria-label="Generate new piece of advice">
        <img src="./images/icon-dice.svg" alt="" aria-hidden="true" width="24" height="24">
      </button>
    </article>
  </main>
  <footer class="attribution">
    Challenge by <a href="https://www.frontendmentor.io?ref=challenge" target="_blank">Frontend Mentor</a>. 
    Coded by <a href="#">Batool Jaweria</a>.
  </footer>
  <script src="script.js"></script>
</body>
</html>`,

  css: `:root {
  --light-cyan: hsl(193, 38%, 86%);
  --neon-green: hsl(150, 100%, 66%);
  --grayish-blue: hsl(217, 19%, 38%);
  --dark-grayish-blue: hsl(217, 19%, 24%);
  --dark-blue: hsl(218, 23%, 16%);
  --font-family: 'Manrope', sans-serif;
}

body {
  font-family: var(--font-family);
  background-color: var(--dark-blue);
  color: var(--light-cyan);
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin: 0;
  padding: 24px 16px;
}

.advice-card {
  background-color: var(--dark-grayish-blue);
  border-radius: 16px;
  padding: 48px 48px 72px 48px;
  text-align: center;
  position: relative;
  max-width: 540px;
  width: 100%;
}

.advice-id {
  color: var(--neon-green);
  font-size: 13px;
  font-weight: 800;
  letter-spacing: 4px;
  text-transform: uppercase;
  margin-bottom: 24px;
}

.advice-quote {
  color: var(--light-cyan);
  font-size: 28px;
  font-weight: 800;
  line-height: 1.38;
  margin-bottom: 40px;
}

.divider img {
  width: 100%;
  max-width: 444px;
}

.dice-btn {
  background-color: var(--neon-green);
  border: none;
  border-radius: 50%;
  width: 64px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  bottom: -32px;
  left: 50%;
  transform: translateX(-50%);
  cursor: pointer;
  transition: all 0.2s ease;
}

.dice-btn:hover {
  box-shadow: 0 0 40px var(--neon-green);
}

.dice-btn.spinning img {
  animation: rollDice 0.6s infinite;
}

@keyframes rollDice {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}`,

  js: `const adviceIdEl = document.getElementById('advice-id');
const adviceQuoteEl = document.getElementById('advice-quote');
const diceBtn = document.getElementById('dice-btn');

async function fetchAdvice() {
  diceBtn.classList.add('spinning');
  try {
    const res = await fetch('https://api.adviceslip.com/advice?t=' + Date.now());
    const data = await res.json();
    adviceIdEl.textContent = 'ADVICE #' + data.slip.id;
    adviceQuoteEl.textContent = '“' + data.slip.advice + '”';
  } catch (err) {
    console.error('Failed to fetch advice:', err);
  } finally {
    diceBtn.classList.remove('spinning');
  }
}

diceBtn.addEventListener('click', fetchAdvice);`
};
