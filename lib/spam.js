// Content-level spam checks for the public inquiry form.
//
// These run after schema validation and before anything touches the database.
// Everything here is deliberately cheap and dependency-free: the goal is to
// stop drive-by bot spam, not to win an arms race with a targeted attacker.

const URL_PATTERN = /(https?:\/\/|www\.)\S+/gi;

// Terms that essentially never appear in a genuine woodwork enquiry.
const SPAM_TERMS = [
  'seo service', 'backlink', 'crypto', 'bitcoin', 'forex', 'casino',
  'viagra', 'cialis', 'porn', 'loan offer', 'make money fast',
  'binary option', 'guest post', 'rank your website', 'buy followers',
];

const CYRILLIC = /[Ѐ-ӿ]/;

/**
 * Returns a reason string when the submission looks like spam, else null.
 * The caller decides whether to reject loudly or drop silently.
 */
export function spamReason({ name, email, message }) {
  const text = `${name} ${message}`.toLowerCase();

  // More than two links is a near-certain bot in this context.
  const links = message.match(URL_PATTERN) || [];
  if (links.length > 2) return 'too many links';

  // Any link at all in a very short message is a strong signal.
  if (links.length > 0 && message.trim().length < 60) return 'link in short message';

  if (SPAM_TERMS.some((term) => text.includes(term))) return 'spam keyword';

  // Cyrillic in an English/Filipino enquiry form is overwhelmingly bot traffic.
  if (CYRILLIC.test(message)) return 'unexpected script';

  // BBCode / raw anchor tags are pure bot signatures.
  if (/\[url[=\]]|<a\s+href=/i.test(message)) return 'markup in message';

  // A "name" containing a URL is never legitimate.
  if (URL_PATTERN.test(name)) return 'link in name';

  // Gibberish check: a long run with no spaces is not a real message.
  if (/\S{60,}/.test(message)) return 'unbroken string';

  // Disposable-address domains used almost exclusively for throwaway spam.
  const domain = email.split('@')[1]?.toLowerCase() || '';
  if (['mailinator.com', 'guerrillamail.com', '10minutemail.com', 'tempmail.com'].includes(domain)) {
    return 'disposable email';
  }

  return null;
}

/** Normalised message text, used to detect repeat submissions. */
export function messageFingerprint(message) {
  return message.toLowerCase().replace(/\s+/g, ' ').trim().slice(0, 255);
}
