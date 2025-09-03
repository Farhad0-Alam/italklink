import { useParams } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { BusinessCard } from '@shared/schema';

export function Services() {
  const { slug } = useParams<{ slug: string }>();
  
  const { data: card, isLoading } = useQuery<BusinessCard>({
    queryKey: ['/api/cards', slug],
    enabled: !!slug,
  });

  if (isLoading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  if (!card) {
    return <div className="text-center py-8 text-red-600">Card not found</div>;
  }

  // Extract services from pageElements if they exist
  const servicesElements = card.pageElements?.filter((el: any) => el.type === 'services') || [];

  return (
    <div className="space-y-8" data-testid="page-services">
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-4">Services</h2>
        <p className="text-gray-600">What we offer and how we can help you</p>
      </div>

      {servicesElements.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {servicesElements.map((element: any) => (
            <div key={element.id} className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-xl font-semibold mb-3">{element.data.title}</h3>
              {element.data.description && (
                <p className="text-gray-700 leading-relaxed">{element.data.description}</p>
              )}
              {element.data.price && (
                <div className="mt-4 text-lg font-bold" style={{ color: card.brandColor }}>
                  {element.data.price}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg p-8 shadow-sm text-center">
          <h3 className="text-xl font-semibold mb-4">Professional Services</h3>
          <p className="text-gray-700 leading-relaxed">
            We provide high-quality professional services tailored to meet your specific needs. 
            Contact us to learn more about how we can help your business succeed.
          </p>
          <div className="mt-6">
            <button 
              className="px-6 py-3 rounded-lg font-semibold text-white"
              style={{ backgroundColor: card.brandColor }}
              data-testid="contact-services-button"
            >
              Get In Touch
            </button>
          </div>
        </div>
      )}

      {card.company && (
        <div className="bg-gray-50 rounded-lg p-8">
          <h3 className="text-xl font-semibold mb-4">About {card.company}</h3>
          <p className="text-gray-700 leading-relaxed">
            {card.about || `${card.company} is committed to delivering exceptional service and results for our clients.`}
          </p>
        </div>
      )}
    </div>
  );
}