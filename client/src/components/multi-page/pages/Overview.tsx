import { useParams } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { BusinessCardComponent } from '@/components/business-card';
import { BusinessCard } from '@shared/schema';

export function Overview() {
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
    <div className="space-y-8" data-testid="page-overview">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">Business Card</h2>
        <p className="text-gray-600">View and interact with this digital business card</p>
      </div>
      
      <div className="flex justify-center">
        <div className="w-full max-w-md">
          <BusinessCardComponent 
            data={card} 
            showQR={true}
            isInteractive={true}
          />
        </div>
      </div>
    </div>
  );
}