'use client';

import React, { useState, useTransition, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { Search, Loader, CheckCircle, AlertCircle, Globe, TrendingUp, Bot, Rocket, BrainCircuit, Waves, Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Alert } from "@/components/ui/alert";
import { runVisibilityTests, getSeoRecommendations, type AllPlatformResults } from './actions';
import { cn } from '@/lib/utils';

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
  { name: 'GPT-4o mini', key: 'chatgpt', color: '#10a37f', icon: <Bot size={32} className="text-primary-foreground" /> },
  { name: 'Copilot', key: 'copilot', color: '#0078d4', icon: <Waves size={32} className="text-primary-foreground" /> },
  { name: 'Perplexity', key: 'perplexity', color: '#0084ff', icon: <BrainCircuit size={32} className="text-primary-foreground" /> }
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

  const handleTest = () => {
    if (!website.trim() || !prompt.trim()) {
      alert('Please enter both a website and a prompt');
      return;
    }
    
    setStatusMessage('Starting tests...');
    setCurrentTest('');
    setResults(null);
    setRecommendations('');
    setIsLoadingRecommendations(false);

    startTransition(async () => {
      try {
        const platformResults = await runVisibilityTests(website, prompt);
        
        const entry: HistoryEntry = {
          website,
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
        const seoRecs = await getSeoRecommendations(website);
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
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Globe className="text-accent" size={40} />
            <h1 className="text-4xl md:text-5xl font-bold text-white font-headline">AISight</h1>
          </div>
          <p className="text-slate-400 text-lg">Monitor your website visibility across AI platforms</p>
        </header>

        {(isPending || statusMessage) && (
          <Alert className={cn("mb-6",
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

        <Card className="bg-card/50 backdrop-blur-sm mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search size={24} className="text-primary" />
              New Visibility Test
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <label className="block text-white font-semibold mb-3 flex items-center gap-2">
                <Globe size={20} className="text-accent" />
                Enter Your Website
              </label>
              <Input
                type="text"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && !isPending && handleTest()}
                placeholder="e.g., https://example.com"
                className="bg-background/50 focus:border-primary"
                disabled={isPending}
              />
            </div>
            <div>
              <label className="block text-white font-semibold mb-3 flex items-center gap-2">
                <Search size={20} className="text-accent" />
                Enter Your Prompt
              </label>
              <Textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyPress={(e) => e.ctrlKey && e.key === 'Enter' && !isPending && handleTest()}
                placeholder="e.g., What are the best productivity tools?"
                className="bg-background/50 resize-none h-28 focus:border-primary"
                disabled={isPending}
              />
              <p className="text-slate-400 text-sm mt-2">Ctrl+Enter to start the test.</p>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              onClick={handleTest}
              disabled={isPending}
              className="w-full text-lg font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-primary/50"
              size="lg"
            >
              {isPending ? <Loader className="animate-spin mr-2" /> : <Search className="mr-2" />}
              {isPending ? 'Testing...' : 'Test Website Visibility'}
            </Button>
          </CardFooter>
        </Card>

        {results && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {platforms.map((platform) => {
                const result = results.results[platform.key];
                const found = result?.found;
                const error = result?.error;
                return (
                  <Card key={platform.key} className={cn("transition-all backdrop-blur-sm",
                    error ? 'bg-slate-700/20 border-slate-600'
                    : found ? 'bg-emerald-900/20 border-emerald-700'
                    : 'bg-red-900/20 border-red-700'
                  )}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-3">
                        {platform.icon}
                        {platform.name}
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
                    <p className="text-slate-300 whitespace-pre-wrap">{recommendations}</p>
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
          </div>
        )}

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
        
        <footer className="mt-8 text-center text-slate-500 text-xs">
            <p>Powered by AISight. All rights reserved.</p>
            <p className="mt-2">Note: API keys are handled server-side for security. Some proxied APIs may experience intermittent connectivity.</p>
        </footer>
      </div>
    </div>
  );
}
