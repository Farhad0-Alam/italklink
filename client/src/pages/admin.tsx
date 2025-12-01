import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { ShieldCheck } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import DashboardPage from '@/components/admin/DashboardPage';
import UsersPage from '@/components/admin/UsersPage';
import PlansPage from '@/components/admin/PlansPage';
import CouponsPage from '@/components/admin/CouponsPage';
import AffiliatesPage from '@/components/admin/AffiliatesPage';
import AffiliateConversionsPage from '@/components/admin/AffiliateConversionsPage';
import AffiliatePayoutsPage from '@/components/admin/AffiliatePayoutsPage';
import TemplatesPage from '@/components/admin/TemplatesPage';
import IconsPage from '@/components/admin/IconsPage';
import ElementTypesPage from '@/components/admin/ElementTypesPage';
import AdminProfilePage from '@/components/admin/AdminProfilePage';
import AdminLogin from '@/components/admin/AdminLogin';
import { ModerationQueuePage } from '@/components/admin/ModerationQueuePage';
import AdminShopModeration from '@/pages/shop/admin-moderation';
import AdminCommission from '@/pages/shop/admin-commission';
import { AdminReviewModeration } from '@/pages/shop/admin-review-moderation';

export default function Admin() {
  const [location] = useLocation();
  const [adminUser, setAdminUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check authentication on component mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/user');
        if (response.ok) {
          const user = await response.json();
          if (user.role === 'admin' || user.role === 'owner') {
            setAdminUser(user);
          }
        }
      } catch (error) {
        console.log('Not authenticated');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const handleLoginSuccess = (user: any) => {
    setAdminUser(user);
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="mb-4 inline-block">
            <ShieldCheck className="w-16 h-16 text-blue-600 animate-pulse" />
          </div>
          <p className="text-gray-700 font-medium">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  // Show login form if not authenticated
  if (!adminUser) {
    return <AdminLogin onLoginSuccess={handleLoginSuccess} />;
  }
  
  const renderContent = () => {
    switch (location) {
      case '/admin/users':
        return <UsersPage />;
      case '/admin/plans':
        return <PlansPage />;
      case '/admin/coupons':
        return <CouponsPage />;
      case '/admin/templates':
        return <TemplatesPage />;
      case '/admin/icons':
        return <IconsPage />;
      case '/admin/elements':
        return <ElementTypesPage />;
      case '/admin/affiliates':
        return <AffiliatesPage />;
      case '/admin/conversions':
        return <AffiliateConversionsPage />;
      case '/admin/payouts':
        return <AffiliatePayoutsPage />;
      case '/admin/shop/moderation':
        return <ModerationQueuePage />;
      case '/admin/profile':
        return <AdminProfilePage />;
      case '/admin':
      default:
        return <DashboardPage />;
    }
  };
  
  return (
    <AdminLayout>
      {renderContent()}
    </AdminLayout>
  );
}