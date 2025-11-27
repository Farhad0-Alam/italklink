import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Trash2, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface TextChunk {
  id: string;
  title: string;
  content: string;
  status: 'pending' | 'success' | 'failed';
}

interface TextChunkManagerProps {
  maxChunks?: number;
  className?: string;
  onChunksAdded?: (count: number) => void;
}

export function TextChunkManager({ maxChunks = 50, className = '', onChunksAdded }: TextChunkManagerProps) {
  const [chunks, setChunks] = useState<TextChunk[]>([]);
  const [newChunkTitle, setNewChunkTitle] = useState('');
  const [newChunkContent, setNewChunkContent] = useState('');
  const [ingesting, setIngesting] = useState(false);
  const { toast } = useToast();

  const addChunk = () => {
    if (!newChunkTitle.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a chunk title',
        variant: 'destructive',
      });
      return;
    }

    if (!newChunkContent.trim() || newChunkContent.trim().length < 10) {
      toast({
        title: 'Error',
        description: 'Chunk content must be at least 10 characters',
        variant: 'destructive',
      });
      return;
    }

    if (chunks.length >= maxChunks) {
      toast({
        title: 'Error',
        description: `Maximum ${maxChunks} chunks allowed`,
        variant: 'destructive',
      });
      return;
    }

    const chunk: TextChunk = {
      id: `chunk-${Date.now()}`,
      title: newChunkTitle,
      content: newChunkContent,
      status: 'pending',
    };

    setChunks([...chunks, chunk]);
    setNewChunkTitle('');
    setNewChunkContent('');
  };

  const removeChunk = (id: string) => {
    setChunks(chunks.filter(chunk => chunk.id !== id));
  };

  const ingestChunks = async () => {
    if (chunks.length === 0) {
      toast({
        title: 'Error',
        description: 'Add at least one text chunk to ingest',
        variant: 'destructive',
      });
      return;
    }

    setIngesting(true);
    let successCount = 0;
    let failedCount = 0;

    try {
      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        
        try {
          await apiRequest('POST', '/api/ingest-text', {
            text: chunk.content,
            title: chunk.title,
          });
          chunks[i].status = 'success';
          successCount++;
        } catch (error: any) {
          chunks[i].status = 'failed';
          const errorMsg = error?.message || 'Failed to ingest chunk';
          if (errorMsg.includes('429')) {
            toast({
              title: 'Rate Limited',
              description: 'Too many requests. Please wait a moment and try again.',
              variant: 'destructive',
            });
            break;
          }
          failedCount++;
        }

        setChunks([...chunks]);
      }

      if (successCount > 0) {
        toast({
          title: 'Success',
          description: `${successCount} chunk${successCount !== 1 ? 's' : ''} ingested to knowledge base`,
        });
        onChunksAdded?.(successCount);
        setChunks([]);
      }

      if (failedCount > 0) {
        toast({
          title: 'Warning',
          description: `${failedCount} chunk${failedCount !== 1 ? 's' : ''} failed to ingest`,
          variant: 'destructive',
        });
      }
    } finally {
      setIngesting(false);
    }
  };

  const clearAll = () => {
    if (chunks.length === 0) return;
    if (window.confirm('Remove all chunks?')) {
      setChunks([]);
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="space-y-3 p-4 bg-slate-700 rounded-lg border border-slate-600">
        <div>
          <label className="text-white text-sm font-medium block mb-2">Chunk Title:</label>
          <Input
            value={newChunkTitle}
            onChange={(e) => setNewChunkTitle(e.target.value)}
            placeholder="e.g., Company Overview, Features..."
            className="bg-slate-600 border-slate-500 text-white text-sm"
            disabled={ingesting}
          />
        </div>

        <div>
          <label className="text-white text-sm font-medium block mb-2">Chunk Content:</label>
          <Textarea
            value={newChunkContent}
            onChange={(e) => setNewChunkContent(e.target.value)}
            placeholder="Enter chunk content (minimum 10 characters)..."
            rows={4}
            className="bg-slate-600 border-slate-500 text-white text-sm resize-none"
            disabled={ingesting}
          />
        </div>

        <Button
          onClick={addChunk}
          disabled={ingesting}
          className="w-full bg-slate-500 hover:bg-slate-400 text-white"
          data-testid="button-add-text-chunk"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Chunk
        </Button>
      </div>

      {chunks.length > 0 && (
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-slate-300 text-sm">{chunks.length}/{maxChunks} chunks added</span>
            {chunks.some(c => c.status !== 'pending') && (
              <div className="text-xs space-x-2">
                <span className="text-green-400">{chunks.filter(c => c.status === 'success').length} success</span>
                <span className="text-red-400">{chunks.filter(c => c.status === 'failed').length} failed</span>
              </div>
            )}
          </div>

          <div className="space-y-2 max-h-48 overflow-y-auto">
            {chunks.map((chunk) => (
              <div
                key={chunk.id}
                className={`p-3 rounded-lg border ${
                  chunk.status === 'pending'
                    ? 'bg-slate-700 border-slate-600'
                    : chunk.status === 'success'
                    ? 'bg-green-900/20 border-green-600/30'
                    : 'bg-red-900/20 border-red-600/30'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate">{chunk.title}</p>
                    <p className="text-slate-400 text-xs line-clamp-2">{chunk.content}</p>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => removeChunk(chunk.id)}
                    disabled={ingesting}
                    className="text-slate-400 hover:text-red-400 flex-shrink-0"
                    data-testid={`button-remove-chunk-${chunk.id}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                {chunk.status !== 'pending' && (
                  <div className="text-xs mt-2">
                    {chunk.status === 'success' ? (
                      <span className="text-green-400">✓ Ingested</span>
                    ) : (
                      <span className="text-red-400">✗ Failed</span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <Button
              onClick={ingestChunks}
              disabled={ingesting || chunks.length === 0}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white"
              data-testid="button-ingest-chunks"
            >
              {ingesting ? 'Ingesting...' : `📝 Ingest ${chunks.length} Chunk${chunks.length !== 1 ? 's' : ''}`}
            </Button>
            <Button
              onClick={clearAll}
              disabled={ingesting || chunks.length === 0}
              variant="outline"
              className="bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600"
              data-testid="button-clear-chunks"
            >
              Clear All
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
