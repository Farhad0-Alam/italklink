import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Sparkles, Palette, Layout, Type, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AITemplateDesignerProps {
  onDesignGenerated: (design: any) => void;
  currentTemplate?: any;
}

interface DesignResponse {
  templateName: string;
  description: string;
  colors: {
    brandColor: string;
    accentColor: string;
    textColor: string;
    backgroundColor: string;
    headingColor: string;
    paragraphColor: string;
    secondaryColor: string;
    tertiaryColor: string;
  };
  layout: {
    template: 'minimal' | 'bold' | 'photo' | 'dark';
    headerDesign: 'cover-logo' | 'split-design' | 'profile-center';
  };
  typography: {
    fontSize: number;
    fontWeight: number;
    fontFamily: string;
  };
  reasoning: string;
}

export function AITemplateDesigner({ onDesignGenerated, currentTemplate }: AITemplateDesignerProps) {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [lastGenerated, setLastGenerated] = useState<DesignResponse | null>(null);
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Please describe your design",
        description: "Enter a description of how you want Template 2 to look",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch('/api/admin/ai-design-template', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt: prompt.trim(),
          currentTemplate 
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to generate design: ${response.statusText}`);
      }

      const design = await response.json();
      setLastGenerated(design);
      onDesignGenerated(design);
      
      toast({
        title: "Design generated successfully!",
        description: "Your AI-designed template is ready to preview",
      });

    } catch (error) {
      console.error('AI design generation failed:', error);
      toast({
        title: "Design generation failed",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const promptSuggestions = [
    "A modern professional business card with dark background and gold accents",
    "Clean minimalist design with bold typography and bright colors", 
    "Creative artistic layout with vibrant gradients and modern fonts",
    "Corporate executive style with navy blue and silver color scheme",
    "Tech startup vibe with neon colors and futuristic elements"
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-yellow-500" />
            AI Template Designer
          </CardTitle>
          <CardDescription>
            Describe your ideal business card design and let AI create it for you
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">
              Design Description
            </label>
            <Textarea
              placeholder="Describe how you want Template 2 to look... (e.g., 'A professional dark business card with gold accents, modern typography, and clean layout')"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={4}
              className="resize-none"
              data-testid="textarea-design-prompt"
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">
              Quick Suggestions
            </label>
            <div className="flex flex-wrap gap-2">
              {promptSuggestions.map((suggestion, index) => (
                <Badge 
                  key={index}
                  variant="outline" 
                  className="cursor-pointer hover:bg-muted"
                  onClick={() => setPrompt(suggestion)}
                  data-testid={`badge-suggestion-${index}`}
                >
                  {suggestion}
                </Badge>
              ))}
            </div>
          </div>

          <Button 
            onClick={handleGenerate}
            disabled={isGenerating || !prompt.trim()}
            className="w-full"
            data-testid="button-generate-design"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Designing with AI...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Generate Design
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {lastGenerated && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5 text-blue-500" />
              Generated Design: {lastGenerated.templateName}
            </CardTitle>
            <CardDescription>
              {lastGenerated.description}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-2 flex items-center gap-1">
                  <Palette className="h-4 w-4" />
                  Colors
                </h4>
                <div className="space-y-1 text-sm">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-4 h-4 rounded border"
                      style={{ backgroundColor: lastGenerated.colors.brandColor }}
                    />
                    Brand: {lastGenerated.colors.brandColor}
                  </div>
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-4 h-4 rounded border"
                      style={{ backgroundColor: lastGenerated.colors.accentColor }}
                    />
                    Accent: {lastGenerated.colors.accentColor}
                  </div>
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-4 h-4 rounded border"
                      style={{ backgroundColor: lastGenerated.colors.backgroundColor }}
                    />
                    Background: {lastGenerated.colors.backgroundColor}
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2 flex items-center gap-1">
                  <Layout className="h-4 w-4" />
                  Layout
                </h4>
                <div className="space-y-1 text-sm">
                  <div>Template: {lastGenerated.layout.template}</div>
                  <div>Header: {lastGenerated.layout.headerDesign}</div>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-2 flex items-center gap-1">
                <Type className="h-4 w-4" />
                Typography
              </h4>
              <div className="text-sm">
                Font: {lastGenerated.typography.fontFamily} | 
                Size: {lastGenerated.typography.fontSize}px | 
                Weight: {lastGenerated.typography.fontWeight}
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-2">AI Reasoning</h4>
              <p className="text-sm text-muted-foreground">
                {lastGenerated.reasoning}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}