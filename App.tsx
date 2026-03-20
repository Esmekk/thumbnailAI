/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Loader2, Download, Sparkles, Image as ImageIcon, History, Send, Layout, Palette } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

type StyleOption = {
  id: string;
  name: string;
  description: string;
  promptSuffix: string;
};

const STYLE_OPTIONS: StyleOption[] = [
  {
    id: 'cinematic',
    name: 'Cinematic',
    description: 'Epic lighting, dramatic shadows, movie-like quality.',
    promptSuffix: 'epic cinematic style, dramatic lighting, volumetric fog, ray tracing, professional movie grade color correction, 8K resolution, hyper realistic digital art.'
  },
  {
    id: 'minimalist',
    name: 'Minimalist',
    description: 'Clean, bold, high contrast, modern aesthetic.',
    promptSuffix: 'minimalist design, bold typography, high contrast, clean background, modern aesthetic, professional graphic design, sharp focus.'
  },
  {
    id: 'brutalist',
    name: 'Brutalist',
    description: 'Raw, energetic, unconventional, high impact.',
    promptSuffix: 'brutalist style, raw energy, neon accents, thick borders, high impact, creative tool aesthetic, bold sans-serif elements, high energy contrast.'
  },
  {
    id: 'vibrant',
    name: 'Vibrant',
    description: 'Bright colors, playful, eye-catching energy.',
    promptSuffix: 'vibrant colors, playful atmosphere, high saturation, eye-catching energy, digital illustration style, friendly and approachable, bright lighting.'
  }
];

export default function App() {
  const [topic, setTopic] = useState('');
  const [selectedStyle, setSelectedStyle] = useState(STYLE_OPTIONS[0]);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<string[]>([]);

  const generateThumbnail = async () => {
    if (!topic.trim()) {
      setError("Please enter a topic for your thumbnail.");
      return;
    }

    setIsGenerating(true);
    setError(null);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      
      const fullPrompt = `YouTube thumbnail for a video about: ${topic}. 
      The thumbnail should be high impact and professional. 
      Style requirements: ${selectedStyle.promptSuffix}
      Ensure there is space for bold text if needed. No watermarks. 16:9 aspect ratio.`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [{ text: fullPrompt }],
        },
        config: {
          imageConfig: {
            aspectRatio: "16:9",
          },
        },
      });

      let foundImage = false;
      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          const base64Data = part.inlineData.data;
          const url = `data:image/png;base64,${base64Data}`;
          setImageUrl(url);
          setHistory(prev => [url, ...prev].slice(0, 8));
          foundImage = true;
          break;
        }
      }

      if (!foundImage) {
        throw new Error("No image was generated in the response.");
      }
    } catch (err) {
      console.error("Generation failed:", err);
      setError("Failed to generate thumbnail. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadImage = () => {
    if (!imageUrl) return;
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `thumbnail-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-zinc-100 font-sans selection:bg-indigo-500 selection:text-white">
      {/* Background Atmosphere */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-900/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-900/10 blur-[120px] rounded-full" />
      </div>

      <header className="relative z-10 border-b border-zinc-900 bg-black/50 backdrop-blur-md sticky top-0">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center font-bold shadow-lg shadow-indigo-500/20">
              <Layout className="w-5 h-5" />
            </div>
            <span className="font-bold tracking-tight text-xl">Thumbnail Studio</span>
          </div>
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-zinc-400">
            <a href="#" className="hover:text-white transition-colors">Templates</a>
            <a href="#" className="hover:text-white transition-colors">Pricing</a>
            <a href="#" className="hover:text-white transition-colors">API</a>
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-7xl mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-12 gap-12">
          
          {/* Controls Panel */}
          <div className="lg:col-span-5 space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h1 className="text-4xl font-bold tracking-tight mb-4">
                Create <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Viral Thumbnails</span> in Seconds
              </h1>
              <p className="text-zinc-400 leading-relaxed">
                Describe your video topic and let our AI handle the professional design. 
                Optimized for CTR and visual impact.
              </p>
            </motion.div>

            <div className="space-y-6">
              {/* Topic Input */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-zinc-500 flex items-center gap-2">
                  <Send className="w-3 h-3" />
                  Video Topic or Idea
                </label>
                <textarea
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g., A mysterious discovery in the deep ocean, or 10 ways to master React..."
                  className="w-full h-32 bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all resize-none"
                />
              </div>

              {/* Style Selection */}
              <div className="space-y-3">
                <label className="text-xs font-bold uppercase tracking-widest text-zinc-500 flex items-center gap-2">
                  <Palette className="w-3 h-3" />
                  Visual Style
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {STYLE_OPTIONS.map((style) => (
                    <button
                      key={style.id}
                      onClick={() => setSelectedStyle(style)}
                      className={`text-left p-3 rounded-xl border transition-all ${
                        selectedStyle.id === style.id 
                        ? 'bg-indigo-600/10 border-indigo-500 text-white shadow-lg shadow-indigo-500/10' 
                        : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                      }`}
                    >
                      <div className="font-bold text-sm mb-1">{style.name}</div>
                      <div className="text-[10px] leading-tight opacity-60">{style.description}</div>
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={generateThumbnail}
                disabled={isGenerating}
                className="w-full group relative px-8 py-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-zinc-800 disabled:cursor-not-allowed transition-all duration-300 rounded-xl font-bold text-lg flex items-center justify-center gap-3 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                {isGenerating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Designing...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Generate Studio Quality
                  </>
                )}
              </button>

              {error && (
                <p className="text-red-400 text-sm font-medium text-center">{error}</p>
              )}
            </div>
          </div>

          {/* Preview Panel */}
          <div className="lg:col-span-7">
            <div className="sticky top-28">
              <div className="relative aspect-video rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-800 shadow-2xl">
                <AnimatePresence mode="wait">
                  {imageUrl ? (
                    <motion.div
                      key="image"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="w-full h-full group"
                    >
                      <img
                        src={imageUrl}
                        alt="Generated Thumbnail"
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-4">
                        <button
                          onClick={downloadImage}
                          className="px-6 py-3 bg-white text-black rounded-lg font-bold flex items-center gap-2 hover:scale-105 transition-transform"
                        >
                          <Download className="w-5 h-5" />
                          Download PNG
                        </button>
                      </div>
                    </motion.div>
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-zinc-700 gap-4">
                      {isGenerating ? (
                        <div className="flex flex-col items-center gap-4">
                          <div className="relative">
                            <div className="w-16 h-16 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
                            <Sparkles className="absolute inset-0 m-auto w-6 h-6 text-indigo-400 animate-pulse" />
                          </div>
                          <p className="text-sm font-medium animate-pulse text-zinc-500">Processing visual elements...</p>
                        </div>
                      ) : (
                        <>
                          <ImageIcon className="w-20 h-20 opacity-10" />
                          <p className="text-sm font-medium opacity-40">Your thumbnail preview will appear here</p>
                        </>
                      )}
                    </div>
                  )}
                </AnimatePresence>
              </div>

              {/* Tips */}
              <div className="mt-8 p-4 rounded-xl bg-zinc-900/50 border border-zinc-800/50">
                <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">Pro Tip</h3>
                <p className="text-sm text-zinc-400 italic">
                  "Try describing the main subject and the mood. For example: 'A futuristic city at sunset with a lone traveler' works better than just 'City'."
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* History Section */}
        {history.length > 1 && (
          <section className="mt-24">
            <div className="flex items-center gap-3 mb-8">
              <History className="w-5 h-5 text-indigo-500" />
              <h2 className="text-2xl font-bold tracking-tight">Recent Generations</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {history.slice(1).map((img, i) => (
                <motion.button
                  key={i}
                  whileHover={{ scale: 1.05, y: -5 }}
                  onClick={() => setImageUrl(img)}
                  className="relative aspect-video rounded-xl overflow-hidden border border-zinc-800 group bg-zinc-900"
                >
                  <img src={img} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  <div className="absolute inset-0 bg-indigo-600/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-xs font-bold uppercase tracking-widest">Restore</span>
                  </div>
                </motion.button>
              ))}
            </div>
          </section>
        )}
      </main>

      <footer className="relative z-10 border-t border-zinc-900 py-12 mt-24">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8 text-zinc-600 text-sm">
          <div className="flex items-center gap-2">
            <Layout className="w-4 h-4" />
            <span className="font-bold tracking-tight text-zinc-400">Thumbnail Studio AI</span>
          </div>
          <div className="flex gap-8">
            <a href="#" className="hover:text-zinc-400 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-zinc-400 transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-zinc-400 transition-colors">Contact</a>
          </div>
          <p>&copy; 2026 AI Visual Labs. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
