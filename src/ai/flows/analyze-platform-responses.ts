'use server';

/**
 * @fileOverview AI tool to analyze responses from AI platforms to determine if a given website is mentioned within the text.
 *
 * - analyzePlatformResponse - A function that analyzes the platform response.
 * - AnalyzePlatformResponseInput - The input type for the analyzePlatformResponse function.
 * - AnalyzePlatformResponseOutput - The return type for the analyzePlatformResponse function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzePlatformResponseInputSchema = z.object({
  responseText: z.string().describe('The response text from the AI platform.'),
  targetWebsite: z.string().describe('The website URL to check for in the response.'),
});

export type AnalyzePlatformResponseInput = z.infer<typeof AnalyzePlatformResponseInputSchema>;

const AnalyzePlatformResponseOutputSchema = z.object({
  found: z.boolean().describe('Whether the target website was found in the response text.'),
});

export type AnalyzePlatformResponseOutput = z.infer<typeof AnalyzePlatformResponseOutputSchema>;

export async function analyzePlatformResponse(
  input: AnalyzePlatformResponseInput
): Promise<AnalyzePlatformResponseOutput> {
  return analyzePlatformResponseFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzePlatformResponsePrompt',
  input: {schema: AnalyzePlatformResponseInputSchema},
  output: {schema: AnalyzePlatformResponseOutputSchema},
  prompt: `You are an expert AI assistant specializing in analyzing text responses from AI platforms to determine if a specific website is mentioned.

  Your task is to analyze the given response text and determine if the target website URL is present.
  Consider variations of the URL, such as with and without "www.", "http://", or "https://".
  The response should be concise and accurate.

  Response Text: {{{responseText}}}
  Target Website: {{{targetWebsite}}}

  Based on your analysis, determine whether the target website is mentioned in the response text.
  Set the "found" output field to true if the website is found, and false otherwise.`,
});

const analyzePlatformResponseFlow = ai.defineFlow(
  {
    name: 'analyzePlatformResponseFlow',
    inputSchema: AnalyzePlatformResponseInputSchema,
    outputSchema: AnalyzePlatformResponseOutputSchema,
  },
  async input => {
    const {
      responseText,
      targetWebsite,
    } = input;

    // Normalize the target website for more accurate matching.
    const normalizedTarget = targetWebsite
      .toLowerCase()
      .replace(/^https?:\/\/(www\.)?/, '')
      .replace(/\/$/, '')
      .split('/')[0];

    const patterns = [
      normalizedTarget,
      normalizedTarget.replace(/^www\./, ''),
      `www.${normalizedTarget.replace(/^www\./, '')}`,
      targetWebsite.toLowerCase(),
      targetWebsite.replace(/^https?:\/\//, '').toLowerCase(),
    ];

    const found = patterns.some(pattern => responseText.toLowerCase().includes(pattern));

    return {found};
  }
);
