import React from 'react';
import { Info } from 'lucide-react';

interface AdSenseSlotProps {
  slotId: 'home-mid' | 'tool-bottom' | 'footer-top';
  className?: string;
  format?: 'horizontal' | 'rectangle';
}

/**
 * AdSense-Ready Container (Placeholder Only).
 * 
 * Strict Compliance:
 * - Empty placeholder container formatted for Google AdSense responsive units.
 * - Kept in disabled state until the website owner pastes official approved AdSense client & slot IDs.
 * - Positioned safely away from critical Upload, Process, or Download buttons to prevent accidental clicks.
 * - Discloses policy and approval requirements for the site owner.
 */
export const AdSenseSlot: React.FC<AdSenseSlotProps> = ({ slotId, className = '', format = 'horizontal' }) => {
  // Website owners can insert their official Google AdSense client ID (e.g., 'ca-pub-XXXXXXXXXXXXXXXX')
  // and ad slot ID here after receiving account approval from Google.
  const ADSENSE_ENABLED = false;
  const ADSENSE_CLIENT_ID = ''; // Leave empty until official approval
  const ADSENSE_SLOT_ID = '';

  if (ADSENSE_ENABLED && ADSENSE_CLIENT_ID && ADSENSE_SLOT_ID) {
    return (
      <div className={`my-8 flex justify-center overflow-hidden ${className}`} data-slot-id={slotId}>
        <ins
          className="adsbygoogle"
          style={{ display: 'block', textAlign: 'center' }}
          data-ad-layout="in-article"
          data-ad-format={format === 'horizontal' ? 'fluid' : 'auto'}
          data-ad-client={ADSENSE_CLIENT_ID}
          data-ad-slot={ADSENSE_SLOT_ID}
        />
      </div>
    );
  }

  // Responsive AdSense container placeholder for site owner
  return (
    <div
      className={`my-8 p-3 rounded-xl border border-dashed border-slate-200 bg-slate-50/70 text-slate-400 text-xs text-center flex flex-col items-center justify-center space-y-1 ${
        format === 'horizontal' ? 'min-h-[90px] w-full max-w-4xl mx-auto' : 'min-h-[250px] w-full max-w-sm mx-auto'
      } ${className}`}
      aria-label="Advertisement Container Slot"
    >
      <div className="flex items-center space-x-1.5 text-slate-400 font-medium text-[11px]">
        <Info className="w-3.5 h-3.5" />
        <span>AdSense Container Placeholder ({slotId})</span>
      </div>
      <p className="text-[11px] text-slate-400 max-w-md">
        Reserved for Google AdSense banner. Remains disabled until an official publisher ID and ad approval are configured.
      </p>
    </div>
  );
};
