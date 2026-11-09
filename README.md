# QUICKUTILITY — 15-in-1 Fast, Private Online Utilities Platform

QuickUtility is a modern, responsive, privacy-first web utility suite providing 15 essential tools. Processing executes client-side inside the user's browser whenever practical, ensuring documents and personal photos remain strictly private without cloud retention.

---

## Final Feature & Acceptance Matrix

| # | Tool Name | Route | Implemented | Tested | Status | Engine / Known Limitation |
|---|---|---|---|---|---|---|
| 1 | **PDF to Word (DOCX)** | `#/tool/pdf-to-word` | Yes | Yes | **Passed** | Extracts text and structure to generate genuine `.docx` files via `docx` library. Scanned/flat image PDFs require OCR (disclosed with guidance). |
| 2 | **Word (DOCX) to PDF** | `#/tool/word-to-pdf` | Yes | Yes | **Passed** | Converts Word `.docx` via `mammoth` into standardized A4 paginated PDF with running page numbers using `pdf-lib`. |
| 3 | **Images to PDF** | `#/tool/images-to-pdf` | Yes | Yes | **Passed** | Supports JPG, PNG, and WebP with reordering, orientation (portrait/landscape), margins, and A4 or fit-image sizing. |
| 4 | **PDF to Images** | `#/tool/pdf-to-images` | Yes | Yes | **Passed** | Renders PDF pages to high-resolution PNG or JPG with DPI scaling (72 to 220 DPI) and individual or batch downloads. |
| 5 | **Merge PDFs** | `#/tool/merge-pdf` | Yes | Yes | **Passed** | Combines 2 or more PDF documents in custom user sequence with page count inspection via `pdf-lib`. |
| 6 | **Split PDF** | `#/tool/split-pdf` | Yes | Yes | **Passed** | Extracts page ranges (e.g. `1-3, 5, 8-10`) or presets (odd/even/halves) into a new PDF. |
| 7 | **Compress PDF** | `#/tool/compress-pdf` | Yes | Yes | **Passed** | Rewrites object streams and strips redundant metadata trees. Reports exact before/after bytes. |
| 8 | **Image Compressor** | `#/tool/image-compressor` | Yes | Yes | **Passed** | Real-time quality slider (5-100%), WebP/JPEG/PNG formats, before/after preview, and exact byte savings. |
| 9 | **Image Resizer** | `#/tool/image-resizer` | Yes | Yes | **Passed** | Pixel dimension scaling, aspect-ratio lock, percentage scaling, and social media presets (Instagram, YouTube, HD). |
| 10 | **Image File-Size Reducer** | `#/tool/image-kb-reducer` | Yes | Yes | **Passed** | Binary search algorithm reducing images to exact targets: 20 KB, 50 KB, 100 KB, or custom. Output measured directly. |
| 11 | **Passport Photo Maker** | `#/tool/passport-photo` | Yes | Yes | **Passed** | US 2x2 in, UK/Schengen 35x45mm, India, Canada/Australia standards; biometric face guidelines; background colors; printable 4x6" sheet. |
| 12 | **Age Calculator** | `#/tool/age-calculator` | Yes | Yes | **Passed** | Chronological years, months, days, total weeks, next birthday countdown, zodiac sign, leap year check, and future-date protection. |
| 13 | **Percentage Calculator** | `#/tool/percentage-calculator` | Yes | Yes | **Passed** | 4 modes: Exam marks/total, X% of Y, Percentage increase/decrease, and discount/savings calculator with step formulas. |
| 14 | **Resume Builder** | `#/tool/resume-builder` | Yes | Yes | **Passed** | 3 modern templates, local storage, live preview, vector ATS PDF export, and optional server-side Gemini AI polish for bullets/summary. |
| 15 | **QR Code Generator** | `#/tool/qr-generator` | Yes | Yes | **Passed** | Generates QR codes for URLs, Plain Text, WiFi (SSID/Password/Encryption), and vCards with custom colors and downloadable PNG & vector SVG. |

---

## Tech Stack & Architecture

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS v4, Lucide Icons, Motion.
- **Backend:** Node.js with Express (`server.ts`) serving as the full-stack entry point, proxying Gemini AI requests securely without leaking API keys to the browser bundle.
- **Engines:**
  - `pdf-lib`: PDF merging, splitting, compression, image embedding, and vector resume export.
  - `docx`: Generating genuine Microsoft Word `.docx` documents.
  - `mammoth`: Reading and extracting structured Word document content.
  - `qrcode`: Generating pixel-perfect PNG and vector SVG QR codes.
  - `@google/genai`: Server-side Gemini 3.8 Flash SDK for resume polishing, summary generation, and cover letters.
- **Testing:** Vitest automated test suite covering age calculation edge cases, leap years, percentage formulas, PDF range parser, and resume schema validation.

---

## Local Development & Setup

### 1. Prerequisites
- Node.js 18+ or 20+
- npm, yarn, or pnpm

### 2. Installation
```bash
# Clone or extract repository
cd quickutility

# Install dependencies
npm install
```

### 3. Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Populate `.env` with your variables (optional for core tools; required only for Gemini AI features):
```env
GEMINI_API_KEY="your-gemini-api-key"
APP_URL="http://localhost:3000"
```

### 4. Running the Application
```bash
# Start the full-stack development server (Express + Vite)
npm run dev

# Open in browser
http://localhost:3000
```

### 5. Running Automated Tests
```bash
npm test
```

### 6. Production Build
```bash
npm run build
```

---

## Deployment Instructions (VS Code & Hostinger)

### Option A: Node.js Hosting (Hostinger VPS / Cloud or Full-Stack Node)
If your Hostinger plan includes Node.js application support (cPanel Node.js or VPS):
1. Upload the project folder to your hosting directory.
2. Run `npm install --production=false`.
3. Run `npm run build`.
4. Set the startup file in Hostinger Node.js selector to `server.ts` (run via `tsx`) or build `server.js` with `esbuild/tsc` and start with `node server.js`.
5. Set the environment variable `GEMINI_API_KEY` in Hostinger's environment configuration.

### Option B: Static Web Hosting (Hostinger Shared Web Hosting)
All 15 core tools (PDF conversions, image tools, passport photos, calculators, resume builder, QR generator) run **100% client-side inside the user's browser**.
1. Run `npm run build` on your local machine.
2. Open the generated `dist/` directory.
3. Upload all files from `dist/` directly into your Hostinger `public_html/` directory via FTP or File Manager.
4. *Note:* AI polish suggestions require a Node.js backend. If deploying to static hosting, the core 15 tools operate completely; the AI polish modal displays a notice explaining that server-side AI is offline.

---

## AdSense Readiness
- In accordance with Google AdSense policies, responsive ad container placeholders are positioned cleanly below page introductions and below tool workspaces.
- Ad slots are never positioned beside critical "Upload", "Convert", or "Download" buttons.
- The containers remain disabled placeholders until an approved publisher ID is inserted by the site owner.

---

## Manual Test Instructions

1. **Age Calculator:** Open `#/tool/age-calculator`, enter birth date `2004-02-29` (leap year) and comparison date `2024-03-01`. Verify output indicates 20 years, 0 months, 1 day, and "Leap Year Baby".
2. **Merge PDFs:** Open `#/tool/merge-pdf`, upload 2 sample PDF files, swap their order using the arrow buttons, click "Merge PDFs", and download the combined file.
3. **Image KB Reducer:** Open `#/tool/image-kb-reducer`, upload a 2MB photo, select `50 KB`, click "Compress to Target", and verify measured size is ≤ 50 KB.
4. **Passport Photo Maker:** Open `#/tool/passport-photo`, upload a photo, adjust zoom and position to match the yellow face guidelines, and download the 4x6 inch printable sheet.
5. **Resume Builder:** Open `#/tool/resume-builder`, verify default sample data loads, customize name, and click "Export PDF Document". Open the resulting `.pdf` in Adobe Reader or Chrome to verify crisp vector rendering.
