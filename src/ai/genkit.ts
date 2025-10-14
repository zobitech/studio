import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

// This file is configured to use Google AI (Gemini).
// Even if you are not using it for recommendations,
// it is still used by other parts of the application.
export const ai = genkit({
  plugins: [googleAI()],
  model: 'googleai/gemini-2.5-flash',
});
