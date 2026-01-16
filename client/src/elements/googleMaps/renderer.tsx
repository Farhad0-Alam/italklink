import { ElementRendererProps } from "../registry/types";

export function GoogleMapsRenderer({ element }: ElementRendererProps) {
  const elementData = element.data || {};

  const getMapEmbedUrl = (location: string, zoom: number): string => {
    const encodedLocation = encodeURIComponent(location);
    return `https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${encodedLocation}&zoom=${zoom}`;
  };

  if (!elementData?.location) {
    return (
      <div className="mb-4 p-8 bg-slate-100 rounded-lg text-center text-slate-500 border-2 border-dashed border-slate-300">
        <i className="fas fa-map-marker-alt text-3xl mb-2"></i>
        <p>No location set</p>
      </div>
    );
  }

  return (
    <div className="mb-4 rounded overflow-hidden">
      <iframe
        src={getMapEmbedUrl(elementData.location, elementData?.zoom || 12)}
        width="100%"
        height={elementData?.height || "300px"}
        style={{ border: 0 }}
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
    </div>
  );
}
