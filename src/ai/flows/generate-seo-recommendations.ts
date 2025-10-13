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
  Your task is to provide actionable recommendations to improve the visibility of the given website across different geographic regions.

  Website: {{{website}}}

  Analyze the website and provide a concise list of 3-5 key recommendations. Focus on practical advice. For example:
  - "Implement hreflang tags to signal language and regional targeting to search engines."
  - "Use a Content Delivery Network (CDN) to reduce latency for international users."
  - "Create localized content and landing pages for your top target countries."
  - "Optimize your Google Business Profile for local search if you have physical locations."

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
