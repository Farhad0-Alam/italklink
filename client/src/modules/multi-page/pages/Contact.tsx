import { useParams } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { BusinessCard } from '@shared/schema';
import { Mail, Phone, MapPin, Globe } from 'lucide-react';

export function Contact() {
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

  const contactItems = [
    { icon: Mail, label: 'Email', value: card.email, href: card.email ? `mailto:${card.email}` : '' },
    { icon: Phone, label: 'Phone', value: card.phone, href: card.phone ? `tel:${card.phone}` : '' },
    { icon: Globe, label: 'Website', value: card.website, href: card.website },
    { icon: MapPin, label: 'Location', value: card.location, href: '' },
  ].filter(item => item.value);

  return (
    <div className="space-y-8" data-testid="page-contact">
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-4">Contact Information</h2>
        <p className="text-gray-600">Get in touch with {card.fullName}</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Contact Methods */}
        <div className="bg-white rounded-lg p-8 shadow-sm">
          <h3 className="text-xl font-semibold mb-6">Contact Methods</h3>
          <div className="space-y-4">
            {contactItems.map((item) => {
              const Icon = item.icon;
              const content = (
                <div className="flex items-center gap-4 p-4 rounded-lg hover:bg-gray-50 transition-colors">
                  <div 
                    className="w-12 h-12 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: card.brandColor + '20', color: card.brandColor }}
                  >
                    <Icon size={20} />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{item.label}</div>
                    <div className="text-gray-600">{item.value}</div>
                  </div>
                </div>
              );

              if (item.href) {
                return (
                  <a
                    key={item.label}
                    href={item.href}
                    className="block"
                    data-testid={`contact-${item.label.toLowerCase()}`}
                  >
                    {content}
                  </a>
                );
              }

              return (
                <div key={item.label} data-testid={`contact-${item.label.toLowerCase()}`}>
                  {content}
                </div>
              );
            })}
          </div>
        </div>

        {/* Contact Form */}
        <div className="bg-white rounded-lg p-8 shadow-sm">
          <h3 className="text-xl font-semibold mb-6">Send a Message</h3>
          <form className="space-y-4" data-testid="contact-form">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Your name"
                data-testid="input-contact-name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="your@email.com"
                data-testid="input-contact-email"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
              <textarea
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Your message..."
                data-testid="textarea-contact-message"
              ></textarea>
            </div>
            <button
              type="submit"
              className="w-full py-3 rounded-lg font-semibold text-white hover:opacity-90 transition-opacity"
              style={{ backgroundColor: card.brandColor }}
              data-testid="button-send-message"
            >
              Send Message
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}