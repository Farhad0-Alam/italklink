import React from 'react';
import { Navigation } from '@/components/navigation';
import { AutomationManager } from '@/components/automation';

export default function Automation() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto py-8 px-4">
        <AutomationManager />
      </div>
    </div>
  );
}