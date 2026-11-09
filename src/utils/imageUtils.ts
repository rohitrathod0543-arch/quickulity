export interface ImageProcessingResult {
  blob: Blob;
  dataUrl: string;
  width: number;
  height: number;
  sizeBytes: number;
  originalBytes: number;
  savedPercent: number;
}

export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export async function loadImage(src: string | File | Blob): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(new Error('Failed to load image.'));

    if (typeof src === 'string') {
      img.src = src;
    } else {
      const url = URL.createObjectURL(src);
      img.src = url;
    }
  });
}

export function fileToDataUrl(file: File | Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Failed to read file as Data URL'));
    reader.readAsDataURL(file);
  });
}

export async function compressImage(
  file: File | Blob,
  quality = 0.8,
  outputType: 'image/jpeg' | 'image/webp' | 'image/png' = 'image/jpeg',
  maxWidth?: number,
  maxHeight?: number
): Promise<ImageProcessingResult> {
  const originalBytes = file.size;
  const img = await loadImage(file);

  let targetWidth = img.naturalWidth || img.width;
  let targetHeight = img.naturalHeight || img.height;

  if (maxWidth && targetWidth > maxWidth) {
    const ratio = maxWidth / targetWidth;
    targetWidth = maxWidth;
    targetHeight = Math.round(targetHeight * ratio);
  }

  if (maxHeight && targetHeight > maxHeight) {
    const ratio = maxHeight / targetHeight;
    targetHeight = maxHeight;
    targetWidth = Math.round(targetWidth * ratio);
  }

  const canvas = document.createElement('canvas');
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get 2D canvas context.');

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  // If JPEG, fill white background to prevent black background for transparent PNGs
  if (outputType === 'image/jpeg') {
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, targetWidth, targetHeight);
  }

  ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          return reject(new Error('Canvas image compression failed.'));
        }
        const dataUrl = canvas.toDataURL(outputType, quality);
        const savedPercent = originalBytes > 0
          ? Math.max(0, Number((((originalBytes - blob.size) / originalBytes) * 100).toFixed(1)))
          : 0;

        resolve({
          blob,
          dataUrl,
          width: targetWidth,
          height: targetHeight,
          sizeBytes: blob.size,
          originalBytes,
          savedPercent,
        });
      },
      outputType,
      quality
    );
  });
}

export async function resizeImage(
  file: File | Blob,
  newWidth: number,
  newHeight: number,
  outputType: 'image/jpeg' | 'image/png' | 'image/webp' = 'image/jpeg',
  quality = 0.92
): Promise<ImageProcessingResult> {
  const originalBytes = file.size;
  const img = await loadImage(file);

  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(newWidth));
  canvas.height = Math.max(1, Math.round(newHeight));
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Failed to create canvas context.');

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  if (outputType === 'image/jpeg') {
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) return reject(new Error('Resize failed.'));
        const dataUrl = canvas.toDataURL(outputType, quality);
        resolve({
          blob,
          dataUrl,
          width: canvas.width,
          height: canvas.height,
          sizeBytes: blob.size,
          originalBytes,
          savedPercent: originalBytes > 0 ? Number((((originalBytes - blob.size) / originalBytes) * 100).toFixed(1)) : 0,
        });
      },
      outputType,
      quality
    );
  });
}

/**
 * Iterative binary search to reduce file size to strictly under or within target KB.
 */
export async function reduceImageToTargetKb(
  file: File | Blob,
  targetKb: number,
  outputType: 'image/jpeg' | 'image/webp' = 'image/jpeg'
): Promise<{ result: ImageProcessingResult; iterations: number }> {
  const targetBytes = targetKb * 1024;
  const originalBytes = file.size;
  const img = await loadImage(file);

  let minQuality = 0.05;
  let maxQuality = 0.95;
  let bestBlob: Blob | null = null;
  let bestDataUrl = '';
  let bestWidth = img.naturalWidth || img.width;
  let bestHeight = img.naturalHeight || img.height;
  let iterations = 0;

  let currentScale = 1.0;

  // If already smaller than target, run light pass
  if (originalBytes <= targetBytes) {
    const direct = await compressImage(file, 0.95, outputType);
    return { result: direct, iterations: 1 };
  }

  // Multi-pass binary search over quality, and downscale dimensions if necessary
  for (let pass = 0; pass < 3; pass++) {
    minQuality = 0.05;
    maxQuality = 0.95;

    for (let step = 0; step < 8; step++) {
      iterations++;
      const currentQuality = (minQuality + maxQuality) / 2;
      const testWidth = Math.max(80, Math.round((img.naturalWidth || img.width) * currentScale));
      const testHeight = Math.max(80, Math.round((img.naturalHeight || img.height) * currentScale));

      const canvas = document.createElement('canvas');
      canvas.width = testWidth;
      canvas.height = testHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) break;

      if (outputType === 'image/jpeg') {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, testWidth, testHeight);
      }
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, testWidth, testHeight);

      const blob: Blob | null = await new Promise((res) => canvas.toBlob(res, outputType, currentQuality));
      if (!blob) break;

      if (blob.size <= targetBytes) {
        // Under target, check if closer than best
        if (!bestBlob || blob.size > bestBlob.size) {
          bestBlob = blob;
          bestDataUrl = canvas.toDataURL(outputType, currentQuality);
          bestWidth = testWidth;
          bestHeight = testHeight;
        }
        // Try higher quality to get closer to target
        minQuality = currentQuality;
      } else {
        // Overshot, need lower quality
        maxQuality = currentQuality;
      }
    }

    if (bestBlob && bestBlob.size <= targetBytes) {
      break;
    }

    // Still too large even at low quality, scale down dimensions
    currentScale *= 0.7;
  }

  if (!bestBlob) {
    // Fallback: minimal acceptable output
    const fallback = await compressImage(file, 0.2, outputType, 600, 600);
    return { result: fallback, iterations };
  }

  const savedPercent = Number((((originalBytes - bestBlob.size) / originalBytes) * 100).toFixed(1));

  return {
    result: {
      blob: bestBlob,
      dataUrl: bestDataUrl,
      width: bestWidth,
      height: bestHeight,
      sizeBytes: bestBlob.size,
      originalBytes,
      savedPercent,
    },
    iterations,
  };
}

export interface PassportPreset {
  id: string;
  name: string;
  country: string;
  widthMm: number;
  heightMm: number;
  pixelWidth: number;
  pixelHeight: number;
  dpi: number;
  description: string;
}

export const PASSPORT_PRESETS: PassportPreset[] = [
  {
    id: 'us-2x2',
    name: 'US Passport / Visa (2 x 2 inches)',
    country: 'United States',
    widthMm: 51,
    heightMm: 51,
    pixelWidth: 600,
    pixelHeight: 600,
    dpi: 300,
    description: 'Standard 2x2 in (51x51mm) photo for US Passports, Visas, and Green Cards.',
  },
  {
    id: 'uk-eu-35x45',
    name: 'UK & Schengen Visa (35 x 45 mm)',
    country: 'United Kingdom / European Union',
    widthMm: 35,
    heightMm: 45,
    pixelWidth: 413,
    pixelHeight: 531,
    dpi: 300,
    description: 'Standard 35x45mm biometric size for UK, Germany, France, Spain, and Schengen.',
  },
  {
    id: 'in-35x45',
    name: 'India Passport / OCI (35 x 45 mm)',
    country: 'India',
    widthMm: 35,
    heightMm: 45,
    pixelWidth: 413,
    pixelHeight: 531,
    dpi: 300,
    description: '35x45mm specification for Indian Passport Seva, OCI, and PAN cards.',
  },
  {
    id: 'au-ca-35x45',
    name: 'Canada & Australia (35 x 45 mm)',
    country: 'Canada / Australia',
    widthMm: 35,
    heightMm: 45,
    pixelWidth: 413,
    pixelHeight: 531,
    dpi: 300,
    description: 'Official 35x45mm dimensions for Canadian & Australian passports.',
  },
];

export async function renderPassportPhoto(
  file: File | Blob,
  preset: PassportPreset,
  crop: { x: number; y: number; zoom: number; rotation: number },
  backgroundColor: string = 'original' // 'original' | '#FFFFFF' | '#E0F2FE' | '#E5E7EB'
): Promise<ImageProcessingResult> {
  const originalBytes = file.size;
  const img = await loadImage(file);

  const canvas = document.createElement('canvas');
  canvas.width = preset.pixelWidth;
  canvas.height = preset.pixelHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas not supported.');

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  // Fill background if solid color specified
  if (backgroundColor !== 'original') {
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  ctx.save();
  // Move origin to canvas center
  ctx.translate(canvas.width / 2 + crop.x, canvas.height / 2 + crop.y);
  ctx.rotate((crop.rotation * Math.PI) / 180);
  ctx.scale(crop.zoom, crop.zoom);

  // Compute scale to cover target canvas initially
  const scale = Math.max(canvas.width / img.width, canvas.height / img.height);
  const drawW = img.width * scale;
  const drawH = img.height * scale;

  ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
  ctx.restore();

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) return reject(new Error('Passport render failed.'));
        const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
        resolve({
          blob,
          dataUrl,
          width: preset.pixelWidth,
          height: preset.pixelHeight,
          sizeBytes: blob.size,
          originalBytes,
          savedPercent: 0,
        });
      },
      'image/jpeg',
      0.95
    );
  });
}

/**
 * Creates a printable 4x6 inch photo sheet containing 6 or 8 passport photos
 */
export async function generatePrintablePassportSheet(
  singlePhotoDataUrl: string,
  preset: PassportPreset
): Promise<Blob> {
  const sheetCanvas = document.createElement('canvas');
  // 4x6 inches at 300 DPI = 1200 x 1800 px (or 1800 x 1200 landscape)
  sheetCanvas.width = 1800;
  sheetCanvas.height = 1200;
  const ctx = sheetCanvas.getContext('2d');
  if (!ctx) throw new Error('Cannot get sheet canvas context.');

  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, sheetCanvas.width, sheetCanvas.height);

  const img = await loadImage(singlePhotoDataUrl);

  // For 35x45mm (approx 413x531 px): layout 2 rows of 4 photos = 8 photos
  // For 2x2 in (600x600 px): layout 2 rows of 3 photos = 6 photos
  const isSquare = preset.pixelWidth === preset.pixelHeight;
  const cols = isSquare ? 3 : 4;
  const rows = 2;

  const photoW = preset.pixelWidth;
  const photoH = preset.pixelHeight;

  const totalGridW = cols * photoW;
  const totalGridH = rows * photoH;
  const gapX = Math.floor((sheetCanvas.width - totalGridW) / (cols + 1));
  const gapY = Math.floor((sheetCanvas.height - totalGridH) / (rows + 1));

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const posX = gapX + c * (photoW + gapX);
      const posY = gapY + r * (photoH + gapY);

      // Draw photo
      ctx.drawImage(img, posX, posY, photoW, photoH);

      // Draw subtle cut guideline border
      ctx.strokeStyle = '#D1D5DB';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.strokeRect(posX, posY, photoW, photoH);
      ctx.setLineDash([]);
    }
  }

  // Draw header note at top
  ctx.fillStyle = '#6B7280';
  ctx.font = '20px sans-serif';
  ctx.fillText(`QuickUtility — 4x6 inch Print Sheet (${preset.name}) @ 300 DPI`, gapX, 35);

  return new Promise((resolve, reject) => {
    sheetCanvas.toBlob(
      (blob) => {
        if (!blob) return reject(new Error('Failed to generate sheet'));
        resolve(blob);
      },
      'image/jpeg',
      0.95
    );
  });
}
