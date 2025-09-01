import { useLocation } from 'wouter';
import AdminLayout from '@/components/admin/AdminLayout';
import DashboardPage from '@/components/admin/DashboardPage';
import UsersPage from '@/components/admin/UsersPage';
import PlansPage from '@/components/admin/PlansPage';
import CouponsPage from '@/components/admin/CouponsPage';
import TemplatesPage from '@/components/admin/TemplatesPage';
import TemplateBuilder from '@/components/admin/TemplateBuilder';
import HeaderBuilder from '@/components/admin/HeaderBuilder';
import HeaderTemplatesPage from '@/components/admin/HeaderTemplatesPage';
import IconPacksPage from '@/components/admin/IconPacksPage';
const SettingsPage = () => <div className="p-6">Settings page coming soon...</div>;

export default function Admin() {
  const [location] = useLocation();
  
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
      case '/admin/templates':
        return <TemplatesPage />;
      case '/admin/icon-packs':
        return <IconPacksPage />;
      case '/admin/settings':
        return <SettingsPage />;
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