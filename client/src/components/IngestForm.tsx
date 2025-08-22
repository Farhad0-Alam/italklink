import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Globe, CheckCircle, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface IngestResult {
  ok: boolean;
  url: string;
  title: string;
  chunks: number;
  error?: string;
}

export function IngestForm() {
  const [url, setUrl] = useState('');
  const [isIngesting, setIsIngesting] = useState(false);
  const [lastResult, setLastResult] = useState<IngestResult | null>(null);
  const { toast } = useToast();

  const handleIngest = async () => {
    if (!url.trim()) {
      toast({
        title: 'URL Required',
        description: 'Please enter a URL to ingest',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsIngesting(true);
      setLastResult(null);
      
      const response = await fetch('/api/ingest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: url.trim() }),
      });

      // Check if response is actually JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error(`Server returned non-JSON response: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();

      if (response.ok) {
        setLastResult(result);
        toast({
          title: 'Success!',
          description: `Successfully ingested ${result.chunks} chunks from "${result.title}"`,
        });
      } else {
        setLastResult({ ...result, ok: false });
        toast({
          title: 'Ingestion Failed',
          description: result.error || 'Failed to ingest content',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Ingest error:', error);
      toast({
        title: 'Network Error',
        description: 'Failed to connect to the server',
        variant: 'destructive',
      });
    } finally {
      setIsIngesting(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleIngest();
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="h-5 w-5" />
          URL Knowledge Ingestion
        </CardTitle>
        <CardDescription>
          Extract and index content from any public webpage for AI chat
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="url">Website URL</Label>
            <Input
              id="url"
              type="url"
              placeholder="https://example.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={isIngesting}
              data-testid="input-url"
            />
          </div>
          
          <Button 
            type="submit" 
            disabled={isIngesting}
            className="w-full"
            data-testid="button-ingest"
          >
            {isIngesting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Ingesting Content...
              </>
            ) : (
              'Ingest Content'
            )}
          </Button>
        </form>

        {lastResult && (
          <div className="mt-4 p-4 border rounded-lg">
            {lastResult.ok ? (
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-medium text-green-600" data-testid="text-success">
                    Successfully Ingested
                  </p>
                  <p className="text-sm text-muted-foreground">
                    <strong>Title:</strong> {lastResult.title}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    <strong>Chunks:</strong> {lastResult.chunks}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    <strong>URL:</strong> {lastResult.url}
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-medium text-red-600" data-testid="text-error">
                    Ingestion Failed
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {lastResult.error}
                  </p>
                  {lastResult.error?.includes('Try crawler') && (
                    <p className="text-sm text-blue-600">
                      This page may require advanced crawling. Consider using a specialized crawler API.
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}