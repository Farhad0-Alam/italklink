import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lock, Crown, Sparkles } from "lucide-react";
import { Link } from "wouter";

interface UpgradePromptProps {
  featureName: string;
  requiredPlan: string;
  description?: string;
  compact?: boolean;
}

export function UpgradePrompt({
  featureName,
  requiredPlan,
  description,
  compact = false,
}: UpgradePromptProps) {
  if (compact) {
    return (
      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-lg">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-orange-100 rounded-full">
            <Lock className="h-4 w-4 text-orange-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">{featureName}</p>
            <p className="text-xs text-gray-600">Requires {requiredPlan}</p>
          </div>
        </div>
        <Button
          size="sm"
          className="bg-orange-500 hover:bg-orange-600"
          asChild
          data-testid="button-upgrade-compact"
        >
          <Link href="/pricing">
            <Crown className="h-3 w-3 mr-1" />
            Upgrade
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <Card className="border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-amber-50" data-testid="card-upgrade-prompt">
      <CardContent className="p-8 text-center">
        <div className="inline-flex p-4 bg-orange-100 rounded-full mb-4">
          <Crown className="h-8 w-8 text-orange-600" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2" data-testid="text-feature-name">
          {featureName}
        </h3>
        <p className="text-gray-600 mb-1" data-testid="text-required-plan">
          Requires <span className="font-semibold text-orange-600">{requiredPlan}</span>
        </p>
        {description && (
          <p className="text-sm text-gray-600 mb-6 max-w-md mx-auto">
            {description}
          </p>
        )}
        <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
          <Button
            className="bg-orange-500 hover:bg-orange-600"
            asChild
            data-testid="button-upgrade-full"
          >
            <Link href="/pricing">
              <Sparkles className="h-4 w-4 mr-2" />
              Upgrade Now
            </Link>
          </Button>
          <Button variant="outline" asChild data-testid="button-learn-more">
            <Link href="/pricing">
              Learn More
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
