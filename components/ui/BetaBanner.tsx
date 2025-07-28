import React from 'react';

const messages: string[] = [
  'All Songs are Copyrighted by their respective owners.',
  'This site is in beta testing Please report any issues you find.',
  'New features & Android App coming soon!',
  'Contact support if you experience any problems.',
  'Request New Features on Request Page',
  'Want song removed? Contact Us',
  '+260 750 195 451 | +260 964 943 277'
];

const BetaBanner: React.FC = () => {
  const bannerText = messages.join('  ✨ ');
  return (
    <div className="fixed top-0 left-0 w-full z-[1100] bg-surface/70 backdrop-blur-xl border-b border-overlay/40 text-foreground py-2 overflow-hidden shadow-lg">
      <div className="whitespace-nowrap animate-marquee font-bold text-center text-lg">
        {bannerText}
      </div>
      <style jsx global>{`
        @keyframes marquee {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
        .animate-marquee {
          display: inline-block;
          min-width: 100vw;
          animation: marquee 60s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default BetaBanner;