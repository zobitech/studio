'use server';

import { analyzePlatformResponse } from '@/ai/flows/analyze-platform-responses';

const platforms = [
  { name: 'GPT-4o mini', key: 'chatgpt', isPost: false, apiUrl: 'https://api.bk9.dev/ai/BK9?BK9=zobi&model=gpt_o4_mini&q=' },
  { name: 'Copilot', key: 'copilot', isPost: false, apiUrl: 'https://api.bk9.dev/ai/copilot?q=' },
  { name: 'Perplexity', key: 'perplexity', isPost: false, apiUrl: 'https://api.bk9.dev/ai/Perplexity?q=' },
];

async function testAPI(platform: (typeof platforms)[0], prompt: string, website: string) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // Increased timeout to 60s

    let finalPrompt = prompt;
    if (platform.key === 'chatgpt' || platform.key === 'copilot') {
      finalPrompt += ' Please include web links and sources in your response.';
    }
    
    const apiUrl = platform.apiUrl + encodeURIComponent(finalPrompt);
    
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
      if (platform.key === 'chatgpt') {
        if (typeof data.BK9 === 'object' && data.BK9 !== null && 'answer' in data.BK9) {
          responseText = data.BK9.answer;
          if (Array.isArray(data.BK9.sources)) {
            responseText += ' ' + data.BK9.sources.join(' ');
          }
        } else if (typeof data.BK9 === 'string') {
          responseText = data.BK9;
        } else if (data.answer) {
          responseText = data.answer;
        }
      } else if (platform.key === 'copilot') {
         if (typeof data.copilot === 'string') {
          responseText = data.copilot;
        } else if (typeof data.copilot === 'object' && data.copilot !== null && 'answer' in data.copilot) {
          responseText = data.copilot.answer;
        } else if (data.answer) {
           responseText = data.answer;
        } else if (data.message) {
           responseText = data.message;
        } else if (typeof data === 'string') {
           responseText = data;
        } else {
           responseText = JSON.stringify(data);
        }
      } else if (platform.key === 'perplexity') {
        if (data.BK9 && typeof data.BK9 === 'object' && data.BK9.answer) {
          responseText = data.BK9.answer;
          if (Array.isArray(data.BK9.sources)) {
            responseText += ' ' + data.BK9.sources.join(' ');
          }
        } else if (typeof data.perplexity === 'string') {
          responseText = data.perplexity;
        } else if (typeof data.perplexity === 'object' && data.perplexity !== null && 'answer' in data.perplexity) {
          responseText = data.perplexity.answer;
        } else if (data.answer) {
          responseText = data.answer;
        }
      }
      else if (data.answer) {
        responseText = data.answer;
      } else if (data.message) {
        responseText = data.message;
      } else if (data.choices && data.choices[0]?.message?.content) {
        responseText = data.choices[0].message.content;
      } else if (typeof data === 'string') {
        responseText = data;
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
      error: error.name === 'AbortError' ? 'Timeout (60s)' : 'API Connection Failed',
      status: 'failed' as const,
      timestamp: new Date().toLocaleTimeString()
    };
  }
}

export async function runSingleTest(platformKey: string, prompt: string, website: string) {
  const platform = platforms.find(p => p.key === platformKey);
  if (!platform) {
    throw new Error(`Platform ${platformKey} not found.`);
  }
  return await testAPI(platform, prompt, website);
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
  if (!website) {
    return "Could not generate recommendations because the website URL is missing.";
  }
  
  const recommendationPrompt = `You are an expert AI Visibility and SEO Consultant. Your primary goal is to provide detailed, actionable strategies for a website to improve its chances of being cited and recommended by large language models (LLMs) like GPT, Copilot, and Perplexity, with a special focus on geographic (GEO) and international targeting.

Your advice should be comprehensive and well-explained, assuming the user's website has low visibility (e.g., 0/3 or 1/3 score). Your recommendations must be based on established SEO and content strategy best practices.

The user's website is: ${website}

IMPORTANT: You MUST return your response as a single string of properly formatted HTML. Use tags like <h3>, <h4>, <p>, <ul>, <li>, <strong>, etc. Do not include <html>, <head>, or <body> tags.

Provide a detailed set of recommendations structured with the following headings. For each recommendation, explain *why* it is important for AI visibility and provide a clear, actionable *how-to* guide.

<h3>1. Master Your Geographic & Local Signals</h3>
   <h4>Why it's important:</h4>
   <p>Explain how clear geographic information helps AIs confidently recommend the site for location-specific queries.</p>
   <h4>How to implement:</h4>
   <ul>
     <li><strong>On-Page SEO:</strong> Detail how to use location keywords in titles, headings, and body content (e.g., "Best Pizza in Brooklyn" for a pizzeria).</li>
     <li><strong>Structured Data:</strong> Explain the importance of 'LocalBusiness' schema markup with a complete address, phone number, and operating hours. Provide a simple JSON-LD example inside a code block.</li>
     <li><strong>Content Strategy:</strong> Recommend creating location-specific landing pages or blog posts (e.g., "Our Guide to Visiting San Francisco" if the website is a hotel there).</li>
   </ul>

<h3>2. Become an Authoritative Source for AIs</h3>
   <h4>Why it's important:</h4>
   <p>Explain that AIs are trained to recognize and prioritize authoritative, trustworthy content. High-quality content is more likely to be used as a source.</p>
   <h4>How to implement:</h4>
   <ul>
     <li><strong>E-E-A-T Principles:</strong> Briefly explain Expertise, Authoritativeness, and Trustworthiness. Advise on creating an "About Us" page, author bios with credentials, and citing sources.</li>
     <li><strong>In-Depth Content:</strong> Recommend writing comprehensive guides, tutorials, or original research that fully answers a user's question, making the website the definitive source.</li>
     <li><strong>Clear & Simple Language:</strong> Explain that AIs often simplify complex topics. Advise using clear headings, short paragraphs, and bullet points for easy parsing.</li>
   </ul>

<h3>3. Optimize for International Audiences (if applicable)</h3>
   <h4>Why it's important:</h4>
   <p>If the website targets multiple countries, explain how to signal this to search engines and AIs to avoid confusion and appear in relevant international searches.</p>
   <h4>How to implement:</h4>
   <ul>
     <li><strong>hreflang Tags:</strong> Explain what hreflang tags are and provide an example for a website targeting the US and Germany.</li>
     <li><strong>URL Structure:</strong> Briefly discuss the pros and cons of using subdomains (de.example.com) vs. subdirectories (example.com/de/) for international content.</li>
     <li><strong>Content Localization:</strong> Stress that translating content is not enough. It must be culturally adapted (e.g., currency, local idioms, imagery).</li>
   </ul>`;

  try {
    const gptPlatform = platforms.find(p => p.key === 'chatgpt');
    if (!gptPlatform) {
      throw new Error("GPT-4o mini platform not found.");
    }
    
    const apiUrl = gptPlatform.apiUrl + encodeURIComponent(recommendationPrompt);
    const response = await fetch(apiUrl);

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();
    let recommendations = '';

    if (typeof data.BK9 === 'object' && data.BK9 !== null && 'answer' in data.BK9) {
      recommendations = data.BK9.answer;
    } else if (typeof data.BK9 === 'string') {
      recommendations = data.BK9;
    } else if (data.answer) {
      recommendations = data.answer;
    } else {
      recommendations = "<p>Could not parse recommendations from the API response.</p>";
    }

    return recommendations;
  } catch (error: any) {
    console.error('Error generating SEO recommendations:', error);
    return `<p>Could not generate recommendations at this time. The AI model may be temporarily unavailable. Please try again later. (Error: ${error.message || 'Unknown'})</p>`;
  }
}
