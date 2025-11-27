import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash2, Edit2, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface KnowledgeDoc {
  id: string;
  url: string;
  title: string;
  createdAt: string;
}

interface KnowledgeManagerProps {
  cardId?: string;
  onDocumentAdded?: () => void;
}

export function KnowledgeManager({ cardId, onDocumentAdded }: KnowledgeManagerProps) {
  const [documents, setDocuments] = useState<KnowledgeDoc[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const { toast } = useToast();

  // Load documents on mount
  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/knowledge');
      
      if (!response.ok) {
        throw new Error('Failed to load documents');
      }
      
      const data = await response.json();
      setDocuments(data.documents || []);
    } catch (error) {
      console.error('Error loading documents:', error);
      toast({
        title: 'Error',
        description: 'Failed to load knowledge base documents',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this document?')) {
      return;
    }

    try {
      const response = await fetch(`/api/knowledge/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete document');
      }

      setDocuments(documents.filter(doc => doc.id !== id));
      toast({
        title: 'Success',
        description: 'Document deleted successfully',
      });
    } catch (error) {
      console.error('Delete error:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete document',
        variant: 'destructive',
      });
    }
  };

  const handleUpdateTitle = async (id: string) => {
    if (!editTitle.trim()) {
      toast({
        title: 'Error',
        description: 'Title cannot be empty',
        variant: 'destructive',
      });
      return;
    }

    try {
      const response = await fetch(`/api/knowledge/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: editTitle }),
      });

      if (!response.ok) {
        throw new Error('Failed to update document');
      }

      setDocuments(documents.map(doc => 
        doc.id === id ? { ...doc, title: editTitle } : doc
      ));
      setEditingId(null);
      toast({
        title: 'Success',
        description: 'Document updated successfully',
      });
    } catch (error) {
      console.error('Update error:', error);
      toast({
        title: 'Error',
        description: 'Failed to update document',
        variant: 'destructive',
      });
    }
  };

  const startEdit = (doc: KnowledgeDoc) => {
    setEditingId(doc.id);
    setEditTitle(doc.title);
  };

  if (loading) {
    return (
      <div className="p-4 text-center text-sm text-slate-400">
        Loading knowledge base...
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <div className="p-4 text-center">
        <p className="text-sm text-slate-400 mb-3">No documents in knowledge base</p>
        <p className="text-xs text-slate-500">Add documents using the ingest form above</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-semibold text-slate-200">Knowledge Base</h4>
        <span className="text-xs bg-slate-700 text-slate-300 px-2 py-1 rounded">
          {documents.length} doc{documents.length !== 1 ? 's' : ''}
        </span>
      </div>

      <div className="space-y-2 max-h-64 overflow-y-auto">
        {documents.map((doc) => (
          <div
            key={doc.id}
            className="p-3 bg-slate-700/50 rounded-lg border border-slate-600 hover:border-slate-500 transition-colors"
          >
            {editingId === doc.id ? (
              <div className="flex gap-2">
                <Input
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="bg-slate-600 border-slate-500 text-white text-sm"
                  placeholder="Document title..."
                  autoFocus
                />
                <Button
                  size="sm"
                  onClick={() => handleUpdateTitle(doc.id)}
                  className="bg-talklink-500 hover:bg-talklink-600 text-white"
                >
                  Save
                </Button>
              </div>
            ) : (
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{doc.title}</p>
                  <p className="text-xs text-slate-400 truncate">{doc.url}</p>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => startEdit(doc)}
                    data-testid={`button-edit-knowledge-${doc.id}`}
                    className="text-slate-400 hover:text-slate-200"
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDelete(doc.id)}
                    data-testid={`button-delete-knowledge-${doc.id}`}
                    className="text-slate-400 hover:text-red-400"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
