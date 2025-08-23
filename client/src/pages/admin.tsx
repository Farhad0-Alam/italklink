import { Route, Switch } from 'wouter';
import AdminLayout from '@/components/admin/AdminLayout';
import DashboardPage from '@/components/admin/DashboardPage';
import UsersPage from '@/components/admin/UsersPage';
import TemplatesPage from '@/components/admin/TemplatesPage';
import TemplateBuilder from '@/components/admin/TemplateBuilder';

// Placeholder components for other admin pages (to be implemented)
const PlansPage = () => <div className="p-6">Plans page coming soon...</div>;
const IconPacksPage = () => <div className="p-6">Icon packs page coming soon...</div>;
const SettingsPage = () => <div className="p-6">Settings page coming soon...</div>;

export default function Admin() {
  return (
    <AdminLayout>
      <Switch>
        <Route path="/admin" component={DashboardPage} />
        <Route path="/admin/users" component={UsersPage} />
        <Route path="/admin/plans" component={PlansPage} />
        <Route path="/admin/templates/builder" component={TemplateBuilder} />
        <Route path="/admin/templates" component={TemplatesPage} />
        <Route path="/admin/icon-packs" component={IconPacksPage} />
        <Route path="/admin/settings" component={SettingsPage} />
        <Route>
          <div className="text-center py-20">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Page Not Found</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">The page you're looking for doesn't exist.</p>
            <a href="/admin" className="text-green-600 hover:text-green-700">
              Back to Dashboard
            </a>
          </div>
        </Route>
      </Switch>
    </AdminLayout>
  );
}