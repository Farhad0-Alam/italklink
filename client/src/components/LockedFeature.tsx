import { Lock, Crown, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLocation } from 'wouter';

interface LockedFeatureProps {
  featureName: string;
  requiredPlan?: string;
  icon?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
  showOverlay?: boolean;
}

export function LockedFeature({
  featureName,
  requiredPlan = 'Pro Plan',
  icon = <Crown className="h-6 w-6" />,
  children,
  className = '',
  showOverlay = true,
}: LockedFeatureProps) {
  const [, setLocation] = useLocation();

  if (!showOverlay) {
    return <>{children}</>;
  }

  return (
    <div className={`relative group ${className}`}>
      {/* Blurred content */}
      <div className="blur-sm pointer-events-none opacity-60">
        {children}
      </div>

      {/* Lock overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-transparent to-purple-500/10 backdrop-blur-[2px] rounded-lg flex items-center justify-center">
        <div className="text-center">
          <div className="relative inline-block">
            {/* Animated lock icon */}
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-purple-500 rounded-full opacity-20 animate-pulse blur-xl" />
            <div className="relative bg-white dark:bg-slate-900 rounded-full p-3 shadow-lg transform transition-transform group-hover:scale-110">
              <Lock className="h-6 w-6 text-orange-500" />
            </div>
          </div>

          <h3 className="mt-4 font-bold text-gray-900 dark:text-white text-sm">
            {featureName}
          </h3>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 mb-3">
            Upgrade to unlock
          </p>

          {/* Upgrade button */}
          <Button
            onClick={() => setLocation('/pricing')}
            className="bg-gradient-to-r from-orange-500 to-purple-600 hover:from-orange-600 hover:to-purple-700 text-white font-semibold py-2 px-4 rounded-lg shadow-lg hover:shadow-xl transform transition-all duration-200 hover:scale-105 flex items-center justify-center gap-2 mx-auto"
            data-testid="button-upgrade-plan"
          >
            <Zap className="h-4 w-4" />
            Upgrade Now
          </Button>

          {requiredPlan && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Available in {requiredPlan}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Premium Feature Badge - Used to show locked features in dashboards
 */
export function PremiumBadge({ planRequired = 'Pro' }: { planRequired?: string }) {
  return (
    <div className="inline-flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-orange-50 to-purple-50 dark:from-orange-950 dark:to-purple-950 border border-orange-200 dark:border-orange-700 rounded-full">
      <Lock className="h-3 w-3 text-orange-600 dark:text-orange-400" />
      <span className="text-xs font-semibold text-orange-700 dark:text-orange-300">
        {planRequired}
      </span>
    </div>
  );
}

/**
 * Inline feature lock - minimal lock icon that appears inline
 */
export function InlineFeatureLock() {
  return (
    <div className="inline-flex items-center justify-center h-6 w-6 bg-gradient-to-br from-orange-500 to-purple-600 rounded-full cursor-help" title="Upgrade to unlock">
      <Lock className="h-3 w-3 text-white" />
    </div>
  );
}
