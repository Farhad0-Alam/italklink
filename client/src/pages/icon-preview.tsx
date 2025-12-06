import { Navigation } from "@/components/navigation";

const IconVariant1Person = () => (
  <svg width="64" height="64" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="16" cy="8" r="4" fill="url(#gradient1)" />
    <rect x="12" y="14" width="8" height="14" rx="2" fill="url(#gradient1)" />
    <defs>
      <linearGradient id="gradient1" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
        <stop stopColor="#16a34a" />
        <stop offset="1" stopColor="#15803d" />
      </linearGradient>
    </defs>
  </svg>
);

const IconVariant2Card = () => (
  <svg width="64" height="64" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="6" width="28" height="20" rx="3" stroke="url(#gradient2)" strokeWidth="2.5" fill="none" />
    <circle cx="10" cy="16" r="3" fill="url(#gradient2)" />
    <rect x="16" y="12" width="2.5" height="8" rx="1.25" fill="url(#gradient2)" />
    <circle cx="17.25" cy="10" r="1.5" fill="url(#gradient2)" />
    <defs>
      <linearGradient id="gradient2" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
        <stop stopColor="#16a34a" />
        <stop offset="1" stopColor="#15803d" />
      </linearGradient>
    </defs>
  </svg>
);

const IconVariant3Signal = () => (
  <svg width="64" height="64" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="14" y="12" width="4" height="16" rx="2" fill="url(#gradient3)" />
    <circle cx="16" cy="6" r="3" fill="url(#gradient3)" />
    <circle cx="8" cy="16" r="2" fill="url(#gradient3)" opacity="0.6" />
    <circle cx="24" cy="16" r="2" fill="url(#gradient3)" opacity="0.6" />
    <circle cx="5" cy="24" r="1.5" fill="url(#gradient3)" opacity="0.4" />
    <circle cx="27" cy="24" r="1.5" fill="url(#gradient3)" opacity="0.4" />
    <line x1="16" y1="16" x2="8" y2="16" stroke="url(#gradient3)" strokeWidth="1.5" opacity="0.4" />
    <line x1="16" y1="16" x2="24" y2="16" stroke="url(#gradient3)" strokeWidth="1.5" opacity="0.4" />
    <defs>
      <linearGradient id="gradient3" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
        <stop stopColor="#16a34a" />
        <stop offset="1" stopColor="#15803d" />
      </linearGradient>
    </defs>
  </svg>
);

const IconVariant4Layered = () => (
  <svg width="64" height="64" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="16" cy="6" r="3.5" fill="#16a34a" />
    <rect x="12" y="12" width="8" height="16" rx="2" fill="#16a34a" opacity="0.7" />
    <rect x="10" y="14" width="12" height="14" rx="2" fill="#15803d" opacity="0.5" />
    <rect x="13" y="13" width="6" height="15" rx="1.5" fill="url(#gradient4)" />
    <circle cx="16" cy="7" r="2.5" fill="#22c55e" />
    <defs>
      <linearGradient id="gradient4" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
        <stop stopColor="#16a34a" />
        <stop offset="1" stopColor="#15803d" />
      </linearGradient>
    </defs>
  </svg>
);

const IconVariant5Geometric = () => (
  <svg width="64" height="64" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="11" y="11" width="10" height="18" rx="4" fill="url(#gradient5)" />
    <circle cx="16" cy="5" r="4" fill="url(#gradient5)" />
    <defs>
      <linearGradient id="gradient5" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
        <stop stopColor="#16a34a" />
        <stop offset="1" stopColor="#15803d" />
      </linearGradient>
    </defs>
  </svg>
);

const IconVariant6Connected = () => (
  <svg width="64" height="64" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Outer connection ring */}
    <circle cx="16" cy="16" r="14" stroke="url(#gradient6)" strokeWidth="1.5" opacity="0.3" fill="none" />
    <circle cx="16" cy="16" r="11" stroke="url(#gradient6)" strokeWidth="1.5" opacity="0.5" fill="none" />
    
    {/* Central 'i' letter */}
    <circle cx="16" cy="7" r="3" fill="url(#gradient6)" />
    <rect x="13.5" y="12" width="5" height="14" rx="2.5" fill="url(#gradient6)" />
    
    {/* Connection points/nodes around the i */}
    <circle cx="8" cy="16" r="1.5" fill="#16a34a" opacity="0.7" />
    <circle cx="24" cy="16" r="1.5" fill="#16a34a" opacity="0.7" />
    <circle cx="16" cy="8" r="1" fill="#22c55e" opacity="0.9" />
    
    <defs>
      <linearGradient id="gradient6" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
        <stop stopColor="#16a34a" />
        <stop offset="1" stopColor="#15803d" />
      </linearGradient>
    </defs>
  </svg>
);

const IconVariant7NFCCard = () => (
  <svg width="64" height="64" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Business card rectangle */}
    <rect x="3" y="8" width="26" height="16" rx="2" fill="url(#gradient7)" />
    
    {/* 'i' on the card */}
    <circle cx="10" cy="12" r="1.5" fill="white" />
    <rect x="9" y="14" width="2" height="6" rx="1" fill="white" />
    
    {/* NFC waves emanating from card */}
    <path d="M 20 12 Q 22 14 20 16" stroke="#22c55e" strokeWidth="1.5" fill="none" opacity="0.8" />
    <path d="M 22 10 Q 25 14 22 18" stroke="#22c55e" strokeWidth="1.5" fill="none" opacity="0.6" />
    <path d="M 24 8 Q 28 14 24 20" stroke="#22c55e" strokeWidth="1.5" fill="none" opacity="0.4" />
    
    {/* NFC icon on card */}
    <circle cx="20" cy="16" r="1" fill="white" opacity="0.9" />
    
    <defs>
      <linearGradient id="gradient7" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
        <stop stopColor="#16a34a" />
        <stop offset="1" stopColor="#15803d" />
      </linearGradient>
    </defs>
  </svg>
);

// Waveform i - Inspired by the attached equalizer design with "i" dot
const IconVariant8Waveform = () => (
  <svg width="64" height="64" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Dark green rounded background */}
    <rect x="1" y="1" width="30" height="30" rx="6" fill="#06301A" />
    
    {/* The "i" dot */}
    <circle cx="13.5" cy="6" r="2.2" fill="#bef264" />
    
    {/* Waveform bars - varying heights like equalizer */}
    {/* Bar 1 - short left */}
    <rect x="5" y="15" width="3" height="7" rx="1.5" fill="#bef264" />
    {/* Bar 2 - tall center-left (the "i" body) */}
    <rect x="11" y="9" width="5" height="17" rx="2.5" fill="#bef264" />
    {/* Bar 3 - medium center-right */}
    <rect x="18" y="12" width="4" height="11" rx="2" fill="#bef264" />
    {/* Bar 4 - short right */}
    <rect x="24" y="15" width="3" height="7" rx="1.5" fill="#bef264" />
  </svg>
);

// Audio Pulse - Sound wave with rhythmic pattern
const IconVariant9AudioPulse = () => (
  <svg width="64" height="64" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Dark green rounded background */}
    <rect x="1" y="1" width="30" height="30" rx="6" fill="#06301A" />
    
    {/* The "i" dot */}
    <circle cx="16" cy="5" r="2" fill="#bef264" />
    
    {/* 5 equalizer bars with different heights */}
    <rect x="4" y="14" width="3" height="8" rx="1.5" fill="#bef264" />
    <rect x="9" y="11" width="3" height="14" rx="1.5" fill="#bef264" />
    <rect x="14.5" y="9" width="3" height="18" rx="1.5" fill="#bef264" />
    <rect x="20" y="11" width="3" height="14" rx="1.5" fill="#bef264" />
    <rect x="25" y="14" width="3" height="8" rx="1.5" fill="#bef264" />
  </svg>
);

// Voice Signal - Similar to attached design with 4 bars
const IconVariant10VoiceSignal = () => (
  <svg width="64" height="64" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Dark green rounded background */}
    <rect x="1" y="1" width="30" height="30" rx="6" fill="#06301A" />
    
    {/* The "i" dot above the tall bar */}
    <circle cx="12" cy="5.5" r="2.2" fill="#bef264" />
    
    {/* 4 waveform bars exactly like the attached image */}
    {/* Bar 1 - short left */}
    <rect x="4" y="14" width="3.5" height="9" rx="1.75" fill="#bef264" />
    {/* Bar 2 - tall (main i body) */}
    <rect x="10" y="9" width="4" height="18" rx="2" fill="#bef264" />
    {/* Bar 3 - medium-tall */}
    <rect x="16.5" y="11" width="4" height="14" rx="2" fill="#bef264" />
    {/* Bar 4 - short right */}
    <rect x="23" y="14" width="3.5" height="9" rx="1.75" fill="#bef264" />
  </svg>
);

// OFFICIAL iTalkLink Logo - The chosen design (Green background, White design)
const OfficialITalkLinkLogo = () => (
  <svg viewBox="0 0 1000 1000" className="w-full h-full">
    <path fill="#22c55e" d="M817.9,999.9H182.1C81.8,999.9-0.2,917.8-0.2,817.5v-635C-0.2,82.2,81.8,0.1,182.1,0.1h635.7c100.3,0,182.4,82.1,182.4,182.4v635C1000.2,917.8,918.2,999.9,817.9,999.9z"/>
    <path fill="none" stroke="#FFFFFF" strokeWidth="70" strokeMiterlimit="10" d="M315,857c-116.4-65.3-195-189.8-195-332.7C120,313.7,290.7,143,501.3,143c210.6,0,381.2,170.7,381.2,381.2c0,82.3-26.7,166.9-77.1,232.3c-47.2,61.2-124.5,112.4-204.8,97.6c-27.8-5.1-55-17.9-74.7-38.6c-17.8-18.8-26.3-42.5-27.2-68V437"/>
    <ellipse cx="498.5" cy="357.5" rx="44.5" ry="44.5" fill="#FFFFFF"/>
  </svg>
);

const iconVariants = [
  { name: "Person", component: IconVariant1Person, description: "Minimalist person silhouette - 'i' as a person" },
  { name: "Card", component: IconVariant2Card, description: "Business card with 'i' integrated" },
  { name: "Signal", component: IconVariant3Signal, description: "Tech connectivity with signal waves" },
  { name: "Layered", component: IconVariant4Layered, description: "Modern overlapping geometric shapes with depth" },
  { name: "Geometric", component: IconVariant5Geometric, description: "Clean, bold rounded geometric design" },
  { name: "Connected", component: IconVariant6Connected, description: "Communication icon with connection rings - inspired design" },
  { name: "NFC Card", component: IconVariant7NFCCard, description: "Business card with NFC contactless wave signals" },
  { name: "Waveform i", component: IconVariant8Waveform, description: "Equalizer bars with 'i' dot - inspired by your design" },
  { name: "Audio Pulse", component: IconVariant9AudioPulse, description: "5 symmetric audio bars with centered 'i' dot" },
  { name: "Voice Signal", component: IconVariant10VoiceSignal, description: "4-bar waveform exactly like your attached design" },
];

export default function IconPreview() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white dark:from-gray-900 dark:to-gray-800">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 py-16">
        {/* Official Chosen Logo */}
        <div className="text-center mb-16">
          <div className="inline-block p-8 bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border-4 border-green-500 mb-6">
            <div className="w-48 h-48 mx-auto">
              <OfficialITalkLinkLogo />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Official iTalkLink Logo
          </h1>
          <p className="text-lg text-green-600 dark:text-green-400 font-semibold">
            The chosen design - now used across the platform
          </p>
        </div>

        <div className="text-center mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Other Icon Variations (Archive)
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            All 10 creative icon variations displayed below
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {iconVariants.map((variant, index) => {
            const IconComponent = variant.component;
            return (
              <div 
                key={index} 
                className="flex flex-col items-center p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-xl hover:shadow-2xl transition-all hover:scale-105"
              >
                <div className="w-32 h-32 bg-white rounded-2xl flex items-center justify-center shadow-lg mb-6 border-4 border-green-100">
                  <IconComponent />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {index + 1}. {variant.name}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                  {variant.description}
                </p>
              </div>
            );
          })}
        </div>

        <div className="mt-16 text-center">
          <div className="bg-green-100 dark:bg-green-900 rounded-xl p-6 max-w-2xl mx-auto">
            <p className="text-lg text-gray-800 dark:text-gray-200 font-semibold">
              Tell me which one you like best:
            </p>
            <p className="text-md text-gray-600 dark:text-gray-300 mt-2">
              Person • Card • Signal • Layered • Geometric • Connected • NFC Card • Waveform i • Audio Pulse • Voice Signal
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
