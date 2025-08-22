import { PageElement } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { QRCodeSVG } from "qrcode.react";
import { useState, useEffect } from "react";
import { generateFieldId } from "@/lib/card-data";
import { AIChat } from "@/components/ai-chat";
import { IngestForm } from "@/components/IngestForm";
import { RAGChatBox } from "@/components/RAGChatBox";
import { MessageCircle, X, Plus } from "lucide-react";

interface PageElementRendererProps {
  element: PageElement;
  onUpdate?: (id: string, data: any) => void;
  onDelete?: (id: string) => void;
  isEditing?: boolean;
}

export function PageElementRenderer({ element, onUpdate, onDelete, isEditing }: PageElementRendererProps) {
  const [isChatOpen, setIsChatOpen] = useState(false);

  const handleDataUpdate = (newData: any) => {
    if (onUpdate) {
      onUpdate(element.id, { ...element.data, ...newData });
    }
  };

  const renderElement = () => {
    switch (element.type) {
      case "ragKnowledge":
        return (
          <div className="mb-6">
            <h3 className="text-lg font-bold text-black mb-4 text-center">
              {element.data.title}
            </h3>
            <p className="text-center text-gray-600 mb-6">{element.data.description}</p>
            
            {isEditing ? (
              <div className="space-y-4">
                <Input
                  value={element.data.title}
                  onChange={(e) => handleDataUpdate({ title: e.target.value })}
                  placeholder="Knowledge assistant title"
                  className="bg-slate-700 border-slate-600 text-white"
                />
                <Textarea
                  value={element.data.description}
                  onChange={(e) => handleDataUpdate({ description: e.target.value })}
                  placeholder="Description"
                  className="bg-slate-700 border-slate-600 text-white"
                />
                
                {/* Multiple URL Management */}
                <div className="space-y-3">
                  <label className="text-black text-sm font-medium">Website URLs:</label>
                  <div className="space-y-2">
                    {(element.data.knowledgeBase?.websiteUrls || [element.data.knowledgeBase?.websiteUrl || '']).filter(Boolean).map((url: string, index: number) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          value={url}
                          onChange={(e) => {
                            const currentUrls = (element.data.knowledgeBase as any)?.websiteUrls || [element.data.knowledgeBase?.websiteUrl || ''];
                            const urls = [...currentUrls.filter(Boolean)];
                            urls[index] = e.target.value;
                            handleDataUpdate({
                              knowledgeBase: {
                                ...element.data.knowledgeBase,
                                websiteUrls: urls,
                                websiteUrl: urls[0] || '' // Keep backward compatibility
                              } as any
                            });
                          }}
                          placeholder="https://example.com"
                          className="bg-slate-700 border-slate-600 text-white flex-1"
                        />
                        <Button
                          onClick={() => {
                            const currentUrls = (element.data.knowledgeBase as any)?.websiteUrls || [element.data.knowledgeBase?.websiteUrl || ''];
                            const urls = [...currentUrls.filter(Boolean)];
                            urls.splice(index, 1);
                            handleDataUpdate({
                              knowledgeBase: {
                                ...element.data.knowledgeBase,
                                websiteUrls: urls,
                                websiteUrl: urls[0] || ''
                              } as any
                            });
                          }}
                          variant="destructive"
                          size="sm"
                          className="px-3"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      onClick={() => {
                        const currentUrls = ((element.data.knowledgeBase as any)?.websiteUrls || [element.data.knowledgeBase?.websiteUrl || '']).filter(Boolean);
                        const newUrls = [...currentUrls, ''];
                        handleDataUpdate({
                          knowledgeBase: {
                            ...element.data.knowledgeBase,
                            websiteUrls: newUrls,
                            websiteUrl: newUrls[0] || ''
                          } as any
                        });
                      }}
                      variant="outline"
                      size="sm"
                      className="w-full border-dashed border-slate-500 text-slate-400 hover:text-white hover:border-slate-400"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Another URL
                    </Button>
                  </div>
                </div>
                
                {/* URL Ingestion Form */}
                <div className="mt-2 p-4 bg-slate-800 rounded-lg border border-slate-600">
                  <div className="flex items-center gap-2 mb-2">
                    <i className="fas fa-globe text-blue-400"></i>
                    <span className="text-white text-sm font-medium">URL Knowledge Ingestion</span>
                  </div>
                  <p className="text-slate-400 text-xs mb-3">Extract and index content from any public webpage for AI chat</p>
                  <IngestForm />
                </div>
                
                {/* Enhanced File Upload */}
                <div className="space-y-3">
                  <label className="text-black text-sm font-medium">Knowledge Documents:</label>
                  <div className="space-y-2">
                    <p className="text-xs text-slate-600">
                      Supported formats: PDF, DOCX, TXT, MD, CSV
                    </p>
                    <Input
                      type="file"
                      accept=".pdf,.docx,.txt,.md,.csv"
                      multiple
                      onChange={(e) => {
                        const files = Array.from(e.target.files || []);
                        files.forEach(file => {
                          const reader = new FileReader();
                          reader.onload = (event) => {
                            const newFile = {
                              id: generateFieldId(),
                              name: file.name,
                              content: event.target?.result as string,
                              size: file.size,
                              type: file.type,
                              uploadedAt: new Date()
                            };
                            
                            handleDataUpdate({
                              knowledgeBase: {
                                ...element.data.knowledgeBase,
                                uploadedFiles: [...((element.data.knowledgeBase as any)?.uploadedFiles || element.data.knowledgeBase?.pdfFiles || []), newFile]
                              } as any
                            });
                          };
                          reader.readAsDataURL(file);
                        });
                      }}
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                    
                    {/* File List Display */}
                    {((element.data.knowledgeBase as any)?.uploadedFiles || element.data.knowledgeBase?.pdfFiles) && 
                     ((element.data.knowledgeBase as any)?.uploadedFiles || element.data.knowledgeBase?.pdfFiles || []).length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium text-black">Uploaded Files:</h4>
                        <div className="space-y-1">
                          {((element.data.knowledgeBase as any)?.uploadedFiles || element.data.knowledgeBase?.pdfFiles || []).map((file: any, index: number) => {
                            const extension = file.name.split('.').pop()?.toLowerCase();
                            const getFileIcon = (ext: string) => {
                              switch (ext) {
                                case 'pdf': return '📄';
                                case 'docx': case 'doc': return '📝';
                                case 'txt': case 'md': return '📄';
                                case 'csv': return '📊';
                                default: return '📄';
                              }
                            };
                            
                            return (
                              <div key={file.id || index} className="flex items-center justify-between bg-slate-600 p-3 rounded-lg">
                                <div className="flex items-center gap-2">
                                  <span className="text-xl">{getFileIcon(extension || 'pdf')}</span>
                                  <div>
                                    <div className="text-white text-sm font-medium">{file.name}</div>
                                    <div className="text-slate-400 text-xs">
                                      {extension?.toUpperCase()} • {(file.size / 1024).toFixed(1)}KB
                                      {file.uploadedAt && ` • ${new Date(file.uploadedAt).toLocaleDateString()}`}
                                    </div>
                                  </div>
                                </div>
                                <Button
                                  onClick={() => {
                                    const currentFiles = (element.data.knowledgeBase as any)?.uploadedFiles || element.data.knowledgeBase?.pdfFiles || [];
                                    const updatedFiles = currentFiles.filter((_: any, i: number) => i !== index);
                                    handleDataUpdate({
                                      knowledgeBase: {
                                        ...element.data.knowledgeBase,
                                        uploadedFiles: updatedFiles,
                                        pdfFiles: updatedFiles // Keep backward compatibility
                                      } as any
                                    });
                                  }}
                                  variant="ghost"
                                  size="sm"
                                  className="text-slate-400 hover:text-red-400 px-2"
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={element.data.showIngestForm}
                    onChange={(e) => handleDataUpdate({ showIngestForm: e.target.checked })}
                    className="rounded"
                  />
                  <span className="text-black text-sm">Show URL Ingestion Form</span>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={element.data.showChatBox}
                    onChange={(e) => handleDataUpdate({ showChatBox: e.target.checked })}
                    className="rounded"
                  />
                  <span className="text-black text-sm">Show Chat Interface</span>
                </div>
                <div className="space-y-2">
                  <label className="text-black text-sm">Primary Color:</label>
                  <Input
                    type="color"
                    value={element.data.primaryColor}
                    onChange={(e) => handleDataUpdate({ primaryColor: e.target.value })}
                    className="w-20 h-10"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Chat Button for End Users */}
                {element.data.showChatBox && (
                  <div className="text-center">
                    <Button
                      onClick={() => setIsChatOpen(true)}
                      className="bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-lg shadow-lg"
                      style={{ backgroundColor: element.data.primaryColor || '#22c55e' }}
                      data-testid="button-open-knowledge-chat"
                    >
                      <MessageCircle className="h-5 w-5 mr-2" />
                      Ask Knowledge Assistant
                    </Button>
                  </div>
                )}
                
                {/* RAG Chat Dialog */}
                {element.type === "ragKnowledge" && (
                  <RAGChatBox
                    isOpen={isChatOpen}
                    onClose={() => setIsChatOpen(false)}
                    primaryColor={element.data.primaryColor}
                  />
                )}
                
                {/* Technical note for card creators - only visible during editing */}
                {element.data.showIngestForm && (
                  <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700">
                    <p><strong>For Card Creators:</strong> Edit this element to manage knowledge base content. End users will only see the chat interface above.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        );

      default:
        return (
          <div className="mb-4 p-4 bg-slate-100 rounded-lg text-center text-slate-600">
            Element type not implemented yet
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