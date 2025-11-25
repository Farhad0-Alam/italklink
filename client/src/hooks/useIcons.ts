import { useQuery } from "@tanstack/react-query";
import { fallbackIcons, IconData } from "@/lib/card-data";

export function useIcons(category?: string) {
  const { data: apiIcons, isLoading, error } = useQuery<IconData[]>({
    queryKey: ['/api/icons', category].filter(Boolean),
    staleTime: 5 * 60 * 1000,
  });

  const icons = apiIcons && apiIcons.length > 0 ? apiIcons : fallbackIcons;
  
  const filteredIcons = category 
    ? icons.filter(icon => icon.category === category)
    : icons;

  return {
    icons: filteredIcons,
    allIcons: icons,
    isLoading,
    error
  };
}
