'use client';

import React, { useState, useTransition, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { Search, Loader, CheckCircle, AlertCircle, Globe, TrendingUp, Bot, Waves, Lightbulb, RefreshCw, Eye, ShieldCheck, Zap, BarChart2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Alert } from "@/components/ui/alert";
import { runVisibilityTests, getSeoRecommendations, runSingleTest, type AllPlatformResults, type PlatformResult } from './actions';
import { cn } from '@/lib/utils';
import { BrainCircuit } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';


export type PlatformKey = 'chatgpt' | 'copilot' | 'perplexity';

export interface HistoryEntry {
  website: string;
  prompt: string;
  date: string;
  time: string;
  results: AllPlatformResults;
  foundCount: number;
}

const platforms = [
  { name: 'GPT-4o mini', key: 'chatgpt' as PlatformKey, color: '#10a37f', icon: <Bot size={32} className="text-primary-foreground" /> },
  { name: 'Copilot', key: 'copilot' as PlatformKey, color: '#0078d4', icon: <Waves size={32} className="text-primary-foreground" /> },
  { name: 'Perplexity', key: 'perplexity' as PlatformKey, color: '#0084ff', icon: <BrainCircuit size={32} className="text-primary-foreground" /> }
];

export default function AISightPage() {
  const [website, setWebsite] = useState('');
  const [prompt, setPrompt] = useState('');
  const [isPending, startTransition] = useTransition();
  const [results, setResults] = useState<HistoryEntry | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [statusMessage, setStatusMessage] = useState('');
  const [currentTest, setCurrentTest] = useState('');
  const [recommendations, setRecommendations] = useState('');
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(false);
  const [retestingPlatform, setRetestingPlatform] = useState<string | null>(null);


  const handleTest = () => {
    if (!website.trim() || !prompt.trim()) {
      alert('Please enter both a website and a prompt');
      return;
    }
    
    let normalizedWebsite = website.trim();
    if (!normalizedWebsite.startsWith('http://') && !normalizedWebsite.startsWith('https://')) {
      normalizedWebsite = 'https://' + normalizedWebsite;
    }
    setWebsite(normalizedWebsite);
    
    setStatusMessage('Starting tests...');
    setCurrentTest('');
    setResults(null);
    setRecommendations('');
    setIsLoadingRecommendations(false);

    startTransition(async () => {
      try {
        const platformResults = await runVisibilityTests(normalizedWebsite, prompt);
        
        const entry: HistoryEntry = {
          website: normalizedWebsite,
          prompt,
          date: new Date().toLocaleDateString(),
          time: new Date().toLocaleTimeString(),
          results: platformResults,
          foundCount: Object.values(platformResults).filter(r => r.found).length
        };

        setResults(entry);
        setHistory([entry, ...history.slice(0, 19)]);
        setStatusMessage('✅ All tests complete! Generating recommendations...');
        setCurrentTest('');
        
        setIsLoadingRecommendations(true);
        const seoRecs = await getSeoRecommendations(normalizedWebsite);
        setRecommendations(seoRecs);
        setIsLoadingRecommendations(false);

        setStatusMessage('✅ All tasks complete!');
        setTimeout(() => setStatusMessage(''), 4000);
      } catch (error) {
        console.error('Test error:', error);
        setStatusMessage('❌ Error during testing');
        setIsLoadingRecommendations(false);
      }
    });
  };

  const handleRefresh = (platformKey: PlatformKey) => {
    if (!results) return;

    setRetestingPlatform(platformKey);
    startTransition(async () => {
      try {
        const newResult = await runSingleTest(platformKey, results.prompt, results.website);
        
        setResults(prevResults => {
          if (!prevResults) return null;
          
          const newPlatformResults = {
            ...prevResults.results,
            [platformKey]: newResult
          };
          
          const newFoundCount = Object.values(newPlatformResults).filter(r => r.found).length;

          const updatedEntry: HistoryEntry = {
            ...prevResults,
            results: newPlatformResults,
            foundCount: newFoundCount,
          };
          
          // Also update history
          setHistory(prevHistory => {
            const newHistory = [...prevHistory];
            const historyIndex = newHistory.findIndex(h => h.time === prevResults.time && h.date === prevResults.date);
            if (historyIndex !== -1) {
              newHistory[historyIndex] = updatedEntry;
            }
            return newHistory;
          });

          return updatedEntry;
        });

      } catch (error) {
        console.error(`Error re-testing ${platformKey}:`, error);
      } finally {
        setRetestingPlatform(null);
      }
    });
  };


  const chartData = useMemo(() => platforms.map(p => ({
    name: p.name,
    found: results?.results[p.key]?.found ? 1 : 0,
    color: p.color
  })), [results]);

  const historyChartData = useMemo(() => history.slice(0, 10).reverse().map((h, idx) => ({
    test: `Test ${history.length - 10 + idx + 1 > 0 ? history.length - 10 + idx + 1 : idx + 1}`,
    found: h.foundCount
  })), [history]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 sm:p-6 text-slate-100">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-2">
            <Globe className="text-accent" size={40} />
            <h1 className="text-4xl md:text-5xl font-bold text-white font-headline">AISight</h1>
          </div>
          <p className="text-slate-300 text-xl md:text-2xl font-light mt-2">Is your website invisible to AI?</p>
          <p className="text-primary text-lg md:text-xl font-semibold mt-1">See where you appear in ChatGPT, Copilot & Perplexity in under 60 seconds.</p>
        </header>

        {(isPending || statusMessage) && (
          <Alert className={cn("mb-6 max-w-2xl mx-auto",
            statusMessage.includes('✅') ? 'bg-emerald-900/20 border-emerald-700 text-emerald-200'
            : statusMessage.includes('❌') ? 'bg-red-900/20 border-red-700 text-red-200'
            : 'bg-blue-900/20 border-blue-700 text-blue-200'
          )}>
            <div className="flex items-center gap-3">
              {(isPending || isLoadingRecommendations) && <Loader className="animate-spin" size={20} />}
              <div>
                <p className="font-semibold">{statusMessage}</p>
                {currentTest && <p className="text-sm mt-1">{currentTest}</p>}
              </div>
            </div>
          </Alert>
        )}

        <Card className="bg-card/50 backdrop-blur-sm mb-12 max-w-2xl mx-auto shadow-2xl shadow-primary/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Search size={24} className="text-primary" />
              Start Your Free Visibility Test
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <label className="block text-white font-semibold mb-3 flex items-center gap-2">
                <Globe size={20} className="text-accent" />
                Your Website URL
              </label>
              <Input
                type="text"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && !isPending && handleTest()}
                placeholder="e.g., mybusiness.com"
                className="bg-background/50 focus:border-primary text-lg"
                disabled={isPending}
              />
            </div>
            <div>
              <label className="block text-white font-semibold mb-3 flex items-center gap-2">
                <Search size={20} className="text-accent" />
                A Prompt to Test
              </label>
              <Textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyPress={(e) => e.ctrlKey && e.key === 'Enter' && !isPending && handleTest()}
                placeholder="e.g., What are the best marketing agencies in New York?"
                className="bg-background/50 resize-none h-28 focus:border-primary text-lg"
                disabled={isPending}
              />
            </div>
          </CardContent>
          <CardFooter className="flex-col gap-3">
            <Button
              onClick={handleTest}
              disabled={isPending}
              className="w-full text-lg font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-primary/50"
              size="lg"
            >
              {isPending ? <Loader className="animate-spin mr-2" /> : <Search className="mr-2" />}
              {isPending ? 'Testing...' : 'Test My Website Visibility'}
            </Button>
            <p className="text-slate-400 text-sm">Free, instant results – no signup required.</p>
          </CardFooter>
        </Card>

        {!results && (
            <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12 text-center">
                    <div className="flex flex-col items-center p-4">
                        <Eye size={36} className="text-accent mb-3" />
                        <h3 className="text-xl font-bold text-white mb-2">Uncover Blind Spots</h3>
                        <p className="text-slate-400">Identify where your website fails to appear in AI-generated answers and recommendations.</p>
                    </div>
                    <div className="flex flex-col items-center p-4">
                        <BarChart2 size={36} className="text-accent mb-3" />
                        <h3 className="text-xl font-bold text-white mb-2">Benchmark Competitors</h3>
                        <p className="text-slate-400">See how your competitors are performing and find opportunities to outrank them in AI results.</p>
                    </div>
                    <div className="flex flex-col items-center p-4">
                        <Zap size={36} className="text-accent mb-3" />
                        <h3 className="text-xl font-bold text-white mb-2">Get Actionable Insights</h3>
                        <p className="text-slate-400">Receive expert, AI-powered recommendations to boost your visibility and capture more traffic.</p>
                    </div>
                </div>

                <div className="mb-12">
                    <h2 className="text-3xl font-bold text-center text-white mb-8">Trusted Across the Globe</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                        <Card className="bg-card/40 backdrop-blur-sm">
                            <CardContent className="p-6">
                                <div className="flex items-start gap-4">
                                    <Avatar>
                                        <AvatarImage src="https://picsum.photos/seed/user1/100/100" />
                                        <AvatarFallback>JD</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="text-slate-300 italic">"AISight showed we were invisible in 70% of AI answers. We fixed it and organic traffic jumped 22% in a month!"</p>
                                        <p className="font-bold text-white mt-3">- Jane Doe, Marketing Lead</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="bg-card/40 backdrop-blur-sm">
                            <CardContent className="p-6">
                                <div className="flex items-start gap-4">
                                    <Avatar>
                                        <AvatarImage src="https://picsum.photos/seed/user2/100/100" />
                                        <AvatarFallback>MS</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="text-slate-300 italic">"An essential tool for modern SEO. We uncovered content gaps we never would have found otherwise. Highly recommended."</p>
                                        <p className="font-bold text-white mt-3">- Mark Smith, Founder</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </>
        )}

        {results && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {platforms.map((platform) => {
                const result = results.results[platform.key];
                const found = result?.found;
                const error = result?.error;
                const isRetesting = retestingPlatform === platform.key;

                return (
                  <Card key={platform.key} className={cn("transition-all backdrop-blur-sm",
                    error ? 'bg-slate-700/20 border-slate-600'
                    : found ? 'bg-emerald-900/20 border-emerald-700'
                    : 'bg-red-900/20 border-red-700'
                  )}>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {platform.icon}
                          {platform.name}
                        </div>
                        {(error || !found) && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRefresh(platform.key)}
                            disabled={isRetesting}
                            className="h-8 w-8 text-slate-400 hover:text-white hover:bg-white/10"
                            title={`Re-run test for ${platform.name}`}
                          >
                            {isRetesting ? <Loader className="animate-spin" /> : <RefreshCw size={18} />}
                          </Button>
                        )}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {error ? (
                        <div className="flex items-start gap-3"><AlertCircle className="text-yellow-400 mt-1" /><p className="text-yellow-200">{error}</p></div>
                      ) : found ? (
                        <div className="flex items-start gap-3"><CheckCircle className="text-emerald-400 mt-1" /><p className="font-bold text-emerald-200">FOUND</p></div>
                      ) : (
                        <div className="flex items-start gap-3"><AlertCircle className="text-red-400 mt-1" /><p className="font-bold text-red-200">NOT FOUND</p></div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-card/50 backdrop-blur-sm md:col-span-2">
                <CardHeader><CardTitle className="flex items-center gap-2"><TrendingUp className="text-primary" />Test Summary</CardTitle></CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex justify-between items-center"><span className="text-slate-400">Website:</span><span className="font-semibold">{results.website}</span></div>
                  <div className="flex justify-between items-center"><span className="text-slate-400">Found In:</span><span className="text-primary font-bold text-lg">{results.foundCount} of {platforms.length}</span></div>
                  <div className="flex justify-between items-center"><span className="text-slate-400">Success Rate:</span><span className="font-bold text-lg">{Math.round((results.foundCount / platforms.length) * 100)}%</span></div>
                  <div className="flex justify-between items-center"><span className="text-slate-400">Test Time:</span><span className="font-semibold">{results.time}</span></div>
                </CardContent>
              </Card>

              <Card className="bg-card/50 backdrop-blur-sm">
                <CardHeader><CardTitle>Platform Distribution</CardTitle></CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={150}>
                    <PieChart>
                      <Pie data={[{ name: 'Found', value: results.foundCount }, { name: 'Not Found', value: platforms.length - results.foundCount }]} cx="50%" cy="50%" innerRadius={40} outerRadius={60} paddingAngle={5} dataKey="value">
                        <Cell key="found" fill="hsl(var(--primary))" />
                        <Cell key="not-found" fill="hsl(var(--destructive))" />
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }}/>
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
            
            {(recommendations || isLoadingRecommendations) && (
              <Card className="bg-card/50 backdrop-blur-sm">
                <CardHeader><CardTitle className="flex items-center gap-2"><Lightbulb className="text-primary" />Recommendations</CardTitle></CardHeader>
                <CardContent>
                  {isLoadingRecommendations ? (
                    <div className="flex items-center gap-3 text-slate-400">
                      <Loader className="animate-spin" size={20} />
                      <p>Analyzing your website and generating recommendations...</p>
                    </div>
                  ) : (
                    <div className="prose prose-invert max-w-none text-slate-300 prose-headings:text-white prose-h3:text-primary prose-h4:text-slate-100 prose-strong:text-white" dangerouslySetInnerHTML={{ __html: recommendations }} />
                  )}
                </CardContent>
              </Card>
            )}
            
            <Card className="bg-card/50 backdrop-blur-sm">
              <CardHeader><CardTitle>Platform Comparison</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                    <YAxis stroke="hsl(var(--muted-foreground))" domain={[0, 1]} ticks={[0,1]} tickFormatter={(v) => v === 1 ? 'Found' : 'Not Found'} />
                    <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }} formatter={(value) => value === 1 ? '✓ Found' : '✗ Not Found'} />
                    <Bar dataKey="found" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="bg-card/50 backdrop-blur-sm">
              <CardHeader><CardTitle>Tested Prompt</CardTitle></CardHeader>
              <CardContent>
                <p className="text-slate-300 bg-background/50 p-4 rounded-lg italic">"{results.prompt}"</p>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 my-12 text-center">
                <div className="flex flex-col items-center p-4">
                    <Eye size={36} className="text-accent mb-3" />
                    <h3 className="text-xl font-bold text-white mb-2">Uncover Blind Spots</h3>
                    <p className="text-slate-400">Identify where your website fails to appear in AI-generated answers and recommendations.</p>
                </div>
                <div className="flex flex-col items-center p-4">
                    <BarChart2 size={36} className="text-accent mb-3" />
                    <h3 className="text-xl font-bold text-white mb-2">Benchmark Competitors</h3>
                    <p className="text-slate-400">See how your competitors are performing and find opportunities to outrank them in AI results.</p>
                </div>
                <div className="flex flex-col items-center p-4">
                    <Zap size={36} className="text-accent mb-3" />
                    <h3 className="text-xl font-bold text-white mb-2">Get Actionable Insights</h3>
                    <p className="text-slate-400">Receive expert, AI-powered recommendations to boost your visibility and capture more traffic.</p>
                </div>
            </div>

            <div className="my-12">
                <h2 className="text-3xl font-bold text-center text-white mb-8">Trusted Across the Globe</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                    <Card className="bg-card/40 backdrop-blur-sm">
                        <CardContent className="p-6">
                            <div className="flex items-start gap-4">
                                <Avatar>
                                    <AvatarImage src="https://picsum.photos/seed/user1/100/100" />
                                    <AvatarFallback>JD</AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="text-slate-300 italic">"AISight showed we were invisible in 70% of AI answers. We fixed it and organic traffic jumped 22% in a month!"</p>
                                    <p className="font-bold text-white mt-3">- Jane Doe, Marketing Lead</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-card/40 backdrop-blur-sm">
                        <CardContent className="p-6">
                            <div className="flex items-start gap-4">
                                <Avatar>
                                    <AvatarImage src="https://picsum.photos/seed/user2/100/100" />
                                    <AvatarFallback>MS</AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="text-slate-300 italic">"An essential tool for modern SEO. We uncovered content gaps we never would have found otherwise. Highly recommended."</p>
                                    <p className="font-bold text-white mt-3">- Mark Smith, Founder</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

          </div>
        )}

        <div className="max-w-3xl mx-auto mt-12">
            <div className="flex items-center justify-center gap-4 mb-8">
                <ShieldCheck className="text-green-400" size={24} />
                <p className="text-green-300"><span className="font-bold">Your Privacy is Protected.</span> We perform a safe, read-only scan. Your data is never stored.</p>
            </div>

            <Accordion type="single" collapsible className="w-full bg-card/40 rounded-lg p-2">
                <AccordionItem value="item-1">
                    <AccordionTrigger className="text-lg font-semibold text-white px-4">How does this work?</AccordionTrigger>
                    <AccordionContent className="text-slate-300 px-4">
                        AISight sends your prompt to several major AI platforms (like GPT-4o mini and Copilot) and analyzes their live responses to see if your website is mentioned or used as a source. It's a real-time check of your visibility inside these "answer engines."
                    </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-2">
                    <AccordionTrigger className="text-lg font-semibold text-white px-4">Is it really free?</AccordionTrigger>
                    <AccordionContent className="text-slate-300 px-4">
                        Yes. This tool is 100% free to use. We use proxied APIs that do not require you to enter your own API keys.
                    </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-3">
                    <AccordionTrigger className="text-lg font-semibold text-white px-4">How can I improve my score?</AccordionTrigger>
                    <AccordionContent className="text-slate-300 px-4">
                       After each test, we provide a detailed, AI-generated list of recommendations. These tips focus on technical SEO, content strategy, and E-E-A-T (Expertise, Authoritativeness, Trustworthiness) signals that AI models look for.
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        </div>


        {history.length > 0 && (
          <Card className="mt-8 bg-card/50 backdrop-blur-sm">
            <CardHeader><CardTitle>Test History</CardTitle></CardHeader>
            <CardContent>
              {history.length > 1 && (
                <div className="mb-6">
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={historyChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="test" stroke="hsl(var(--muted-foreground))" />
                      <YAxis stroke="hsl(var(--muted-foreground))" domain={[0, platforms.length]} allowDecimals={false} />
                      <Tooltip labelClassName="font-bold" contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }} />
                      <Line type="monotone" dataKey="found" name="Platforms Found" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 4, fill: "hsl(var(--primary))" }} activeDot={{ r: 6 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
              <div className="space-y-2">
                {history.slice(0, 5).map((h, idx) => (
                  <div key={idx} className={cn("rounded-lg p-4 border", h.foundCount > 0 ? 'bg-emerald-900/20 border-emerald-700' : 'bg-slate-700/30 border-slate-600' )}>
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold truncate text-white">{h.website}</p>
                        <p className="text-slate-400 text-sm mt-1 truncate">"{h.prompt}"</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className={`font-bold text-lg ${h.foundCount > 0 ? 'text-emerald-400' : 'text-red-400'}`}>{h.foundCount}/{platforms.length}</p>
                        <p className="text-slate-500 text-xs mt-1">{h.time}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
        
        <footer className="mt-8 text-center text-slate-500 text-xs py-8">
            <p>Powered by AISight. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
}
