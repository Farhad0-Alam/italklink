import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const FONTAWESOME_ICONS = [
  { name: "fa-link", label: "Link", category: "General", style: "fas" },
  { name: "fa-external-link-alt", label: "External Link", category: "General", style: "fas" },
  { name: "fa-envelope", label: "Envelope", category: "Communication", style: "fas" },
  { name: "fa-phone", label: "Phone", category: "Communication", style: "fas" },
  { name: "fa-globe", label: "Globe", category: "General", style: "fas" },
  { name: "fa-map-marker-alt", label: "Location", category: "General", style: "fas" },
  { name: "fa-calendar", label: "Calendar", category: "Time", style: "fas" },
  { name: "fa-clock", label: "Clock", category: "Time", style: "fas" },
  { name: "fa-user", label: "User", category: "People", style: "fas" },
  { name: "fa-users", label: "Users", category: "People", style: "fas" },
  { name: "fa-home", label: "Home", category: "General", style: "fas" },
  { name: "fa-briefcase", label: "Briefcase", category: "Business", style: "fas" },
  { name: "fa-shopping-cart", label: "Shopping Cart", category: "Business", style: "fas" },
  { name: "fa-heart", label: "Heart", category: "Social", style: "fas" },
  { name: "fa-star", label: "Star", category: "Social", style: "fas" },
  { name: "fa-share-alt", label: "Share", category: "Social", style: "fas" },
  { name: "fa-download", label: "Download", category: "Actions", style: "fas" },
  { name: "fa-upload", label: "Upload", category: "Actions", style: "fas" },
  { name: "fa-play", label: "Play", category: "Media", style: "fas" },
  { name: "fa-pause", label: "Pause", category: "Media", style: "fas" },
  { name: "fa-camera", label: "Camera", category: "Media", style: "fas" },
  { name: "fa-video", label: "Video", category: "Media", style: "fas" },
  { name: "fa-music", label: "Music", category: "Media", style: "fas" },
  { name: "fa-image", label: "Image", category: "Media", style: "fas" },
  { name: "fa-file", label: "File", category: "Files", style: "fas" },
  { name: "fa-file-pdf", label: "PDF", category: "Files", style: "fas" },
  { name: "fa-file-word", label: "Word", category: "Files", style: "fas" },
  { name: "fa-file-excel", label: "Excel", category: "Files", style: "fas" },
  { name: "fa-search", label: "Search", category: "Actions", style: "fas" },
  { name: "fa-cog", label: "Settings", category: "Actions", style: "fas" },
  { name: "fa-bell", label: "Bell", category: "Notifications", style: "fas" },
  { name: "fa-comment", label: "Comment", category: "Communication", style: "fas" },
  { name: "fa-comments", label: "Comments", category: "Communication", style: "fas" },
  { name: "fa-check", label: "Check", category: "Actions", style: "fas" },
  { name: "fa-times", label: "Times", category: "Actions", style: "fas" },
  { name: "fa-plus", label: "Plus", category: "Actions", style: "fas" },
  { name: "fa-minus", label: "Minus", category: "Actions", style: "fas" },
  { name: "fa-arrow-right", label: "Arrow Right", category: "Arrows", style: "fas" },
  { name: "fa-arrow-left", label: "Arrow Left", category: "Arrows", style: "fas" },
  { name: "fa-arrow-up", label: "Arrow Up", category: "Arrows", style: "fas" },
  { name: "fa-arrow-down", label: "Arrow Down", category: "Arrows", style: "fas" },
  { name: "fa-linkedin", label: "LinkedIn", category: "Social Media", style: "fab" },
  { name: "fa-twitter", label: "Twitter", category: "Social Media", style: "fab" },
  { name: "fa-facebook", label: "Facebook", category: "Social Media", style: "fab" },
  { name: "fa-instagram", label: "Instagram", category: "Social Media", style: "fab" },
  { name: "fa-youtube", label: "YouTube", category: "Social Media", style: "fab" },
  { name: "fa-github", label: "GitHub", category: "Social Media", style: "fab" },
  { name: "fa-whatsapp", label: "WhatsApp", category: "Communication", style: "fab" },
  { name: "fa-telegram", label: "Telegram", category: "Communication", style: "fab" },
];

interface IconPickerProps {
  value?: string;
  onChange: (icon: string) => void;
}

export function IconPicker({ value, onChange }: IconPickerProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const categories = ["All", ...Array.from(new Set(FONTAWESOME_ICONS.map(icon => icon.category)))];

  const filteredIcons = FONTAWESOME_ICONS.filter(icon => {
    const matchesSearch = icon.label.toLowerCase().includes(search.toLowerCase()) || 
                         icon.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === "All" || icon.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleSelect = (icon: typeof FONTAWESOME_ICONS[0]) => {
    onChange(`${icon.style} ${icon.name}`);
    setOpen(false);
  };

  return (
    <>
      <div className="flex gap-2">
        <Input
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          className="bg-slate-600 border-slate-500 text-white flex-1"
          placeholder="fas fa-link"
        />
        <Button
          type="button"
          onClick={() => setOpen(true)}
          className="bg-talklink-500 hover:bg-talklink-600"
        >
          <i className="fas fa-search mr-2"></i>
          Browse
        </Button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Select Icon</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 flex-1 overflow-auto">
            {/* Search */}
            <Input
              placeholder="Search icons..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full"
            />

            {/* Categories */}
            <div className="flex flex-wrap gap-2">
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-3 py-1 rounded-full text-sm transition-colors ${
                    selectedCategory === category
                      ? 'bg-talklink-500 text-white'
                      : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>

            {/* Icon Grid */}
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
              {filteredIcons.map(icon => (
                <button
                  key={icon.name}
                  onClick={() => handleSelect(icon)}
                  className={`flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all hover:border-talklink-500 hover:bg-talklink-50 ${
                    value === `${icon.style} ${icon.name}` ? 'border-talklink-500 bg-talklink-50' : 'border-slate-200'
                  }`}
                  title={icon.label}
                >
                  <i className={`${icon.style} ${icon.name} text-2xl text-slate-700 mb-1`}></i>
                  <span className="text-xs text-slate-600 text-center line-clamp-1">{icon.label}</span>
                </button>
              ))}
            </div>

            {filteredIcons.length === 0 && (
              <div className="text-center py-8 text-slate-500">
                <i className="fas fa-search text-4xl mb-2 opacity-50"></i>
                <p>No icons found</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
