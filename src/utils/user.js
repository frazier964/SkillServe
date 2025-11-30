// Small helpers for deriving a friendly display name from a user object
export function getDisplayName(user) {
  if (!user) return '';
  const raw = (user.name || user.displayName || (user.email ? user.email.split('@')[0] : '') || '').toString();
  if (!raw) return '';
  // replace dots/underscores with spaces, collapse multiple separators
  const cleaned = raw.replace(/[._]+/g, ' ').replace(/\s+/g, ' ').trim();
  // Capitalize words
  const parts = cleaned.split(' ').map(p => p ? (p.charAt(0).toUpperCase() + p.slice(1)) : '').filter(Boolean);
  return parts.join(' ');
}

export function getFirstName(user) {
  const full = getDisplayName(user);
  if (!full) return '';
  return full.split(' ')[0];
}
