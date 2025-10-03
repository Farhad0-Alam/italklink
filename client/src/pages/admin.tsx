import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import AdminLayout from '@/components/admin/AdminLayout';
import DashboardPage from '@/components/admin/DashboardPage';
import UsersPage from '@/components/admin/UsersPage';
import PlansPage from '@/components/admin/PlansPage';
import CouponsPage from '@/components/admin/CouponsPage';
import TemplatesPage from '@/components/admin/TemplatesPage';
import TemplateImportPage from '@/components/admin/TemplateImportPage';
import TemplateBuilder from '@/components/admin/TemplateBuilder';
import HeaderBuilder from '@/components/admin/HeaderBuilder';
import HeaderTemplatesPage from '@/components/admin/HeaderTemplatesPage';
import IconPacksPage from '@/components/admin/IconPacksPage';
import AffiliatesPage from '@/components/admin/AffiliatesPage';
import AffiliateConversionsPage from '@/components/admin/AffiliateConversionsPage';
import AdminProfilePage from '@/components/admin/AdminProfilePage';
import AdminLogin from '@/components/admin/AdminLogin';

export default function Admin() {
  const [location] = useLocation();
  const [adminUser, setAdminUser] = useState<any>(null);

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
      }
    };

    checkAuth();
  }, []);

  const handleLoginSuccess = (user: any) => {
    setAdminUser(user);
  };

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
      case '/admin/templates/header-builder':
      case '/admin/header-builder':
        return <HeaderBuilder />;
      case '/admin/templates/builder':
        return <TemplateBuilder />;
      case '/admin/header-templates':
        return <HeaderTemplatesPage />;
      case '/admin/templates/import':
        return <TemplateImportPage />;
      case '/admin/templates':
        return <TemplatesPage />;
      case '/admin/icon-packs':
        return <IconPacksPage />;
      case '/admin/affiliates':
        return <AffiliatesPage />;
      case '/admin/conversions':
        return <AffiliateConversionsPage />;
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