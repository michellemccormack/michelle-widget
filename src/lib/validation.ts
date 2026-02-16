/**
 * Input validation with Zod.
 * Sanitize all user input, max 500 characters.
 */

import { z } from 'zod';

const MAX_MESSAGE_LENGTH = 500;

export const chatRequestSchema = z.object({
  message: z
    .string()
    .min(1, 'Message is required')
    .max(MAX_MESSAGE_LENGTH, `Message must be ${MAX_MESSAGE_LENGTH} characters or less`)
    .transform((s) => s.trim()),
  session_id: z.string().min(1, 'Session ID is required'),
  context: z
    .object({
      previous_category: z.string().optional(),
      conversation_history: z
        .array(
          z.object({
            role: z.enum(['user', 'assistant']),
            content: z.string(),
          })
        )
        .optional(),
    })
    .optional(),
});

export const leadRequestSchema = z.object({
  email: z.string().email('Valid email is required'),
  zip: z
    .string()
    .regex(/^\d{5}$/, 'Zip must be 5 digits')
    .optional()
    .or(z.literal('')),
  name: z.string().max(100).optional(),
  session_id: z.string().min(1, 'Session ID is required'),
  source_category: z.string().optional(),
  source_question_id: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

export const logEventSchema = z.object({
  event_name: z.enum([
    'widget_open',
    'button_click',
    'question_asked',
    'answer_served',
    'lead_captured',
    'cta_clicked',
  ]),
  session_id: z.string().min(1),
  payload: z.record(z.unknown()),
});

export type ChatRequest = z.infer<typeof chatRequestSchema>;
export type LeadRequest = z.infer<typeof leadRequestSchema>;
export type LogEvent = z.infer<typeof logEventSchema>;
