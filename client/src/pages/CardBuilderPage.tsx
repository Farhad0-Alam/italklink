import { useParams } from "wouter";
import { Builder } from "@/modules/business-cards/components/CardBuilder";

interface CardBuilderPageParams {
  id?: string;
}

export default function CardBuilderPage() {
  const params = useParams() as CardBuilderPageParams;
  
  return <Builder cardId={params.id} />;
}
