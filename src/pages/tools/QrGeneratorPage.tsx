import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { Download, QrCode, Wifi, User, Link, FileText, CheckCircle2, AlertCircle, Palette } from 'lucide-react';
import { ToolLayout } from '../../components/ToolLayout';
import { TOOLS } from '../../data/tools';

export const QrGeneratorPage: React.FC<{ onNavigate: (path: string) => void }> = ({ onNavigate }) => {
  const tool = TOOLS.find((t) => t.id === 'qr-generator')!;

  const [contentType, setContentType] = useState<'url' | 'text' | 'wifi' | 'vcard'>('url');

  // Input states
  const [urlInput, setUrlInput] = useState<string>('https://quickutility.example.com');
  const [textInput, setTextInput] = useState<string>('Hello from QuickUtility!');

  // WiFi state
  const [wifiSsid, setWifiSsid] = useState<string>('HomeNetwork_5G');
  const [wifiPassword, setWifiPassword] = useState<string>('SecurePassword123');
  const [wifiEncryption, setWifiEncryption] = useState<'WPA' | 'WEP' | 'nopass'>('WPA');
  const [wifiHidden, setWifiHidden] = useState<boolean>(false);

  // vCard state
  const [vcardName, setVcardName] = useState<string>('Jane Doe');
  const [vcardOrg, setVcardOrg] = useState<string>('Acme Corporation');
  const [vcardEmail, setVcardEmail] = useState<string>('jane.doe@example.com');
  const [vcardPhone, setVcardPhone] = useState<string>('+1 555-0199');

  // Appearance
  const [fgColor, setFgColor] = useState<string>('#0F172A'); // Deep Slate
  const [bgColor, setBgColor] = useState<string>('#FFFFFF');
  const [errorCorrectionLevel, setErrorCorrectionLevel] = useState<'L' | 'M' | 'Q' | 'H'>('M');
  const [qrSize, setQrSize] = useState<number>(300);

  // Output
  const [pngDataUrl, setPngDataUrl] = useState<string>('');
  const [svgString, setSvgString] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Build payload
  const getPayload = (): string => {
    switch (contentType) {
      case 'url':
        return urlInput.trim() || 'https://';
      case 'text':
        return textInput || '';
      case 'wifi':
        return `WIFI:T:${wifiEncryption};S:${wifiSsid};P:${wifiPassword};H:${wifiHidden ? 'true' : 'false'};;`;
      case 'vcard':
        return `BEGIN:VCARD
VERSION:3.0
FN:${vcardName}
ORG:${vcardOrg}
EMAIL:${vcardEmail}
TEL:${vcardPhone}
END:VCARD`;
      default:
        return '';
    }
  };

  const generateCode = async () => {
    const payload = getPayload();
    if (!payload.trim()) return;

    try {
      // 1. Generate PNG data URL
      const pngUrl = await QRCode.toDataURL(payload, {
        errorCorrectionLevel,
        width: qrSize,
        margin: 2,
        color: {
          dark: fgColor,
          light: bgColor,
        },
      });
      setPngDataUrl(pngUrl);

      // 2. Generate SVG vector
      const svg = await QRCode.toString(payload, {
        type: 'svg',
        errorCorrectionLevel,
        width: qrSize,
        margin: 2,
        color: {
          dark: fgColor,
          light: bgColor,
        },
      });
      setSvgString(svg);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Failed to render QR Code.');
    }
  };

  useEffect(() => {
    generateCode();
  }, [
    contentType,
    urlInput,
    textInput,
    wifiSsid,
    wifiPassword,
    wifiEncryption,
    wifiHidden,
    vcardName,
    vcardOrg,
    vcardEmail,
    vcardPhone,
    fgColor,
    bgColor,
    errorCorrectionLevel,
    qrSize,
  ]);

  const downloadSvg = () => {
    const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `qrcode_${contentType}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <ToolLayout
      tool={tool}
      onNavigate={onNavigate}
      instructions={[
        'Choose your QR content type (Website Link, Plain Text, WiFi Network, or Contact vCard).',
        'Enter the target details in the fields below.',
        'Customize foreground & background colors, size, and error correction level.',
        'Download your code as a high-resolution PNG or a scalable vector SVG.',
      ]}
    >
      <div className="space-y-6">
        {/* Content Type Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
          <button
            type="button"
            onClick={() => setContentType('url')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
              contentType === 'url' ? 'bg-blue-600 text-white shadow-xs' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            <Link className="w-3.5 h-3.5" />
            <span>URL / Website</span>
          </button>

          <button
            type="button"
            onClick={() => setContentType('text')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
              contentType === 'text' ? 'bg-blue-600 text-white shadow-xs' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Plain Text</span>
          </button>

          <button
            type="button"
            onClick={() => setContentType('wifi')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
              contentType === 'wifi' ? 'bg-blue-600 text-white shadow-xs' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            <Wifi className="w-3.5 h-3.5" />
            <span>WiFi Network</span>
          </button>

          <button
            type="button"
            onClick={() => setContentType('vcard')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
              contentType === 'vcard' ? 'bg-blue-600 text-white shadow-xs' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Contact vCard</span>
          </button>
        </div>

        {/* Editor & Preview Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Left: Input Form */}
          <div className="md:col-span-7 space-y-4">
            {contentType === 'url' && (
              <div className="space-y-1">
                <label htmlFor="website-url-input" className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Target Website URL:
                </label>
                <input
                  id="website-url-input"
                  type="url"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="https://example.com"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}

            {contentType === 'text' && (
              <div className="space-y-1">
                <label htmlFor="plain-text-input" className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Plain Text Content:
                </label>
                <textarea
                  id="plain-text-input"
                  rows={4}
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder="Enter notes, serial numbers, or message..."
                  className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}

            {contentType === 'wifi' && (
              <div className="space-y-3 p-4 bg-slate-50 border border-slate-200 rounded-xl">
                <div>
                  <label htmlFor="wifi-ssid-input" className="block text-xs font-semibold text-slate-700 mb-1">Network Name (SSID):</label>
                  <input
                    id="wifi-ssid-input"
                    type="text"
                    value={wifiSsid}
                    onChange={(e) => setWifiSsid(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-bold"
                  />
                </div>
                <div>
                  <label htmlFor="wifi-password-input" className="block text-xs font-semibold text-slate-700 mb-1">Password:</label>
                  <input
                    id="wifi-password-input"
                    type="text"
                    value={wifiPassword}
                    onChange={(e) => setWifiPassword(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-mono"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <label htmlFor="wifi-encryption-select" className="block font-semibold text-slate-700 mb-1">Encryption:</label>
                    <select
                      id="wifi-encryption-select"
                      value={wifiEncryption}
                      onChange={(e) => setWifiEncryption(e.target.value as any)}
                      className="w-full p-2 bg-white border border-slate-300 rounded-lg"
                    >
                      <option value="WPA">WPA / WPA2 (Standard)</option>
                      <option value="WEP">WEP</option>
                      <option value="nopass">None (Open)</option>
                    </select>
                  </div>
                  <div className="flex items-center pt-5">
                    <label className="flex items-center space-x-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={wifiHidden}
                        onChange={(e) => setWifiHidden(e.target.checked)}
                        className="accent-blue-600 rounded"
                      />
                      <span className="text-xs text-slate-700 font-semibold">Hidden SSID</span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {contentType === 'vcard' && (
              <div className="space-y-2.5 p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs">
                <div>
                  <label htmlFor="vcard-name-input" className="block font-semibold text-slate-700 mb-1">Contact Name:</label>
                  <input
                    id="vcard-name-input"
                    type="text"
                    value={vcardName}
                    onChange={(e) => setVcardName(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg font-bold"
                  />
                </div>
                <div>
                  <label htmlFor="vcard-org-input" className="block font-semibold text-slate-700 mb-1">Company / Organization:</label>
                  <input
                    id="vcard-org-input"
                    type="text"
                    value={vcardOrg}
                    onChange={(e) => setVcardOrg(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label htmlFor="vcard-phone-input" className="block font-semibold text-slate-700 mb-1">Phone Number:</label>
                    <input
                      id="vcard-phone-input"
                      type="text"
                      value={vcardPhone}
                      onChange={(e) => setVcardPhone(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label htmlFor="vcard-email-input" className="block font-semibold text-slate-700 mb-1">Email Address:</label>
                    <input
                      id="vcard-email-input"
                      type="email"
                      value={vcardEmail}
                      onChange={(e) => setVcardEmail(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Styling & Color Customization */}
            <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-3">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center space-x-1.5">
                <Palette className="w-3.5 h-3.5 text-blue-600" />
                <span>Color & Quality Settings</span>
              </span>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <label htmlFor="qr-fg-color" className="block text-slate-600 font-semibold mb-1">QR Color</label>
                  <input
                    id="qr-fg-color"
                    type="color"
                    value={fgColor}
                    onChange={(e) => setFgColor(e.target.value)}
                    className="w-full h-8 rounded border border-slate-300 p-0.5 cursor-pointer"
                  />
                </div>
                <div>
                  <label htmlFor="qr-bg-color" className="block text-slate-600 font-semibold mb-1">Background</label>
                  <input
                    id="qr-bg-color"
                    type="color"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="w-full h-8 rounded border border-slate-300 p-0.5 cursor-pointer"
                  />
                </div>
                <div>
                  <label htmlFor="qr-error-level" className="block text-slate-600 font-semibold mb-1">Error Level</label>
                  <select
                    id="qr-error-level"
                    value={errorCorrectionLevel}
                    onChange={(e) => setErrorCorrectionLevel(e.target.value as any)}
                    className="w-full h-8 px-2 bg-slate-50 border border-slate-300 rounded-lg"
                  >
                    <option value="L">Low (7%)</option>
                    <option value="M">Medium (15%)</option>
                    <option value="Q">Quartile (25%)</option>
                    <option value="H">High (30%)</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="qr-resolution-select" className="block text-slate-600 font-semibold mb-1">Resolution</label>
                  <select
                    id="qr-resolution-select"
                    value={qrSize}
                    onChange={(e) => setQrSize(parseInt(e.target.value, 10))}
                    className="w-full h-8 px-2 bg-slate-50 border border-slate-300 rounded-lg"
                  >
                    <option value="200">200 px</option>
                    <option value="300">300 px (Std)</option>
                    <option value="600">600 px (HD)</option>
                    <option value="1200">1200 px (Print)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Real-Time Preview and Downloads */}
          <div className="md:col-span-5 bg-slate-50 border border-slate-200 rounded-2xl p-6 flex flex-col items-center justify-center space-y-4">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Live QR Preview
            </span>

            {pngDataUrl ? (
              <div
                className="p-4 rounded-xl border border-slate-200 shadow-sm transition-transform hover:scale-[1.02]"
                style={{ backgroundColor: bgColor }}
              >
                <img
                  src={pngDataUrl}
                  alt="Generated QR Code"
                  className="w-56 h-56 object-contain"
                />
              </div>
            ) : (
              <div className="w-56 h-56 rounded-xl bg-slate-200 flex items-center justify-center text-slate-400 text-xs">
                Generating Code...
              </div>
            )}

            <div className="flex flex-col w-full space-y-2 pt-2">
              <a
                href={pngDataUrl}
                download={`qrcode_${contentType}.png`}
                className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center justify-center space-x-2 transition-all cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Download PNG ({qrSize} × {qrSize} px)</span>
              </a>

              <button
                type="button"
                onClick={downloadSvg}
                className="w-full py-2.5 px-4 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-bold text-xs rounded-xl shadow-xs flex items-center justify-center space-x-2 transition-all cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Download Scalable SVG (Vector)</span>
              </button>
            </div>
          </div>
        </div>

        {errorMessage && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}
      </div>
    </ToolLayout>
  );
};
