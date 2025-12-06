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

const iconVariants = [
  { name: "Person", component: IconVariant1Person, description: "Minimalist person silhouette - 'i' as a person" },
  { name: "Card", component: IconVariant2Card, description: "Business card with 'i' integrated" },
  { name: "Signal", component: IconVariant3Signal, description: "Tech connectivity with signal waves" },
  { name: "Layered", component: IconVariant4Layered, description: "Modern overlapping geometric shapes with depth" },
  { name: "Geometric", component: IconVariant5Geometric, description: "Clean, bold rounded geometric design" },
  { name: "Connected", component: IconVariant6Connected, description: "Communication icon with connection rings - inspired design" },
  { name: "NFC Card", component: IconVariant7NFCCard, description: "Business card with NFC contactless wave signals" },
];

export default function IconPreview() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white dark:from-gray-900 dark:to-gray-800">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Choose Your Favorite iTalkLink Icon
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            All 7 creative icon variations displayed below
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
              Person • Card • Signal • Layered • Geometric • Connected • NFC Card
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
