import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { SearchModal } from './components/SearchModal';
import { HomePage } from './pages/HomePage';
import { AboutPage } from './pages/AboutPage';
import { PrivacyPage } from './pages/PrivacyPage';
import { TermsPage } from './pages/TermsPage';
import { ContactPage } from './pages/ContactPage';

// 15 Tool Pages
import { PdfToWordPage } from './pages/tools/PdfToWordPage';
import { WordToPdfPage } from './pages/tools/WordToPdfPage';
import { ImagesToPdfPage } from './pages/tools/ImagesToPdfPage';
import { PdfToImagesPage } from './pages/tools/PdfToImagesPage';
import { MergePdfPage } from './pages/tools/MergePdfPage';
import { SplitPdfPage } from './pages/tools/SplitPdfPage';
import { CompressPdfPage } from './pages/tools/CompressPdfPage';
import { ImageCompressorPage } from './pages/tools/ImageCompressorPage';
import { ImageResizerPage } from './pages/tools/ImageResizerPage';
import { ImageKbReducerPage } from './pages/tools/ImageKbReducerPage';
import { PassportPhotoPage } from './pages/tools/PassportPhotoPage';
import { AgeCalculatorPage } from './pages/tools/AgeCalculatorPage';
import { PercentageCalculatorPage } from './pages/tools/PercentageCalculatorPage';
import { ResumeBuilderPage } from './pages/tools/ResumeBuilderPage';
import { QrGeneratorPage } from './pages/tools/QrGeneratorPage';

import { TOOLS } from './data/tools';

export default function App() {
  const getInitialPath = (): string => {
    const hash = window.location.hash.replace(/^#/, '');
    return hash || '/';
  };

  const [currentPath, setCurrentPath] = useState<string>(getInitialPath);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);

  // Sync hash changes (Back / Forward buttons, direct links)
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace(/^#/, '');
      setCurrentPath(hash || '/');
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleNavigate = (path: string) => {
    window.location.hash = path;
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Dynamic SEO metadata update per tool
  useEffect(() => {
    const cleanPath = currentPath.split('?')[0];
    const tool = TOOLS.find((t) => t.path === cleanPath);

    if (tool) {
      document.title = `${tool.name} — QuickUtility`;
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) metaDesc.setAttribute('content', tool.shortDesc);
    } else if (cleanPath === '/about') {
      document.title = 'About QuickUtility — Free Client-Side Online Utilities';
    } else if (cleanPath === '/privacy') {
      document.title = 'Privacy Policy — QuickUtility Zero-Server-Upload Guarantee';
    } else if (cleanPath === '/terms') {
      document.title = 'Terms of Service — QuickUtility';
    } else if (cleanPath === '/contact') {
      document.title = 'Contact Support — QuickUtility';
    } else {
      document.title = 'QuickUtility — 15 Free Online PDF, Image & Daily Productivity Tools';
    }
  }, [currentPath]);

  // Route Resolver
  const renderCurrentRoute = () => {
    const cleanPath = currentPath.split('?')[0];

    switch (cleanPath) {
      case '/':
        return <HomePage onNavigate={handleNavigate} />;
      case '/about':
        return <AboutPage onNavigate={handleNavigate} />;
      case '/privacy':
        return <PrivacyPage />;
      case '/terms':
        return <TermsPage />;
      case '/contact':
        return <ContactPage />;

      // PDF Tools (1 - 7)
      case '/tool/pdf-to-word':
        return <PdfToWordPage onNavigate={handleNavigate} />;
      case '/tool/word-to-pdf':
        return <WordToPdfPage onNavigate={handleNavigate} />;
      case '/tool/images-to-pdf':
        return <ImagesToPdfPage onNavigate={handleNavigate} />;
      case '/tool/pdf-to-images':
        return <PdfToImagesPage onNavigate={handleNavigate} />;
      case '/tool/merge-pdf':
        return <MergePdfPage onNavigate={handleNavigate} />;
      case '/tool/split-pdf':
        return <SplitPdfPage onNavigate={handleNavigate} />;
      case '/tool/compress-pdf':
        return <CompressPdfPage onNavigate={handleNavigate} />;

      // Image Tools (8 - 11)
      case '/tool/image-compressor':
        return <ImageCompressorPage onNavigate={handleNavigate} />;
      case '/tool/image-resizer':
        return <ImageResizerPage onNavigate={handleNavigate} />;
      case '/tool/image-kb-reducer':
        return <ImageKbReducerPage onNavigate={handleNavigate} />;
      case '/tool/passport-photo':
        return <PassportPhotoPage onNavigate={handleNavigate} />;

      // Daily Tools (12 - 15)
      case '/tool/age-calculator':
        return <AgeCalculatorPage onNavigate={handleNavigate} />;
      case '/tool/percentage-calculator':
        return <PercentageCalculatorPage onNavigate={handleNavigate} />;
      case '/tool/resume-builder':
        return <ResumeBuilderPage onNavigate={handleNavigate} />;
      case '/tool/qr-generator':
        return <QrGeneratorPage onNavigate={handleNavigate} />;

      default:
        return <HomePage onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Navbar
        currentPath={currentPath}
        onNavigate={handleNavigate}
        onOpenSearch={() => setIsSearchOpen(true)}
      />

      <main className="flex-1">
        {renderCurrentRoute()}
      </main>

      <Footer onNavigate={handleNavigate} />

      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectTool={handleNavigate}
      />
    </div>
  );
}
