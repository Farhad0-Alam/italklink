// Main exports for MultiPage module
export { MenuElement } from './components/MenuElement';
export { CardLayout } from './components/CardLayout';
export { CardRoutes } from './components/CardRoutes';

// Page exports
export { Overview } from './pages/Overview';
export { About } from './pages/About';
export { Services } from './pages/Services';
export { Gallery } from './pages/Gallery';
export { Contact } from './pages/Contact';

// Module metadata
export const multiPageModule = {
  name: 'MultiPage',
  version: '1.0.0',
  description: 'Multi-page navigation system for business cards with customizable menus and routing',
  type: 'feature'
};