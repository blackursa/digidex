export interface PasswordValidationResult {
  isValid: boolean;
  errors: string[];
}

export const validatePassword = (password: string): PasswordValidationResult => {
  const errors: string[] = [];
  
  // Minimum length
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }

  // Contains uppercase
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  // Contains lowercase
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  // Contains number
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  // Contains special character
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export interface SocialValidationResult {
  isValid: boolean;
  error?: string;
}

export const validateLinkedIn = (url: string): SocialValidationResult => {
  if (!url) return { isValid: true };
  
  const linkedinRegex = /^https:\/\/([\w]+\.)?linkedin\.com\/in\/[\w\-\_]+\/?$/;
  return {
    isValid: linkedinRegex.test(url),
    error: linkedinRegex.test(url) ? undefined : 'Please enter a valid LinkedIn profile URL (e.g., https://linkedin.com/in/username)'
  };
};

export const validateTwitter = (handle: string): SocialValidationResult => {
  if (!handle) return { isValid: true };
  
  // Remove @ if present
  const cleanHandle = handle.startsWith('@') ? handle.substring(1) : handle;
  const twitterRegex = /^[\w]{4,15}$/;
  
  return {
    isValid: twitterRegex.test(cleanHandle),
    error: twitterRegex.test(cleanHandle) ? undefined : 'Please enter a valid Twitter handle (4-15 characters, letters, numbers, and underscores only)'
  };
};

export const validateGitHub = (url: string): SocialValidationResult => {
  if (!url) return { isValid: true };
  
  const githubRegex = /^https:\/\/github\.com\/[\w\-]+\/?$/;
  return {
    isValid: githubRegex.test(url),
    error: githubRegex.test(url) ? undefined : 'Please enter a valid GitHub profile URL (e.g., https://github.com/username)'
  };
};

export const validateWebsite = (url: string): SocialValidationResult => {
  if (!url) return { isValid: true };
  
  try {
    new URL(url);
    return { isValid: true };
  } catch {
    return {
      isValid: false,
      error: 'Please enter a valid URL (e.g., https://example.com)'
    };
  }
};
