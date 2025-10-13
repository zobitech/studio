'use server';

import { analyzePlatformResponse } from '@/ai/flows/analyze-platform-responses';
import { generateSeoRecommendations } from '@/ai/flows/generate-seo-recommendations';

const platforms = [
  { name: 'GPT-4o mini', key: 'chatgpt', isPost: false, apiUrl: 'https://api.bk9.dev/ai/BK9?BK9=zobi&model=gpt_o4_mini&q=' },
  { name: 'Copilot', key: 'copilot', isPost: false, apiUrl: 'https://api.bk9.dev/ai/copilot?q=' },
  { name: 'Perplexity', key: 'perplexity', isPost: false, apiUrl: 'https://api.bk9.dev/ai/Perplexity?q=' },
];

async function testAPI(platform: (typeof platforms)[0], prompt: string, website: string) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000);

    const apiUrl = platform.apiUrl + encodeURIComponent(prompt);
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      signal: controller.signal,
      headers: {
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'en-US,en;q=0.9',
        'Referer': 'https://claude.ai/',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
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

export async function getSeoRecommendations(website: string): Promise<string> {
  try {
    const result = await generateSeoRecommendations({ website });
    return result.recommendations;
  } catch (error) {
    console.error('Error generating SEO recommendations:', error);
    return 'Could not generate recommendations at this time. Please try again later.';
  }
}
