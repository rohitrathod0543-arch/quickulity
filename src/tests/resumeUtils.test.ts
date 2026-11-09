import { describe, it, expect } from 'vitest';
import { validateResumeData, INITIAL_RESUME_DATA } from '../utils/resumeUtils';

describe('Resume Validation', () => {
  it('validates a complete initial resume', () => {
    const res = validateResumeData(INITIAL_RESUME_DATA);
    expect(res.isValid).toBe(true);
    expect(res.errors).toHaveLength(0);
  });

  it('catches missing name and invalid email', () => {
    const invalidData = {
      ...INITIAL_RESUME_DATA,
      personal: {
        ...INITIAL_RESUME_DATA.personal,
        fullName: '',
        email: 'invalid-email-string',
      },
    };
    const res = validateResumeData(invalidData);
    expect(res.isValid).toBe(false);
    expect(res.errors).toContain('Full Name is required.');
    expect(res.errors).toContain('Email address appears to be invalid.');
  });

  it('requires at least one experience entry with company & position', () => {
    const noExpData = {
      ...INITIAL_RESUME_DATA,
      experience: [],
    };
    const res = validateResumeData(noExpData);
    expect(res.isValid).toBe(false);
    expect(res.errors).toContain('Add at least one work experience entry.');
  });
});
