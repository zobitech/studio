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
  prompt: `You are an expert SEO consultant specializing in international and geographic targeting (GEO).
Your task is to provide actionable recommendations to improve the visibility of the given website across different geographic regions. Your advice should be based on general SEO best practices as you cannot access external websites.

Website: {{{website}}}

Provide a concise list of 3-5 key recommendations for improving the international SEO of the website. Frame the recommendations for the provided website.

Example format:
- Implement hreflang tags on {{{website}}} to signal language and regional targeting to search engines.
- Consider using a Content Delivery Network (CDN) to reduce latency for international users visiting {{{website}}}.
- Create localized content and landing pages for your top target countries.
- Optimize Google Business Profile for local search if {{{website}}} has physical locations.

Return the recommendations as a single string.`,
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
