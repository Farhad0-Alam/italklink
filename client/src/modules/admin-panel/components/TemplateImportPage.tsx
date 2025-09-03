import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { Upload, FileText, ArrowLeft, AlertCircle, CheckCircle } from 'lucide-react';
import { Link } from 'wouter';

export default function TemplateImportPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [importResult, setImportResult] = useState<{
    success: boolean;
    message: string;
    templatesCount?: number;
  } | null>(null);
  const { toast } = useToast();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type === 'application/json') {
        setSelectedFile(file);
        setImportResult(null);
      } else {
        toast({
          title: "Invalid file type",
          description: "Please select a JSON file",
          variant: "destructive",
        });
      }
    }
  };

  const handleImport = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setImportResult(null);

    try {
      const fileContent = await selectedFile.text();
      const templateData = JSON.parse(fileContent);

      // Validate JSON structure
      if (!templateData.templates || !Array.isArray(templateData.templates)) {
        throw new Error('Invalid template format. Expected "templates" array.');
      }

      // Send to backend for processing
      const response = await fetch('/api/admin/templates/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: fileContent,
      });

      if (response.ok) {
        const result = await response.json();
        setImportResult({
          success: true,
          message: `Successfully imported ${result.count || templateData.templates.length} templates`,
          templatesCount: result.count || templateData.templates.length,
        });
        toast({
          title: "Import successful",
          description: `${result.count || templateData.templates.length} templates imported successfully`,
        });
      } else {
        const error = await response.text();
        throw new Error(error || 'Import failed');
      }
    } catch (error) {
      console.error('Import error:', error);
      setImportResult({
        success: false,
        message: error instanceof Error ? error.message : 'Import failed',
      });
      toast({
        title: "Import failed",
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Link href="/admin/templates">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Templates
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Import Templates</h1>
          <p className="text-gray-600">Import business card templates from JSON files</p>
        </div>
      </div>

      {/* File Format Information */}
      <Alert>
        <FileText className="h-4 w-4" />
        <AlertDescription>
          <strong>File Format Requirements:</strong>
          <ul className="mt-2 space-y-1 text-sm">
            <li>• JSON file with "templates" array</li>
            <li>• Each template must have: id, name, description, templateData</li>
            <li>• templateData should be an escaped JSON string</li>
            <li>• Include social icons with SVG codes</li>
            <li>• Template styles with colors and fonts</li>
          </ul>
        </AlertDescription>
      </Alert>

      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Upload className="h-5 w-5" />
            <span>Upload Template File</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="template-file">Select JSON File</Label>
            <Input
              id="template-file"
              type="file"
              accept=".json"
              onChange={handleFileSelect}
              className="mt-1"
            />
          </div>

          {selectedFile && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <FileText className="h-4 w-4 text-blue-500" />
                <span className="font-medium">{selectedFile.name}</span>
                <span className="text-sm text-gray-500">
                  ({(selectedFile.size / 1024).toFixed(1)} KB)
                </span>
              </div>
            </div>
          )}

          <Button
            onClick={handleImport}
            disabled={!selectedFile || isUploading}
            className="w-full"
          >
            {isUploading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Importing...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Import Templates
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Import Result */}
      {importResult && (
        <Alert className={importResult.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
          {importResult.success ? (
            <CheckCircle className="h-4 w-4 text-green-600" />
          ) : (
            <AlertCircle className="h-4 w-4 text-red-600" />
          )}
          <AlertDescription className={importResult.success ? "text-green-800" : "text-red-800"}>
            {importResult.message}
          </AlertDescription>
        </Alert>
      )}

      {/* Sample Format */}
      <Card>
        <CardHeader>
          <CardTitle>Sample JSON Format</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="text-xs bg-gray-100 p-4 rounded-lg overflow-x-auto">
{`{
  "templates": [
    {
      "id": "template_1_example",
      "name": "Example Template",
      "description": "Professional template with modern design",
      "templateData": "{\\"id\\":\\"template_1\\",\\"title\\":\\"Example\\",\\"profile\\":{\\"name\\":\\"John Doe\\",\\"tagline\\":\\"Software Engineer\\"},\\"socialIcons\\":[{\\"id\\":\\"linkedin\\",\\"name\\":\\"LinkedIn\\",\\"status\\\":1,\\"svg_code\\":\\"<svg>...</svg>\\"}],\\"templateStyle\\":{\\"primary_color\\":\\"#3b82f6\\",\\"bgcolor\\":\\"#ffffff\\"}}",
      "previewImage": "https://example.com/preview.jpg",
      "isActive": true
    }
  ]
}`}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
}