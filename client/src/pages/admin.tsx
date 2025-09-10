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
  const [isLoading, setIsLoading] = useState(true);

  // Check authentication on component mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        if (!token) {
          setIsLoading(false);
          return;
        }

        const response = await fetch('/api/auth/user', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  // Show message if not authenticated as admin
  if (!adminUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center p-8">
          <div className="mb-4">
            <i className="fas fa-shield-alt text-4xl text-gray-400"></i>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Admin Access Required
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            You need admin or owner privileges to access this page.
          </p>
          <button 
            onClick={() => window.location.href = '/login'}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
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