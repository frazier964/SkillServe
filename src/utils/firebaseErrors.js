// Map common Firebase Auth error codes to friendly messages
export function firebaseErrorMessage(err) {
  if (!err) return 'An unknown error occurred.';
  const code = err.code || err?.message || '';
  // If message contains code-like string, try to normalize
  const normalized = String(code).toLowerCase();
  if (normalized.includes('email-already-in-use') || normalized.includes('email already in use')) {
    return 'That email is already registered. Try logging in or use a different email.';
  }
  if (normalized.includes('weak-password')) {
    return 'Password is too weak. Please choose a stronger password (6+ characters).';
  }
  if (normalized.includes('invalid-email')) {
    return 'The email address is invalid. Please check and try again.';
  }
  if (normalized.includes('user-not-found')) {
    return 'No account found with that email. Please sign up first.';
  }
  if (normalized.includes('wrong-password')) {
    return 'Incorrect password. Please try again.';
  }
  if (normalized.includes('configuration-not-found')) {
    return 'Authentication not configured for this project. Please enable Email/Password sign-in in the Firebase Console.';
  }
  if (normalized.includes('too-many-requests')) {
    return 'Too many attempts. Please wait and try again later.';
  }
  if (normalized.includes('network-request-failed')) {
    return 'Network error. Check your connection and try again.';
  }
  // fallback to original message when available
  if (err.message) return err.message;
  return 'An unexpected error occurred. Please try again.';
}
