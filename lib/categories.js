// The work the workshop actually takes on. Single source of truth for the
// gallery filters, the admin form, and server-side validation.
//
// Kept in its own module (rather than in validation.js) so client components
// can import it without pulling zod into the browser bundle.
export const CATEGORIES = [
  'Wood Carving',
  'Wooden Trophy',
  'Name Plate',
  'Styrofoam Sculpture',
];
