import { useParams } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { BusinessCard } from '@shared/schema';

export function Gallery() {
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

  const galleryImages = card.galleryImages as string[] || [];

  return (
    <div className="space-y-8" data-testid="page-gallery">
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-4">Gallery</h2>
        <p className="text-gray-600">Showcasing our work and achievements</p>
      </div>

      {galleryImages.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {galleryImages.map((image, index) => (
            <div key={index} className="bg-white rounded-lg overflow-hidden shadow-sm">
              <img 
                src={image} 
                alt={`Gallery image ${index + 1}`}
                className="w-full h-48 object-cover"
                data-testid={`gallery-image-${index}`}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg p-8 shadow-sm text-center">
          <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-lg flex items-center justify-center">
            <svg 
              className="w-12 h-12 text-gray-400" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
              />
            </svg>
          </div>
          <h3 className="text-xl font-semibold mb-2">No Images Yet</h3>
          <p className="text-gray-600">
            This gallery is currently empty. Check back later for updates!
          </p>
        </div>
      )}
      
      {card.profilePhoto && (
        <div className="bg-white rounded-lg p-8 shadow-sm">
          <h3 className="text-xl font-semibold mb-4 text-center">Profile</h3>
          <div className="flex justify-center">
            <img 
              src={card.profilePhoto} 
              alt={card.fullName}
              className="w-48 h-48 rounded-full object-cover"
              data-testid="profile-image"
            />
          </div>
        </div>
      )}
    </div>
  );
}