'use server';
/**
 * @fileOverview An AI-powered tool that generates general dental health tips and answers common oral hygiene questions.
 *
 * - getDentalTip - A function that handles the generation of dental tips or answers.
 * - GetDentalTipInput - The input type for the getDentalTip function.
 * - GetDentalTipOutput - The return type for the getDentalTip function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GetDentalTipInputSchema = z.object({
  question: z.string().describe('The user\'s question about dental health or oral hygiene.'),
});
export type GetDentalTipInput = z.infer<typeof GetDentalTipInputSchema>;

const GetDentalTipOutputSchema = z.object({
  tip: z.string().describe('A general dental health tip or answer to the user\'s question.'),
});
export type GetDentalTipOutput = z.infer<typeof GetDentalTipOutputSchema>;

export async function getDentalTip(input: GetDentalTipInput): Promise<GetDentalTipOutput> {
  return getDentalTipFlow(input);
}

const dentalTipPrompt = ai.definePrompt({
  name: 'dentalTipPrompt',
  input: { schema: GetDentalTipInputSchema },
  output: { schema: GetDentalTipOutputSchema },
  prompt: `You are a friendly and knowledgeable dental health assistant at Veridian Dental. Your purpose is to provide helpful, general dental health tips and answer common oral hygiene questions in an easy-to-understand manner.

Always provide accurate and concise information. If the question is outside the scope of general dental health tips or requires a professional diagnosis, politely suggest consulting a dentist.

Question: {{{question}}}

Provide a general dental health tip or answer in the 'tip' field.`,
});

const getDentalTipFlow = ai.defineFlow(
  {
    name: 'getDentalTipFlow',
    inputSchema: GetDentalTipInputSchema,
    outputSchema: GetDentalTipOutputSchema,
  },
  async (input) => {
    const { output } = await dentalTipPrompt(input);
    return output!;
  }
);
