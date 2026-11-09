import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const isProd = process.env.NODE_ENV === 'production';

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Initialize Gemini SDK with User-Agent header
const apiKey = process.env.GEMINI_API_KEY || '';
let aiClient: GoogleGenAI | null = null;

if (apiKey && apiKey !== 'MY_GEMINI_API_KEY') {
  try {
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  } catch (err) {
    console.error('Failed to initialize GoogleGenAI client:', err);
  }
}

// Health and AI Status Endpoint
app.get('/api/ai/status', (_req: Request, res: Response) => {
  const isAvailable = Boolean(aiClient);
  res.json({
    available: isAvailable,
    message: isAvailable
      ? 'Gemini AI service is connected and ready.'
      : 'GEMINI_API_KEY is not configured. AI suggestions are optional and disabled until configured in the Secrets panel.',
  });
});

// AI Resume Bullet Improver
app.post('/api/ai/resume-bullet', async (req: Request, res: Response) => {
  if (!aiClient) {
    return res.status(503).json({
      error: 'AI service is currently unavailable. GEMINI_API_KEY is not configured in environment variables.',
      available: false,
    });
  }

  const { bullet, role, industry } = req.body;
  if (!bullet || typeof bullet !== 'string' || bullet.trim().length === 0) {
    return res.status(400).json({ error: 'Please provide a valid resume bullet to improve.' });
  }

  try {
    const prompt = `You are a professional resume consultant. Improve the following resume bullet point to make it punchy, action-driven, measurable, and impactful.
Job Role: ${role || 'Professional'}
Industry: ${industry || 'General'}
Draft bullet: "${bullet}"

Provide exactly 3 improved variations (ranked: 1. Action & metrics, 2. Leadership & outcome, 3. Concise & high-impact).
Return ONLY a JSON array of strings, for example: ["Improved bullet 1", "Improved bullet 2", "Improved bullet 3"].`;

    const response = await aiClient.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const text = response.text || '[]';
    let results: string[] = [];
    try {
      results = JSON.parse(text);
    } catch {
      results = text.split('\n').filter((l: string) => l.trim().length > 0);
    }

    res.json({ success: true, variations: results });
  } catch (error: any) {
    console.error('Gemini bullet generation error:', error);
    res.status(500).json({ error: error?.message || 'Failed to generate resume suggestions.' });
  }
});

// AI Professional Summary Generator
app.post('/api/ai/resume-summary', async (req: Request, res: Response) => {
  if (!aiClient) {
    return res.status(503).json({
      error: 'AI service is currently unavailable. GEMINI_API_KEY is not configured.',
      available: false,
    });
  }

  const { role, yearsOfExp, keySkills, accomplishments } = req.body;

  try {
    const prompt = `Write a compelling 3-4 sentence professional resume summary for:
Target Role: ${role || 'Professional'}
Experience: ${yearsOfExp || 'Several years'}
Key Skills: ${keySkills || 'Industry core competencies'}
Accomplishments/Highlights: ${accomplishments || 'Proven record of success'}

Make it professional, concise, and ATS-friendly. Avoid clichés. Return plain text only.`;

    const response = await aiClient.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
    });

    res.json({ success: true, summary: response.text?.trim() || '' });
  } catch (error: any) {
    console.error('Gemini summary error:', error);
    res.status(500).json({ error: error?.message || 'Failed to generate summary.' });
  }
});

// AI Cover Letter Generator
app.post('/api/ai/cover-letter', async (req: Request, res: Response) => {
  if (!aiClient) {
    return res.status(503).json({
      error: 'AI service is currently unavailable. GEMINI_API_KEY is not configured.',
      available: false,
    });
  }

  const { candidateName, targetRole, companyName, experienceSummary, tone } = req.body;

  try {
    const prompt = `You are an expert career advisor. Write a tailored, professional cover letter:
Candidate Name: ${candidateName || 'Applicant'}
Target Position: ${targetRole || 'Applicant'}
Target Company: ${companyName || 'Hiring Team'}
Candidate Highlights / Background: ${experienceSummary || 'Experienced professional with relevant skills'}
Tone: ${tone || 'Professional & Confident'}

Structure:
- Date & Salutation
- Engaging Opening hook
- 1-2 Body paragraphs demonstrating relevant value and alignment
- Closing paragraph with call to action
- Sign-off

Return plain text formatted with standard paragraphs.`;

    const response = await aiClient.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
    });

    res.json({ success: true, letter: response.text?.trim() || '' });
  } catch (error: any) {
    console.error('Gemini cover letter error:', error);
    res.status(500).json({ error: error?.message || 'Failed to generate cover letter.' });
  }
});

// AI General Content Draft
app.post('/api/ai/content-draft', async (req: Request, res: Response) => {
  if (!aiClient) {
    return res.status(503).json({
      error: 'AI service is currently unavailable. GEMINI_API_KEY is not configured.',
      available: false,
    });
  }

  const { topic, context, format } = req.body;

  try {
    const prompt = `Write a clean, polished content draft.
Topic: ${topic || 'General Announcement'}
Context/Notes: ${context || 'None provided'}
Target Format: ${format || 'Short article or announcement'}

Return plain text.`;

    const response = await aiClient.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
    });

    res.json({ success: true, draft: response.text?.trim() || '' });
  } catch (error: any) {
    console.error('Gemini draft error:', error);
    res.status(500).json({ error: error?.message || 'Failed to generate content draft.' });
  }
});

// Sitemap and Robots.txt routes for SEO
app.get('/robots.txt', (_req: Request, res: Response) => {
  res.type('text/plain');
  res.send(`User-agent: *
Allow: /
Sitemap: ${process.env.APP_URL || 'https://quickutility.example.com'}/sitemap.xml
`);
});

app.get('/sitemap.xml', (_req: Request, res: Response) => {
  const baseUrl = process.env.APP_URL || 'https://quickutility.example.com';
  const tools = [
    '',
    'tool/pdf-to-word',
    'tool/word-to-pdf',
    'tool/images-to-pdf',
    'tool/pdf-to-images',
    'tool/merge-pdf',
    'tool/split-pdf',
    'tool/compress-pdf',
    'tool/image-compressor',
    'tool/image-resizer',
    'tool/image-kb-reducer',
    'tool/passport-photo',
    'tool/age-calculator',
    'tool/percentage-calculator',
    'tool/resume-builder',
    'tool/qr-generator',
    'about',
    'privacy',
    'terms',
    'contact'
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${tools
  .map(
    (path) => `  <url>
    <loc>${baseUrl}/${path ? `#/${path}` : ''}</loc>
    <changefreq>weekly</changefreq>
    <priority>${path === '' ? '1.0' : path.startsWith('tool/') ? '0.8' : '0.5'}</priority>
  </url>`
  )
  .join('\n')}
</urlset>`;

  res.type('application/xml');
  res.send(xml);
});

// Direct ZIP download endpoint
app.get(['/api/download-zip', '/quickutility-source.zip'], (_req: Request, res: Response) => {
  const zipPath = path.resolve(__dirname, 'public', 'quickutility-source.zip');
  res.download(zipPath, 'quickutility-source.zip', (err) => {
    if (err && !res.headersSent) {
      res.status(500).send('Could not send ZIP file.');
    }
  });
});

// Mounting Vite or static files
async function startServer() {
  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`QuickUtility Server running on http://0.0.0.0:${PORT} (Production: ${isProd})`);
  });
}

startServer().catch((err) => {
  console.error('Server startup failed:', err);
  process.exit(1);
});
