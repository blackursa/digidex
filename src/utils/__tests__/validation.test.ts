import {
  validateEmail,
  validatePassword,
  validateLinkedIn,
  validateTwitter,
  validateGitHub,
  validateWebsite,
} from '../validation';

describe('Email Validation', () => {
  it('validates correct email addresses', () => {
    expect(validateEmail('test@example.com')).toBe(true);
    expect(validateEmail('user.name@domain.co.uk')).toBe(true);
    expect(validateEmail('user+tag@example.com')).toBe(true);
  });

  it('rejects invalid email addresses', () => {
    expect(validateEmail('invalid')).toBe(false);
    expect(validateEmail('user@')).toBe(false);
    expect(validateEmail('@domain.com')).toBe(false);
    expect(validateEmail('user@domain')).toBe(false);
  });
});

describe('Password Validation', () => {
  it('accepts valid passwords', () => {
    const result = validatePassword('StrongPass1!');
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('rejects weak passwords', () => {
    const result = validatePassword('weak');
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Password must be at least 8 characters long');
    expect(result.errors).toContain('Password must contain at least one uppercase letter');
    expect(result.errors).toContain('Password must contain at least one number');
    expect(result.errors).toContain('Password must contain at least one special character');
  });
});

describe('LinkedIn URL Validation', () => {
  it('accepts valid LinkedIn URLs', () => {
    const validUrls = [
      'https://linkedin.com/in/username',
      'https://www.linkedin.com/in/user-name',
      'https://linkedin.com/in/user_name',
    ];

    validUrls.forEach(url => {
      expect(validateLinkedIn(url).isValid).toBe(true);
    });
  });

  it('rejects invalid LinkedIn URLs', () => {
    const invalidUrls = [
      'http://linkedin.com/in/username',
      'https://linkedin.com/profile/username',
      'https://other-site.com/username',
    ];

    invalidUrls.forEach(url => {
      expect(validateLinkedIn(url).isValid).toBe(false);
    });
  });
});

describe('Twitter Handle Validation', () => {
  it('accepts valid Twitter handles', () => {
    const validHandles = [
      'username',
      '@username',
      'user_name',
      'user123',
    ];

    validHandles.forEach(handle => {
      expect(validateTwitter(handle).isValid).toBe(true);
    });
  });

  it('rejects invalid Twitter handles', () => {
    const invalidHandles = [
      'us',
      'very_long_username_that_exceeds_limit',
      'user@name',
      'user.name',
    ];

    invalidHandles.forEach(handle => {
      expect(validateTwitter(handle).isValid).toBe(false);
    });
  });
});

describe('GitHub URL Validation', () => {
  it('accepts valid GitHub URLs', () => {
    const validUrls = [
      'https://github.com/username',
      'https://github.com/user-name',
    ];

    validUrls.forEach(url => {
      expect(validateGitHub(url).isValid).toBe(true);
    });
  });

  it('rejects invalid GitHub URLs', () => {
    const invalidUrls = [
      'http://github.com/username',
      'https://github.com/user/repo',
      'https://other-site.com/username',
    ];

    invalidUrls.forEach(url => {
      expect(validateGitHub(url).isValid).toBe(false);
    });
  });
});

describe('Website URL Validation', () => {
  it('accepts valid URLs', () => {
    const validUrls = [
      'https://example.com',
      'http://subdomain.example.co.uk',
      'https://example.com/path',
    ];

    validUrls.forEach(url => {
      expect(validateWebsite(url).isValid).toBe(true);
    });
  });

  it('rejects invalid URLs', () => {
    const invalidUrls = [
      'not-a-url',
      'ftp://example.com',
      'example.com',
    ];

    invalidUrls.forEach(url => {
      expect(validateWebsite(url).isValid).toBe(false);
    });
  });
});
