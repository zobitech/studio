'use server';

/**
 * @fileOverview AI tool to generate SEO recommendations for a given website.
 *
 * - generateSeoRecommendations - A function that generates SEO recommendations.
 * - GenerateSeoRecommendationsInput - The input type for the generateSeoRecommendations function.
 * - GenerateSeoRecommendationsOutput - The return type for the generateSeoRecommendations function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateSeoRecommendationsInputSchema = z.object({
  website: z.string().describe('The website URL to analyze.'),
});

export type GenerateSeoRecommendationsInput = z.infer<typeof GenerateSeoRecommendationsInputSchema>;

const GenerateSeoRecommendationsOutputSchema = z.object({
  recommendations: z
    .string()
    .describe('SEO recommendations for improving GEO visibility.'),
});

export type GenerateSeoRecommendationsOutput = z.infer<typeof GenerateSeoRecommendationsOutputSchema>;

export async function generateSeoRecommendations(
  input: GenerateSeoRecommendationsInput
): Promise<GenerateSeoRecommendationsOutput> {
  return generateSeoRecommendationsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateSeoRecommendationsPrompt',
  input: {schema: GenerateSeoRecommendationsInputSchema},
  output: {schema: GenerateSeoRecommendationsOutputSchema},
  prompt: `You are an expert AI Visibility and SEO Consultant. Your primary goal is to provide detailed, actionable strategies for a website to improve its chances of being cited and recommended by large language models (LLMs) like GPT, Copilot, and Perplexity, with a special focus on geographic (GEO) and international targeting.

Your advice should be comprehensive and well-explained, assuming the user's website has low visibility (e.g., 0/3 or 1/3 score). Your recommendations must be based on established SEO and content strategy best practices, as you cannot access external websites.

Analyze the user's website URL: {{{website}}}

Provide a detailed set of recommendations structured with the following headings. For each recommendation, explain *why* it is important for AI visibility and provide a clear, actionable *how-to* guide.

**### 1. Master Your Geographic & Local Signals**
   - **Why it's important:** Explain how clear geographic information helps AIs confidently recommend the site for location-specific queries.
   - **How to implement:**
     - **On-Page SEO:** Detail how to use location keywords in titles, headings, and body content (e.g., "Best Pizza in Brooklyn" for a pizzeria at {{{website}}}).
     - **Structured Data:** Explain the importance of 'LocalBusiness' schema markup with a complete address, phone number, and operating hours. Provide a simple JSON-LD example.
     - **Content Strategy:** Recommend creating location-specific landing pages or blog posts (e.g., "Our Guide to Visiting San Francisco" if {{{website}}} is a hotel there).

**### 2. Become an Authoritative Source for AIs**
   - **Why it's important:** Explain that AIs are trained to recognize and prioritize authoritative, trustworthy content. High-quality content is more likely to be used as a source.
   - **How to implement:**
     - **E-E-A-T Principles:** Briefly explain Expertise, Authoritativeness, and Trustworthiness. Advise on creating an "About Us" page, author bios with credentials, and citing sources.
     - **In-Depth Content:** Recommend writing comprehensive guides, tutorials, or original research that fully answers a user's question, making {{{website}}} the definitive source.
     - **Clear & Simple Language:** Explain that AIs often simplify complex topics. Advise using clear headings (H2, H3), short paragraphs, and bullet points for easy parsing.

**### 3. Optimize for International Audiences (if applicable)**
   - **Why it's important:** If the website targets multiple countries, explain how to signal this to search engines and AIs to avoid confusion and appear in relevant international searches.
   - **How to implement:**
     - **hreflang Tags:** Explain what hreflang tags are and provide an example for {{{website}}} targeting the US and Germany.
     - **URL Structure:** Briefly discuss the pros and cons of using subdomains (de.example.com) vs. subdirectories (example.com/de/) for international content.
     - **Content Localization:** Stress that translating content is not enough. It must be culturally adapted (e.g., currency, local idioms, imagery).

Return the recommendations as a single, well-formatted string.`,
});

const generateSeoRecommendationsFlow = ai.defineFlow(
  {
    name: 'generateSeoRecommendationsFlow',
    inputSchema: GenerateSeoRecommendationsInputSchema,
    outputSchema: GenerateSeoRecommendationsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
