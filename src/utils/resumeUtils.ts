import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { ResumeData } from '../types';

export const INITIAL_RESUME_DATA: ResumeData = {
  personal: {
    fullName: 'Alex Morgan',
    jobTitle: 'Senior Full-Stack Engineer',
    email: 'alex.morgan@example.com',
    phone: '+1 (555) 234-5678',
    location: 'San Francisco, CA',
    website: 'https://alexmorgan.dev',
    linkedin: 'linkedin.com/in/alexmorgan',
    github: 'github.com/alexmorgan',
  },
  summary:
    'Versatile software engineer with 6+ years of experience designing and shipping scalable web applications. Expert in TypeScript, React, Node.js, and cloud platforms. Passionate about developer tooling, performance optimization, and clean architecture.',
  experience: [
    {
      id: 'exp-1',
      company: 'TechFlow Systems',
      position: 'Lead Frontend Engineer',
      location: 'San Francisco, CA',
      startDate: '2022',
      endDate: 'Present',
      current: true,
      description: [
        'Architected modern micro-frontend architecture serving 1.5M monthly active users with 99.98% uptime.',
        'Cut bundle size by 42% and improved Core Web Vitals LCP from 3.8s to 1.2s through strategic code-splitting and asset optimization.',
        'Mentored 8 mid-level engineers, established automated CI/CD linting, and led bi-weekly technical design reviews.',
      ],
    },
    {
      id: 'exp-2',
      company: 'DataNova Analytics',
      position: 'Full-Stack Developer',
      location: 'Seattle, WA',
      startDate: '2019',
      endDate: '2022',
      current: false,
      description: [
        'Built real-time streaming analytics dashboard with React, WebSockets, and Node.js backend processing 50k events/sec.',
        'Designed RESTful & GraphQL microservices deployed on Google Cloud Platform with automated Docker pipelines.',
        'Collaborated closely with product managers and UX designers to ship 14 core user-facing features on schedule.',
      ],
    },
  ],
  education: [
    {
      id: 'edu-1',
      institution: 'University of Washington',
      degree: 'B.S. in Computer Science',
      field: 'Software Engineering & Systems',
      location: 'Seattle, WA',
      startDate: '2015',
      endDate: '2019',
      gpa: '3.85 / 4.0',
    },
  ],
  skills: {
    technical: ['TypeScript', 'React', 'Node.js', 'Next.js', 'Python', 'PostgreSQL', 'Docker', 'GraphQL'],
    soft: ['Team Leadership', 'Technical Mentorship', 'System Design', 'Agile / Scrum', 'Cross-functional Communication'],
    tools: ['Git', 'Vite', 'Tailwind CSS', 'AWS', 'GCP', 'Linux', 'Vitest', 'Figma'],
  },
  projects: [
    {
      id: 'proj-1',
      title: 'CloudMetrics Engine',
      link: 'https://github.com/alexmorgan/cloudmetrics',
      description: 'Open-source distributed telemetry pipeline and metric collector built in Node.js and TypeScript.',
      technologies: ['TypeScript', 'Node.js', 'Docker', 'Redis'],
    },
    {
      id: 'proj-2',
      title: 'Vite SpeedKit',
      link: 'https://vite-speedkit.demo',
      description: 'Zero-config asset bundler and tree-shaking optimizer plugin downloaded over 40k times.',
      technologies: ['Vite', 'Rollup', 'JavaScript AST'],
    },
  ],
  template: 'modern',
};

export function validateResumeData(data: ResumeData): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!data.personal.fullName.trim()) {
    errors.push('Full Name is required.');
  }
  if (!data.personal.email.trim()) {
    errors.push('Email address is required.');
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.personal.email.trim())) {
    errors.push('Email address appears to be invalid.');
  }

  if (data.experience.length === 0) {
    errors.push('Add at least one work experience entry.');
  } else {
    data.experience.forEach((exp, idx) => {
      if (!exp.company.trim() || !exp.position.trim()) {
        errors.push(`Work experience #${idx + 1} requires both a Company name and Position.`);
      }
    });
  }

  if (data.education.length === 0) {
    errors.push('Add at least one education entry.');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Generate a clean, vector-rendered ATS-friendly PDF resume using pdf-lib.
 */
export async function exportResumeToPdf(data: ResumeData): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();

  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontItalic = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

  const pageWidth = 595.28; // standard A4
  const pageHeight = 841.89;
  const margin = 40;
  const contentWidth = pageWidth - margin * 2;

  let page = pdfDoc.addPage([pageWidth, pageHeight]);
  let y = pageHeight - margin;

  const colorPrimary = rgb(0.12, 0.23, 0.54); // Deep Navy
  const colorText = rgb(0.15, 0.18, 0.22);
  const colorMuted = rgb(0.4, 0.45, 0.52);
  const colorLine = rgb(0.85, 0.88, 0.92);

  function checkNewPage(neededSpace: number) {
    if (y - neededSpace < margin) {
      page = pdfDoc.addPage([pageWidth, pageHeight]);
      y = pageHeight - margin;
    }
  }

  // Header: Name
  page.drawText(data.personal.fullName || 'Untitled Resume', {
    x: margin,
    y: y - 24,
    size: 24,
    font: fontBold,
    color: colorPrimary,
  });
  y -= 30;

  // Title
  if (data.personal.jobTitle) {
    page.drawText(data.personal.jobTitle, {
      x: margin,
      y: y - 14,
      size: 13,
      font: fontRegular,
      color: colorMuted,
    });
    y -= 18;
  }

  // Contact line
  const contactParts = [
    data.personal.email,
    data.personal.phone,
    data.personal.location,
    data.personal.linkedin,
    data.personal.website,
  ].filter(Boolean);

  const contactLine = contactParts.join('  •  ');
  if (contactLine) {
    page.drawText(contactLine, {
      x: margin,
      y: y - 10,
      size: 8.5,
      font: fontRegular,
      color: colorMuted,
    });
    y -= 16;
  }

  // Divider
  page.drawLine({
    start: { x: margin, y },
    end: { x: pageWidth - margin, y },
    thickness: 1,
    color: colorLine,
  });
  y -= 14;

  // Section: Summary
  if (data.summary) {
    checkNewPage(60);
    drawSectionHeading(page, 'PROFESSIONAL SUMMARY', margin, y, fontBold, colorPrimary);
    y -= 14;

    const wrapped = wrapText(data.summary, fontRegular, 9.5, contentWidth);
    for (const line of wrapped) {
      checkNewPage(14);
      page.drawText(line, {
        x: margin,
        y,
        size: 9.5,
        font: fontRegular,
        color: colorText,
      });
      y -= 13;
    }
    y -= 10;
  }

  // Section: Experience
  if (data.experience.length > 0) {
    checkNewPage(80);
    drawSectionHeading(page, 'WORK EXPERIENCE', margin, y, fontBold, colorPrimary);
    y -= 16;

    for (const exp of data.experience) {
      checkNewPage(50);
      // Position and dates
      page.drawText(exp.position, {
        x: margin,
        y,
        size: 11,
        font: fontBold,
        color: colorText,
      });

      const dateStr = `${exp.startDate} - ${exp.current ? 'Present' : exp.endDate}`;
      const dateW = fontRegular.widthOfTextAtSize(dateStr, 9.5);
      page.drawText(dateStr, {
        x: pageWidth - margin - dateW,
        y,
        size: 9.5,
        font: fontRegular,
        color: colorMuted,
      });
      y -= 13;

      // Company and location
      const sub = [exp.company, exp.location].filter(Boolean).join(' | ');
      page.drawText(sub, {
        x: margin,
        y,
        size: 9.5,
        font: fontItalic,
        color: colorMuted,
      });
      y -= 14;

      // Bullets
      for (const bullet of exp.description) {
        if (!bullet.trim()) continue;
        const wrappedBullet = wrapText(bullet, fontRegular, 9, contentWidth - 14);
        for (let bIdx = 0; bIdx < wrappedBullet.length; bIdx++) {
          checkNewPage(13);
          if (bIdx === 0) {
            page.drawText('•', { x: margin + 2, y, size: 9, font: fontBold, color: colorPrimary });
          }
          page.drawText(wrappedBullet[bIdx], {
            x: margin + 14,
            y,
            size: 9,
            font: fontRegular,
            color: colorText,
          });
          y -= 12;
        }
      }
      y -= 6;
    }
  }

  // Section: Education
  if (data.education.length > 0) {
    checkNewPage(70);
    drawSectionHeading(page, 'EDUCATION', margin, y, fontBold, colorPrimary);
    y -= 16;

    for (const edu of data.education) {
      checkNewPage(35);
      page.drawText(`${edu.degree} in ${edu.field}`, {
        x: margin,
        y,
        size: 10.5,
        font: fontBold,
        color: colorText,
      });

      const dates = [edu.startDate, edu.endDate].filter(Boolean).join(' - ');
      if (dates) {
        const dW = fontRegular.widthOfTextAtSize(dates, 9.5);
        page.drawText(dates, {
          x: pageWidth - margin - dW,
          y,
          size: 9.5,
          font: fontRegular,
          color: colorMuted,
        });
      }
      y -= 13;

      const instLine = [edu.institution, edu.location, edu.gpa ? `GPA: ${edu.gpa}` : ''].filter(Boolean).join(' | ');
      page.drawText(instLine, {
        x: margin,
        y,
        size: 9.5,
        font: fontRegular,
        color: colorMuted,
      });
      y -= 14;
    }
    y -= 4;
  }

  // Section: Skills
  const allSkills = [
    data.skills.technical.length ? `Technical: ${data.skills.technical.join(', ')}` : '',
    data.skills.soft.length ? `Core Strengths: ${data.skills.soft.join(', ')}` : '',
    data.skills.tools.length ? `Tools & Platforms: ${data.skills.tools.join(', ')}` : '',
  ].filter(Boolean);

  if (allSkills.length > 0) {
    checkNewPage(50);
    drawSectionHeading(page, 'SKILLS & COMPETENCIES', margin, y, fontBold, colorPrimary);
    y -= 16;

    for (const skillLine of allSkills) {
      const wrapped = wrapText(skillLine, fontRegular, 9, contentWidth);
      for (const line of wrapped) {
        checkNewPage(13);
        page.drawText(line, {
          x: margin,
          y,
          size: 9,
          font: fontRegular,
          color: colorText,
        });
        y -= 12;
      }
    }
  }

  return await pdfDoc.save({ useObjectStreams: true });
}

function drawSectionHeading(page: any, title: string, x: number, y: number, font: any, color: any) {
  page.drawText(title, {
    x,
    y,
    size: 10.5,
    font,
    color,
  });
}

function wrapText(text: string, font: any, fontSize: number, maxWidth: number): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let current = '';

  for (const w of words) {
    const test = current ? `${current} ${w}` : w;
    const testW = font.widthOfTextAtSize(test, fontSize);
    if (testW > maxWidth && current) {
      lines.push(current);
      current = w;
    } else {
      current = test;
    }
  }

  if (current) {
    lines.push(current);
  }

  return lines;
}
