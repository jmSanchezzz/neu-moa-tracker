// This is an intelligent MOA search flow that uses AI to suggest relevant MOAs based on partial input or related terms.

'use server';

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const IntelligentMOASearchInputSchema = z.object({
  query: z.string().describe('The search query for MOAs.'),
});

export type IntelligentMOASearchInput = z.infer<typeof IntelligentMOASearchInputSchema>;

const IntelligentMOASearchOutputSchema = z.object({
  results: z.array(z.string()).describe('A list of relevant MOA names or descriptions.'),
});

export type IntelligentMOASearchOutput = z.infer<typeof IntelligentMOASearchOutputSchema>;

export async function intelligentMOASearch(input: IntelligentMOASearchInput): Promise<IntelligentMOASearchOutput> {
  return intelligentMOASearchFlow(input);
}

const intelligentMOASearchPrompt = ai.definePrompt({
  name: 'intelligentMOASearchPrompt',
  input: {schema: IntelligentMOASearchInputSchema},
  output: {schema: IntelligentMOASearchOutputSchema},
  prompt: `You are an AI assistant helping users search for Memoranda of Agreement (MOAs).

  Based on the user's query, suggest relevant MOAs by name or description.  Consider partial matches and related terms to enhance the search results.

  Query: {{{query}}}

  Results:
  `,
});

const intelligentMOASearchFlow = ai.defineFlow(
  {
    name: 'intelligentMOASearchFlow',
    inputSchema: IntelligentMOASearchInputSchema,
    outputSchema: IntelligentMOASearchOutputSchema,
  },
  async input => {
    const {output} = await intelligentMOASearchPrompt(input);
    return output!;
  }
);
