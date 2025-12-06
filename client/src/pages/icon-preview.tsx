import { Navigation } from "@/components/navigation";

// 1. Ultra Minimalist - Clean Apple/Airbnb style
const LogoMinimalist = () => (
  <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
    <text x="40" y="55" fontFamily="system-ui, -apple-system, sans-serif" fontSize="42" fontWeight="700" fill="url(#grad1)" textAnchor="middle" letterSpacing="-2">iTL</text>
    <defs>
      <linearGradient id="grad1" x1="0" y1="0" x2="80" y2="80" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#16a34a" />
        <stop offset="100%" stopColor="#15803d" />
      </linearGradient>
    </defs>
  </svg>
);

// 2. Dynamic Swoosh - Nike energy with flowing elements
const LogoDynamic = () => (
  <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M15 30 Q20 25, 25 30 L25 50 Q25 55, 20 55 Q15 55, 15 50 Z" fill="url(#grad2)" />
    <path d="M35 20 L45 20 L45 60 L35 60 Z" fill="url(#grad2)" transform="skewX(-8)" />
    <path d="M52 30 L52 60 L62 60 Q67 60, 67 55 L67 30 Z" fill="url(#grad2)" />
    <path d="M5 65 Q40 55, 75 65" stroke="url(#grad2)" strokeWidth="3" fill="none" strokeLinecap="round"/>
    <defs>
      <linearGradient id="grad2" x1="0" y1="0" x2="80" y2="80" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#16a34a" />
        <stop offset="100%" stopColor="#15803d" />
      </linearGradient>
    </defs>
  </svg>
);

// 3. Geometric Bold - Sharp Adidas/BMW precision
const LogoGeometric = () => (
  <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="15" y="25" width="6" height="30" fill="#16a34a" />
    <circle cx="18" cy="20" r="3" fill="#16a34a" />
    <polygon points="30,25 45,25 42,55 33,55" fill="url(#grad3)" />
    <rect x="50" y="25" width="15" height="6" fill="#16a34a" />
    <rect x="57" y="25" width="6" height="30" fill="url(#grad3)" />
    <rect x="50" y="49" width="15" height="6" fill="#15803d" />
    <defs>
      <linearGradient id="grad3" x1="0" y1="0" x2="80" y2="80" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#16a34a" />
        <stop offset="100%" stopColor="#15803d" />
      </linearGradient>
    </defs>
  </svg>
);

// 4. Elegant Monogram - Chanel/LV sophistication with overlapping
const LogoMonogram = () => (
  <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="40" cy="40" r="32" stroke="url(#grad4)" strokeWidth="2" fill="none" opacity="0.3"/>
    <path d="M28 28 L28 52" stroke="url(#grad4)" strokeWidth="5" strokeLinecap="round"/>
    <circle cx="28" cy="23" r="2.5" fill="#16a34a"/>
    <path d="M38 28 L50 28 L44 52 L32 52 Z" fill="url(#grad4)" opacity="0.9"/>
    <path d="M52 28 L52 48 Q52 52, 48 52 L48 28 L60 28 L60 52" stroke="url(#grad4)" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    <defs>
      <linearGradient id="grad4" x1="0" y1="0" x2="80" y2="80" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#16a34a" />
        <stop offset="100%" stopColor="#15803d" />
      </linearGradient>
    </defs>
  </svg>
);

// 5. Tech Modern - Sleek Stripe/Spotify digital aesthetic
const LogoTechModern = () => (
  <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="20" y="28" width="4" height="24" rx="2" fill="url(#grad5)"/>
    <circle cx="22" cy="23" r="2" fill="#22c55e"/>
    <rect x="28" y="28" width="16" height="4" rx="2" fill="url(#grad5)"/>
    <rect x="36" y="28" width="4" height="24" rx="2" fill="url(#grad5)"/>
    <rect x="28" y="48" width="16" height="4" rx="2" fill="url(#grad5)"/>
    <rect x="48" y="28" width="4" height="18" rx="2" fill="url(#grad5)"/>
    <rect x="48" y="48" width="12" height="4" rx="2" fill="url(#grad5)"/>
    <rect x="56" y="38" width="4" height="14" rx="2" fill="url(#grad5)"/>
    <circle cx="50" cy="23" r="1.5" fill="#22c55e"/>
    <circle cx="58" cy="33" r="1.5" fill="#22c55e"/>
    <defs>
      <linearGradient id="grad5" x1="0" y1="0" x2="80" y2="80" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#16a34a" />
        <stop offset="100%" stopColor="#15803d" />
      </linearGradient>
    </defs>
  </svg>
);

const logoVariants = [
  { 
    name: "Minimalist", 
    component: LogoMinimalist, 
    description: "Ultra-clean modern typography",
    inspiration: "Apple • Airbnb • Google"
  },
  { 
    name: "Dynamic", 
    component: LogoDynamic, 
    description: "Energetic flowing design",
    inspiration: "Nike • Pepsi • Adidas"
  },
  { 
    name: "Geometric", 
    component: LogoGeometric, 
    description: "Bold precision angles",
    inspiration: "BMW • Audi • Microsoft"
  },
  { 
    name: "Monogram", 
    component: LogoMonogram, 
    description: "Elegant sophisticated overlap",
    inspiration: "Chanel • Louis Vuitton • Gucci"
  },
  { 
    name: "Tech Modern", 
    component: LogoTechModern, 
    description: "Sleek digital aesthetic",
    inspiration: "Stripe • Spotify • Slack"
  },
];

export default function IconPreview() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50 dark:from-gray-900 dark:to-gray-800">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <div className="inline-block mb-4">
            <span className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-4 py-2 rounded-full text-sm font-semibold">
              Premium Brand Identity
            </span>
          </div>
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">
            iTalkLink Logo Collection
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            5 world-class logo designs inspired by top international brands
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
          {logoVariants.map((variant, index) => {
            const LogoComponent = variant.component;
            return (
              <div 
                key={index} 
                className="group relative flex flex-col items-center p-8 bg-white dark:bg-gray-800 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 border-2 border-transparent hover:border-green-400"
              >
                <div className="absolute top-4 right-4 bg-green-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                  #{index + 1}
                </div>
                
                <div className="w-40 h-40 bg-gradient-to-br from-gray-50 to-white dark:from-gray-700 dark:to-gray-800 rounded-2xl flex items-center justify-center shadow-inner mb-6 border border-gray-200 dark:border-gray-600">
                  <LogoComponent />
                </div>
                
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {variant.name}
                </h3>
                
                <p className="text-sm text-gray-600 dark:text-gray-400 text-center mb-3">
                  {variant.description}
                </p>
                
                <div className="text-xs text-green-600 dark:text-green-400 text-center font-medium">
                  {variant.inspiration}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-16">
          <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-2xl p-8 shadow-2xl max-w-3xl mx-auto">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-white mb-4">
                Which logo captures your vision?
              </h2>
              <p className="text-lg text-green-100 mb-6">
                Choose the design that best represents iTalkLink's international brand presence
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                {logoVariants.map((variant, index) => (
                  <span key={index} className="bg-white/20 text-white px-4 py-2 rounded-full text-sm font-semibold">
                    {index + 1}. {variant.name}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Each logo uses iTalkLink's signature green gradient and is designed for scalability across all platforms
          </p>
        </div>
      </div>
    </div>
  );
}
