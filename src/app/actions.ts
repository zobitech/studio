'use server';

import { analyzePlatformResponse } from '@/ai/flows/analyze-platform-responses';

const XAI_API_KEY = 'xai-WdZNDMiQM8zCTRq3xfWz9HmgXNLiFoQ84kOCD0Gy55neBtbUcLl5N7028FG08dS7zVC0VSkkjv7NFYCI';
const OPENAI_API_KEY = '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';

const XAI_API_URL = 'https://api.x.ai/v1/chat/completions';
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

const platforms = [
  { name: 'ChatGPT', key: 'chatgpt', isPost: true, apiUrl: OPENAI_API_URL, model: 'gpt-4o-mini' },
  { name: 'Copilot', key: 'copilot', isPost: false, apiUrl: 'https://api.bk9.dev/ai/copilot?q=' },
  { name: 'Perplexity', key: 'perplexity', isPost: false, apiUrl: 'https://api.bk9.dev/ai/Perplexity?q=' },
  { name: 'Grok', key: 'grok', isPost: true, apiUrl: XAI_API_URL, model: 'grok-1.5-flash' }
];

async function testAPI(platform: (typeof platforms)[0], prompt: string, website: string) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000);

    let response: Response;
    
    if (platform.isPost) {
      const apiKey = platform.key === 'chatgpt' ? OPENAI_API_KEY : XAI_API_KEY;
      const body = {
        messages: [
          { role: "system", content: "You are a test assistant." },
          { role: "user", content: prompt }
        ],
        model: platform.model,
        stream: false,
        temperature: 0
      };
      
      response = await fetch(platform.apiUrl, {
        method: 'POST',
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          'Accept': 'application/json'
        },
        body: JSON.stringify(body)
      });
    } else {
      const apiUrl = platform.apiUrl + encodeURIComponent(prompt);
      
      response = await fetch(apiUrl, {
        method: 'GET',
        signal: controller.signal,
        headers: {
          'Accept': 'application/json, text/plain, */*',
          'Accept-Language': 'en-US,en;q=0.9',
          'Referer': 'https://claude.ai/',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
    }
    
    clearTimeout(timeoutId);
    
    if (response.ok) {
      const text = await response.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        data = { answer: text };
      }

      let responseText = '';
      if (typeof data.BK9 === 'string') {
        responseText = data.BK9;
      } else if (data.BK9?.answer) {
        responseText = data.BK9.answer;
      } else if (typeof data.copilot === 'string') {
        responseText = data.copilot;
      } else if (typeof data.perplexity === 'string') {
        responseText = data.perplexity;
      } else if (data.answer) {
        responseText = data.answer;
      } else if (data.message) {
        responseText = data.message;
      } else if (data.choices && data.choices[0]?.message?.content) {
        responseText = data.choices[0].message.content;
      } else {
        responseText = JSON.stringify(data);
      }

      const analysis = await analyzePlatformResponse({ responseText, targetWebsite: website });

      return {
        found: analysis.found,
        status: 'success' as const,
        timestamp: new Date().toLocaleTimeString()
      };
    } else {
      console.error(`${platform.name} HTTP Error ${response.status}:`, await response.text());
      throw new Error(`HTTP ${response.status}`);
    }
  } catch (error: any) {
    console.error(`${platform.name} error:`, error.message);
    
    return {
      found: false,
      error: error.name === 'AbortError' ? 'Timeout (20s)' : 'API Connection Failed',
      status: 'failed' as const,
      timestamp: new Date().toLocaleTimeString()
    };
  }
}

export type PlatformResult = Awaited<ReturnType<typeof testAPI>>;
export type AllPlatformResults = Record<string, PlatformResult>;

export async function runVisibilityTests(website: string, prompt: string): Promise<AllPlatformResults> {
  const platformResults: AllPlatformResults = {};

  const testPromises = platforms.map(platform => 
    (async () => {
      const result = await testAPI(platform, prompt, website);
      return { key: platform.key, result };
    })()
  );
  
  const results = await Promise.all(testPromises);

  for(const item of results) {
    platformResults[item.key] = item.result;
  }
  
  return platformResults;
}
