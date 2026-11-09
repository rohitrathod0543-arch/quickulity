import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';
import mammoth from 'mammoth';

export interface PdfFileInfo {
  name: string;
  size: number;
  pageCount: number;
}

export async function getPdfInfo(file: File): Promise<PdfFileInfo> {
  const arrayBuffer = await file.arrayBuffer();
  try {
    const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
    return {
      name: file.name,
      size: file.size,
      pageCount: pdfDoc.getPageCount(),
    };
  } catch (err: any) {
    if (err.message && err.message.toLowerCase().includes('encrypt')) {
      throw new Error('This PDF is password-protected. Please provide an unlocked PDF.');
    }
    throw new Error('Could not parse PDF. The file may be corrupted or not a valid PDF.');
  }
}

/**
 * Merge multiple PDF files in given sequence into one PDF.
 */
export async function mergePdfFiles(files: File[]): Promise<Uint8Array> {
  if (files.length < 2) {
    throw new Error('Please select at least 2 PDF files to merge.');
  }

  const mergedPdf = await PDFDocument.create();

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const arrayBuffer = await file.arrayBuffer();
    try {
      const pdf = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
      const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
      copiedPages.forEach((page) => mergedPdf.addPage(page));
    } catch (err: any) {
      throw new Error(`Failed to load "${file.name}": ${err.message || 'Corrupted file'}`);
    }
  }

  return await mergedPdf.save({ useObjectStreams: true });
}

/**
 * Parses user page range string, e.g. "1-3, 5, 8-10" (1-indexed) into 0-indexed page numbers.
 */
export function parsePageRanges(rangesStr: string, totalPages: number): number[] {
  const clean = rangesStr.trim();
  if (!clean) {
    throw new Error('Please enter at least one page number or range.');
  }

  const pagesSet = new Set<number>();
  const parts = clean.split(',').map((s) => s.trim()).filter(Boolean);

  for (const part of parts) {
    if (part.includes('-')) {
      const [startStr, endStr] = part.split('-').map((s) => s.trim());
      const start = parseInt(startStr, 10);
      const end = parseInt(endStr, 10);

      if (isNaN(start) || isNaN(end)) {
        throw new Error(`Invalid range format: "${part}". Example: 1-5`);
      }
      if (start > end) {
        throw new Error(`Invalid range "${part}": Start page (${start}) cannot be greater than end page (${end}).`);
      }
      if (start < 1 || end > totalPages) {
        throw new Error(`Range "${part}" is out of bounds. The document has ${totalPages} page(s).`);
      }

      for (let p = start; p <= end; p++) {
        pagesSet.add(p - 1);
      }
    } else {
      const page = parseInt(part, 10);
      if (isNaN(page)) {
        throw new Error(`Invalid page number: "${part}".`);
      }
      if (page < 1 || page > totalPages) {
        throw new Error(`Page ${page} is out of bounds. The document has ${totalPages} page(s).`);
      }
      pagesSet.add(page - 1);
    }
  }

  const result = Array.from(pagesSet).sort((a, b) => a - b);
  if (result.length === 0) {
    throw new Error('No valid pages found in the requested range.');
  }
  return result;
}

/**
 * Split PDF by extracting specified pages into a new PDF.
 */
export async function splitPdfFile(
  file: File,
  pageRangesStr: string
): Promise<{ pdfBytes: Uint8Array; pageCount: number }> {
  const arrayBuffer = await file.arrayBuffer();
  const sourcePdf = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
  const totalPages = sourcePdf.getPageCount();

  const pageIndices = parsePageRanges(pageRangesStr, totalPages);

  const targetPdf = await PDFDocument.create();
  const copiedPages = await targetPdf.copyPages(sourcePdf, pageIndices);
  copiedPages.forEach((page) => targetPdf.addPage(page));

  const pdfBytes = await targetPdf.save({ useObjectStreams: true });
  return { pdfBytes, pageCount: copiedPages.length };
}

/**
 * Convert multiple image files into a single PDF document.
 */
export async function imagesToPdf(
  imageFiles: File[],
  options: {
    pageSize: 'a4' | 'fit';
    orientation: 'portrait' | 'landscape';
    margin: number; // in points (e.g. 20)
  }
): Promise<Uint8Array> {
  if (imageFiles.length === 0) {
    throw new Error('Please select at least one image.');
  }

  const pdfDoc = await PDFDocument.create();

  // A4 dimensions in points: 595.28 x 841.89
  const a4Width = options.orientation === 'portrait' ? 595.28 : 841.89;
  const a4Height = options.orientation === 'portrait' ? 841.89 : 595.28;

  for (const imgFile of imageFiles) {
    const arrayBuffer = await imgFile.arrayBuffer();
    const type = imgFile.type.toLowerCase();

    let embeddedImage;
    if (type.includes('png')) {
      embeddedImage = await pdfDoc.embedPng(arrayBuffer);
    } else {
      // JPEG / WebP / others converted to JPEG
      try {
        embeddedImage = await pdfDoc.embedJpg(arrayBuffer);
      } catch {
        // If direct JPG embedding fails (e.g. WebP or non-standard format), convert via HTML Canvas
        const dataUrl = await fileToJpegDataUrl(imgFile);
        const res = await fetch(dataUrl);
        const buf = await res.arrayBuffer();
        embeddedImage = await pdfDoc.embedJpg(buf);
      }
    }

    const { width: imgW, height: imgH } = embeddedImage;

    if (options.pageSize === 'fit') {
      const page = pdfDoc.addPage([imgW + options.margin * 2, imgH + options.margin * 2]);
      page.drawImage(embeddedImage, {
        x: options.margin,
        y: options.margin,
        width: imgW,
        height: imgH,
      });
    } else {
      // A4 page with aspect-ratio scaling
      const page = pdfDoc.addPage([a4Width, a4Height]);
      const availW = a4Width - options.margin * 2;
      const availH = a4Height - options.margin * 2;

      const scale = Math.min(availW / imgW, availH / imgH);
      const drawW = imgW * scale;
      const drawH = imgH * scale;

      const x = options.margin + (availW - drawW) / 2;
      const y = options.margin + (availH - drawH) / 2;

      page.drawImage(embeddedImage, {
        x,
        y,
        width: drawW,
        height: drawH,
      });
    }
  }

  return await pdfDoc.save({ useObjectStreams: true });
}

function fileToJpegDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return reject(new Error('Canvas context failed'));
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL('image/jpeg', 0.9));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Image decode failed'));
    };
    img.src = url;
  });
}

/**
 * Optimize and compress PDF by rewriting object streams and stripping metadata.
 */
export async function compressPdf(
  file: File
): Promise<{ pdfBytes: Uint8Array; originalSize: number; compressedSize: number; savedPercent: number }> {
  const originalSize = file.size;
  const arrayBuffer = await file.arrayBuffer();

  const pdfDoc = await PDFDocument.load(arrayBuffer, {
    ignoreEncryption: true,
    updateMetadata: false,
  });

  // Strip non-essential metadata
  pdfDoc.setTitle('');
  pdfDoc.setAuthor('');
  pdfDoc.setSubject('');
  pdfDoc.setKeywords([]);
  pdfDoc.setProducer('QuickUtility PDF Engine');
  pdfDoc.setCreator('QuickUtility');

  const pdfBytes = await pdfDoc.save({
    useObjectStreams: true,
    addDefaultPage: false,
  });

  const compressedSize = pdfBytes.byteLength;
  const savedPercent =
    originalSize > compressedSize
      ? Number((((originalSize - compressedSize) / originalSize) * 100).toFixed(1))
      : 0;

  return {
    pdfBytes,
    originalSize,
    compressedSize,
    savedPercent,
  };
}

/**
 * Word (DOCX) to PDF Conversion
 * Uses mammoth to parse DOCX content and builds a styled, paginated PDF with pdf-lib.
 */
export async function wordDocxToPdf(file: File): Promise<Uint8Array> {
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  const rawText = result.value;

  if (!rawText || rawText.trim().length === 0) {
    throw new Error('The DOCX file appears to be empty or contains no extractable text.');
  }

  const pdfDoc = await PDFDocument.create();
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const pageWidth = 595.28; // A4
  const pageHeight = 841.89;
  const margin = 50;
  const maxWidth = pageWidth - margin * 2;
  const lineHeight = 16;
  const headingLineHeight = 24;

  let currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
  let currentY = pageHeight - margin;

  const lines = rawText.split('\n');

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) {
      currentY -= lineHeight * 0.75;
      continue;
    }

    const isHeading = line.length < 60 && (line.toUpperCase() === line || line.endsWith(':'));
    const font = isHeading ? fontBold : fontRegular;
    const fontSize = isHeading ? 14 : 10.5;
    const curLineHeight = isHeading ? headingLineHeight : lineHeight;

    // Word wrap
    const words = line.split(' ');
    let currentLineText = '';

    for (const word of words) {
      const testLine = currentLineText ? `${currentLineText} ${word}` : word;
      const textWidth = font.widthOfTextAtSize(testLine, fontSize);

      if (textWidth > maxWidth && currentLineText) {
        if (currentY - curLineHeight < margin) {
          currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
          currentY = pageHeight - margin;
        }

        currentPage.drawText(currentLineText, {
          x: margin,
          y: currentY,
          size: fontSize,
          font,
          color: rgb(0.12, 0.15, 0.2),
        });

        currentY -= curLineHeight;
        currentLineText = word;
      } else {
        currentLineText = testLine;
      }
    }

    if (currentLineText) {
      if (currentY - curLineHeight < margin) {
        currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
        currentY = pageHeight - margin;
      }

      currentPage.drawText(currentLineText, {
        x: margin,
        y: currentY,
        size: fontSize,
        font,
        color: rgb(0.12, 0.15, 0.2),
      });

      currentY -= curLineHeight;
    }
  }

  // Draw footer page numbers
  const totalPages = pdfDoc.getPageCount();
  const pages = pdfDoc.getPages();
  for (let i = 0; i < totalPages; i++) {
    const p = pages[i];
    const footerText = `Page ${i + 1} of ${totalPages} — Converted by QuickUtility`;
    const footerW = fontRegular.widthOfTextAtSize(footerText, 9);
    p.drawText(footerText, {
      x: (pageWidth - footerW) / 2,
      y: 25,
      size: 9,
      font: fontRegular,
      color: rgb(0.5, 0.55, 0.6),
    });
  }

  return await pdfDoc.save({ useObjectStreams: true });
}

/**
 * PDF to Word (DOCX) Conversion
 * Extracts structured text streams from PDF and generates a genuine Microsoft Word (.docx) document using docx.js.
 */
export async function pdfToDocx(
  file: File,
  onProgress?: (msg: string) => void
): Promise<{ docxBlob: Blob; textFound: boolean; extractedCharacters: number }> {
  onProgress?.('Reading PDF binary content...');
  const arrayBuffer = await file.arrayBuffer();

  let extractedText = '';

  // Attempt text extraction using pdfjs-dist if in browser
  try {
    const pdfjsLib = await import('pdfjs-dist');
    // Set worker
    if (pdfjsLib.GlobalWorkerOptions && !pdfjsLib.GlobalWorkerOptions.workerSrc) {
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version || '3.11.174'}/pdf.worker.min.js`;
    }

    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    const numPages = pdf.numPages;

    for (let i = 1; i <= numPages; i++) {
      onProgress?.(`Extracting text from page ${i} of ${numPages}...`);
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => ('str' in item ? item.str : ''))
        .join(' ');
      extractedText += `\n\n--- Page ${i} ---\n\n` + pageText;
    }
  } catch (pdfJsErr) {
    console.warn('pdfjs-dist text extraction encountered an issue, running stream scanner:', pdfJsErr);
    // Fallback stream scanner: parse Tj and TJ text operators directly from PDF syntax
    extractedText = extractTextFromPdfStream(new Uint8Array(arrayBuffer));
  }

  const cleanText = extractedText.trim();
  const textFound = cleanText.length > 20;

  onProgress?.('Generating Microsoft Word (.docx) structure...');

  const paragraphs: Paragraph[] = [
    new Paragraph({
      text: file.name.replace(/\.[^/.]+$/, ''),
      heading: HeadingLevel.TITLE,
      spacing: { after: 300 },
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: `Converted from PDF: ${file.name} | Processed locally by QuickUtility`,
          italics: true,
          color: '666666',
          size: 18,
        }),
      ],
      spacing: { after: 400 },
    }),
  ];

  if (!textFound) {
    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text: 'Notice: No selectable text was found in this document.',
            bold: true,
            color: 'B91C1C',
          }),
        ],
      }),
      new Paragraph({
        text: 'This PDF appears to consist entirely of scanned images or rasterized artwork. An Optical Character Recognition (OCR) engine is required to transcribe pixel-based scanned documents. QuickUtility operates 100% locally in your browser for privacy and does not upload your files to cloud OCR APIs.',
        spacing: { after: 200 },
      })
    );
  } else {
    const rawParagraphs = cleanText.split('\n');
    for (const rawP of rawParagraphs) {
      const p = rawP.trim();
      if (!p) continue;

      if (p.startsWith('--- Page')) {
        paragraphs.push(
          new Paragraph({
            children: [
              new TextRun({
                text: p,
                bold: true,
                color: '2563EB',
                size: 20,
              }),
            ],
            spacing: { before: 300, after: 150 },
          })
        );
      } else if (p.length < 60 && (p.toUpperCase() === p || p.endsWith(':'))) {
        paragraphs.push(
          new Paragraph({
            text: p,
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 100 },
          })
        );
      } else {
        paragraphs.push(
          new Paragraph({
            text: p,
            spacing: { after: 120 },
          })
        );
      }
    }
  }

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: paragraphs,
      },
    ],
  });

  const docxBlob = await Packer.toBlob(doc);
  return {
    docxBlob,
    textFound,
    extractedCharacters: cleanText.length,
  };
}

/**
 * Stream text extractor for PDF binaries when pdfjs is not initialized.
 */
function extractTextFromPdfStream(uint8: Uint8Array): string {
  const textDecoder = new TextDecoder('latin1');
  const pdfString = textDecoder.decode(uint8);
  const textChunks: string[] = [];

  // Match parenthesized text in Tj operator: (Hello World) Tj
  const tjRegex = /\(([^)]+)\)\s*Tj/g;
  let match;
  while ((match = tjRegex.exec(pdfString)) !== null) {
    textChunks.push(match[1]);
  }

  // Match array text in TJ operator: [(Hello) 20 (World)] TJ
  const tjArrayRegex = /\[([^\]]+)\]\s*TJ/g;
  while ((match = tjArrayRegex.exec(pdfString)) !== null) {
    const inner = match[1];
    const subRegex = /\(([^)]+)\)/g;
    let subMatch;
    const lineParts: string[] = [];
    while ((subMatch = subRegex.exec(inner)) !== null) {
      lineParts.push(subMatch[1]);
    }
    if (lineParts.length > 0) {
      textChunks.push(lineParts.join(' '));
    }
  }

  return textChunks.join('\n');
}

/**
 * Render PDF pages to images (PNG or JPG).
 */
export async function renderPdfPagesToImages(
  file: File,
  format: 'png' | 'jpeg' = 'png',
  dpiScale = 2.0
): Promise<Array<{ pageNumber: number; dataUrl: string; blob: Blob; width: number; height: number }>> {
  const arrayBuffer = await file.arrayBuffer();
  const pdfjsLib = await import('pdfjs-dist');

  if (pdfjsLib.GlobalWorkerOptions && !pdfjsLib.GlobalWorkerOptions.workerSrc) {
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version || '3.11.174'}/pdf.worker.min.js`;
  }

  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
  const pdf = await loadingTask.promise;
  const numPages = pdf.numPages;
  const results: Array<{ pageNumber: number; dataUrl: string; blob: Blob; width: number; height: number }> = [];

  for (let pageNum = 1; pageNum <= numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const viewport = page.getViewport({ scale: dpiScale });

    const canvas = document.createElement('canvas');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) continue;

    if (format === 'jpeg') {
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    const renderContext = {
      canvasContext: ctx,
      viewport,
    };

    await page.render(renderContext as any).promise;

    const mime = format === 'jpeg' ? 'image/jpeg' : 'image/png';
    const dataUrl = canvas.toDataURL(mime, 0.95);
    const blob: Blob = await new Promise((res) => canvas.toBlob((b) => res(b!), mime, 0.95));

    results.push({
      pageNumber: pageNum,
      dataUrl,
      blob,
      width: canvas.width,
      height: canvas.height,
    });
  }

  return results;
}
