export type ToolCategory = 'pdf' | 'image' | 'daily';

export interface ToolMeta {
  id: string;
  name: string;
  category: ToolCategory;
  shortDesc: string;
  longDesc: string;
  iconName: string;
  path: string;
  badge?: string;
  supportedFiles?: string[];
  features: string[];
}

export interface AgeCalculationResult {
  years: number;
  months: number;
  days: number;
  totalDays: number;
  totalWeeks: number;
  totalHours: number;
  dayOfWeekBorn: string;
  nextBirthdayDays: number;
  zodiacSign: string;
  isLeapYearBorn: boolean;
}

export interface ResumeData {
  personal: {
    fullName: string;
    jobTitle: string;
    email: string;
    phone: string;
    location: string;
    website: string;
    linkedin: string;
    github: string;
  };
  summary: string;
  experience: Array<{
    id: string;
    company: string;
    position: string;
    location: string;
    startDate: string;
    endDate: string;
    current: boolean;
    description: string[];
  }>;
  education: Array<{
    id: string;
    institution: string;
    degree: string;
    field: string;
    location: string;
    startDate: string;
    endDate: string;
    gpa?: string;
  }>;
  skills: {
    technical: string[];
    soft: string[];
    tools: string[];
  };
  projects: Array<{
    id: string;
    title: string;
    link?: string;
    description: string;
    technologies: string[];
  }>;
  template: 'modern' | 'minimal' | 'creative';
}
