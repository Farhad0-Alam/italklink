import { PageElement } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { QRCodeSVG } from "qrcode.react";

interface PageElementProps {
  element: PageElement;
  isEditing?: boolean;
  onUpdate?: (element: PageElement) => void;
  onDelete?: (elementId: string) => void;
}

export function PageElementRenderer({ element, isEditing = false, onUpdate, onDelete }: PageElementProps) {
  const handleDataUpdate = (newData: any) => {
    if (onUpdate) {
      onUpdate({ ...element, data: { ...element.data, ...newData } });
    }
  };

  const renderElement = () => {
    switch (element.type) {
      case "heading":
        const HeadingTag = element.data.level as keyof JSX.IntrinsicElements;
        return (
          <div className={`text-${element.data.alignment} mb-4`}>
            {isEditing ? (
              <div className="space-y-2">
                <Input
                  value={element.data.text}
                  onChange={(e) => handleDataUpdate({ text: e.target.value })}
                  className="bg-slate-700 border-slate-600 text-white"
                  placeholder="Heading text"
                />
                <div className="flex gap-2">
                  <select
                    value={element.data.level}
                    onChange={(e) => handleDataUpdate({ level: e.target.value })}
                    className="bg-slate-700 border-slate-600 text-white rounded px-2 py-1"
                  >
                    <option value="h1">H1</option>
                    <option value="h2">H2</option>
                    <option value="h3">H3</option>
                  </select>
                  <select
                    value={element.data.alignment}
                    onChange={(e) => handleDataUpdate({ alignment: e.target.value })}
                    className="bg-slate-700 border-slate-600 text-white rounded px-2 py-1"
                  >
                    <option value="left">Left</option>
                    <option value="center">Center</option>
                    <option value="right">Right</option>
                  </select>
                </div>
              </div>
            ) : (
              <HeadingTag className={`font-bold ${
                element.data.level === 'h1' ? 'text-2xl' : 
                element.data.level === 'h2' ? 'text-xl' : 'text-lg'
              } text-slate-800`}>
                {element.data.text}
              </HeadingTag>
            )}
          </div>
        );

      case "paragraph":
        return (
          <div className={`text-${element.data.alignment} mb-4`}>
            {isEditing ? (
              <div className="space-y-2">
                <Textarea
                  value={element.data.text}
                  onChange={(e) => handleDataUpdate({ text: e.target.value })}
                  className="bg-slate-700 border-slate-600 text-white"
                  placeholder="Paragraph text"
                  rows={3}
                />
                <select
                  value={element.data.alignment}
                  onChange={(e) => handleDataUpdate({ alignment: e.target.value })}
                  className="bg-slate-700 border-slate-600 text-white rounded px-2 py-1"
                >
                  <option value="left">Left</option>
                  <option value="center">Center</option>
                  <option value="right">Right</option>
                </select>
              </div>
            ) : (
              <p className="text-slate-600 text-sm leading-relaxed">
                {element.data.text}
              </p>
            )}
          </div>
        );

      case "link":
        return (
          <div className="mb-4">
            {isEditing ? (
              <div className="space-y-2">
                <Input
                  value={element.data.text}
                  onChange={(e) => handleDataUpdate({ text: e.target.value })}
                  className="bg-slate-700 border-slate-600 text-white"
                  placeholder="Link text"
                />
                <Input
                  value={element.data.url}
                  onChange={(e) => handleDataUpdate({ url: e.target.value })}
                  className="bg-slate-700 border-slate-600 text-white"
                  placeholder="https://example.com"
                />
                <select
                  value={element.data.style}
                  onChange={(e) => handleDataUpdate({ style: e.target.value })}
                  className="bg-slate-700 border-slate-600 text-white rounded px-2 py-1"
                >
                  <option value="button">Button</option>
                  <option value="text">Text Link</option>
                </select>
              </div>
            ) : (
              element.data.style === "button" ? (
                <Button
                  onClick={() => window.open(element.data.url, '_blank')}
                  className="w-full bg-talklink-500 hover:bg-talklink-600 text-white"
                >
                  {element.data.text}
                </Button>
              ) : (
                <a
                  href={element.data.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-talklink-500 hover:text-talklink-600 underline"
                >
                  {element.data.text}
                </a>
              )
            )}
          </div>
        );

      case "image":
        return (
          <div className="mb-4">
            {isEditing ? (
              <div className="space-y-2">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (e) => {
                        handleDataUpdate({ src: e.target?.result as string });
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  className="bg-slate-700 border-slate-600 text-white"
                />
                <Input
                  value={element.data.alt || ''}
                  onChange={(e) => handleDataUpdate({ alt: e.target.value })}
                  className="bg-slate-700 border-slate-600 text-white"
                  placeholder="Image description"
                />
              </div>
            ) : (
              element.data.src && (
                <img
                  src={element.data.src}
                  alt={element.data.alt || ''}
                  className="w-full max-w-sm mx-auto rounded-lg"
                />
              )
            )}
          </div>
        );

      case "qrcode":
        return (
          <div className="mb-4 flex justify-center">
            {isEditing ? (
              <div className="space-y-2">
                <Input
                  value={element.data.value}
                  onChange={(e) => handleDataUpdate({ value: e.target.value })}
                  className="bg-slate-700 border-slate-600 text-white"
                  placeholder="QR Code content"
                />
                <Input
                  type="number"
                  value={element.data.size}
                  onChange={(e) => handleDataUpdate({ size: parseInt(e.target.value) })}
                  className="bg-slate-700 border-slate-600 text-white"
                  placeholder="Size"
                  min="50"
                  max="300"
                />
              </div>
            ) : (
              element.data.value && (
                <QRCodeSVG
                  value={element.data.value}
                  size={element.data.size}
                  level="M"
                  includeMargin={true}
                />
              )
            )}
          </div>
        );

      case "contactSection":
        return (
          <div className="mb-6">
            {isEditing ? (
              <div className="text-white">Contact Section (Edit in form builder)</div>
            ) : (
              <div className="flex justify-center space-x-4 flex-wrap gap-y-3">
                {element.data.contacts.map((contact) => (
                  contact.value && (
                    <div key={contact.id} className="flex flex-col items-center">
                      <button
                        className="w-10 h-10 bg-slate-800 text-white rounded-full flex items-center justify-center hover:bg-talklink-500 transition-colors mb-1"
                        onClick={() => {
                          if (contact.type === 'phone') {
                            window.open(`tel:${contact.value}`, '_self');
                          } else if (contact.type === 'email') {
                            window.open(`mailto:${contact.value}`, '_self');
                          } else if (contact.type === 'website') {
                            window.open(contact.value.startsWith('http') ? contact.value : `https://${contact.value}`, '_blank');
                          }
                        }}
                      >
                        <i className={`${contact.icon} text-sm`}></i>
                      </button>
                      <span className="text-xs text-slate-600">{contact.label}</span>
                    </div>
                  )
                ))}
              </div>
            )}
          </div>
        );

      case "socialSection":
        const socials = element.data.socials.filter(social => social.value);
        return (
          <div className="mb-6">
            {isEditing ? (
              <div className="text-white">Social Section (Edit in form builder)</div>
            ) : (
              <div className="space-y-3">
                {/* Group socials into rows of 4 */}
                {Array.from({ length: Math.ceil(socials.length / 4) }, (_, rowIndex) => (
                  <div key={rowIndex} className="flex justify-center space-x-4">
                    {socials.slice(rowIndex * 4, (rowIndex + 1) * 4).map((social) => (
                      <div key={social.id} className="flex flex-col items-center">
                        <button
                          className="w-10 h-10 bg-slate-700 text-white rounded-full flex items-center justify-center hover:bg-blue-500 transition-colors mb-1"
                          onClick={() => {
                            const url = social.value.startsWith('http') ? social.value : `https://${social.platform.toLowerCase()}.com/${social.value.replace('@', '')}`;
                            window.open(url, '_blank');
                          }}
                        >
                          <i className={`${social.icon} text-sm`}></i>
                        </button>
                        <span className="text-xs text-slate-600">{social.platform || social.label}</span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      default:
        return (
          <div className="mb-4 p-4 bg-slate-100 rounded-lg text-center text-slate-600">
            Element type "{element.type}" not implemented yet
          </div>
        );
    }
  };

  return (
    <div className="relative group">
      {renderElement()}
      {isEditing && onDelete && (
        <Button
          onClick={() => onDelete(element.id)}
          variant="destructive"
          size="sm"
          className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <i className="fas fa-trash text-xs"></i>
        </Button>
      )}
    </div>
  );
}