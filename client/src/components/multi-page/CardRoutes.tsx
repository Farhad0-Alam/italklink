import { Route } from 'wouter';
import { CardLayout } from './CardLayout';
import { Overview } from './pages/Overview';
import { About } from './pages/About';
import { Services } from './pages/Services';
import { Gallery } from './pages/Gallery';
import { Contact } from './pages/Contact';

export function CardRoutes() {
  return (
    <>
      <Route path="/card/:slug">
        {(params) => (
          <CardLayout>
            <Overview />
          </CardLayout>
        )}
      </Route>
      
      <Route path="/card/:slug/about">
        {(params) => (
          <CardLayout>
            <About />
          </CardLayout>
        )}
      </Route>
      
      <Route path="/card/:slug/services">
        {(params) => (
          <CardLayout>
            <Services />
          </CardLayout>
        )}
      </Route>
      
      <Route path="/card/:slug/gallery">
        {(params) => (
          <CardLayout>
            <Gallery />
          </CardLayout>
        )}
      </Route>
      
      <Route path="/card/:slug/contact">
        {(params) => (
          <CardLayout>
            <Contact />
          </CardLayout>
        )}
      </Route>
    </>
  );
}