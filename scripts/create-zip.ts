import fs from 'fs';
import path from 'path';
import JSZip from 'jszip';

const rootDir = process.cwd();
const publicDir = path.join(rootDir, 'public');

if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

const zip = new JSZip();

function addFilesRecursively(dir: string, zipFolder: JSZip) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relName = entry.name;

    // Ignore heavy or auto-generated folders
    if (
      relName === 'node_modules' ||
      relName === 'dist' ||
      relName === '.git' ||
      relName === '.aistudio' ||
      relName === 'quickutility-source.zip'
    ) {
      continue;
    }

    if (entry.isDirectory()) {
      const subFolder = zipFolder.folder(relName);
      if (subFolder) {
        addFilesRecursively(fullPath, subFolder);
      }
    } else if (entry.isFile()) {
      const content = fs.readFileSync(fullPath);
      zipFolder.file(relName, content);
    }
  }
}

async function createProjectZip() {
  console.log('Packaging QuickUtility source files into ZIP archive...');
  addFilesRecursively(rootDir, zip);

  const outputPath = path.join(publicDir, 'quickutility-source.zip');
  const content = await zip.generateAsync({
    type: 'nodebuffer',
    compression: 'DEFLATE',
    compressionOptions: { level: 9 },
  });

  fs.writeFileSync(outputPath, content);
  console.log(`Successfully generated: ${outputPath} (${(content.length / 1024).toFixed(1)} KB)`);
}

createProjectZip().catch((err) => {
  console.error('Error creating ZIP:', err);
  process.exit(1);
});
