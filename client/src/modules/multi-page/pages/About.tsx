import { useParams } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { BusinessCard } from '@shared/schema';

export function About() {
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

  return (
    <div className="space-y-8" data-testid="page-about">
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-4">About {card.fullName}</h2>
        {card.title && <p className="text-xl text-gray-600 mb-6">{card.title}</p>}
        {card.company && <p className="text-lg text-gray-500 mb-8">at {card.company}</p>}
      </div>

      {card.about && (
        <div className="bg-white rounded-lg p-8 shadow-sm">
          <h3 className="text-xl font-semibold mb-4">About Me</h3>
          <p className="text-gray-700 leading-relaxed">{card.about}</p>
        </div>
      )}

      {card.vision && (
        <div className="bg-white rounded-lg p-8 shadow-sm">
          <h3 className="text-xl font-semibold mb-4">Vision</h3>
          <p className="text-gray-700 leading-relaxed">{card.vision}</p>
        </div>
      )}

      {card.mission && (
        <div className="bg-white rounded-lg p-8 shadow-sm">
          <h3 className="text-xl font-semibold mb-4">Mission</h3>
          <p className="text-gray-700 leading-relaxed">{card.mission}</p>
        </div>
      )}

      {card.profilePhoto && (
        <div className="bg-white rounded-lg p-8 shadow-sm text-center">
          <h3 className="text-xl font-semibold mb-4">Profile</h3>
          <img 
            src={card.profilePhoto} 
            alt={card.fullName}
            className="w-48 h-48 rounded-full mx-auto object-cover"
          />
        </div>
      )}
    </div>
  );
}