import { z } from 'zod';
import { CATEGORIES } from './categories';

export { CATEGORIES };
const STATUSES = ['Available', 'Display', 'Sold', 'Reserved'];

const currentYear = new Date().getFullYear();

export const artworkSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(200),
  image_url: z.string().trim().url('A valid image URL is required'),
  category: z.enum(CATEGORIES),
  medium: z.string().trim().min(1, 'Medium is required').max(200),
  dimensions: z.string().trim().max(200).optional().default(''),
  year_created: z.coerce
    .number()
    .int()
    .min(1000, 'Year looks invalid')
    .max(currentYear + 1),
  // Price is optional/zero for Display pieces; never negative.
  price: z.coerce.number().min(0, 'Price cannot be negative').default(0),
  status: z.enum(STATUSES).default('Available'),
  description: z.string().trim().max(5000).optional().default(''),
});

export const inquirySchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(120),
  email: z.string().trim().email('A valid email is required').max(200),
  message: z.string().trim().min(1, 'Message is required').max(5000),
  artwork_id: z.coerce.number().int().positive().optional().nullable(),
  // Honeypot: real users never fill this hidden field. Accept any value here
  // so the request validates normally -- the route then drops it silently.
  // Rejecting it at the schema would return a "website: Invalid input" error
  // that tells a bot exactly which field is the trap.
  website: z.string().max(500).optional().default(''),
});

// Run a schema and return a uniform result the route handlers can use.
export function validate(schema, data) {
  const result = schema.safeParse(data);
  if (result.success) return { data: result.data, error: null };
  const issues = result.error.issues
    .map((i) => `${i.path.join('.') || 'field'}: ${i.message}`)
    .join('; ');
  return { data: null, error: issues };
}
