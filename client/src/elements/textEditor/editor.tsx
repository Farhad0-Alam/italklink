import { useState, useEffect, useCallback, useRef } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { ElementEditorPanel, useElementEditorTabs } from "@/components/ElementEditorTabs";
import { 
  TypographyPanel, 
  SpacingPanel, 
  BackgroundPanel,
  VisibilitySettingsPanel, 
  AdvancedSettingsPanel,
  AnimationPanel
} from "@/components/SharedEditorPanels";
import { ElementEditorProps } from "../registry/types";
import { Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, AlignJustify, List, ListOrdered, Link } from "lucide-react";

function TextEditorContentPanel({ data, onChange }: { data: any; onChange: (data: any) => void }) {
  const [showHtmlMode, setShowHtmlMode] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);
  
  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      onChange({ ...data, content: editorRef.current.innerHTML });
    }
  };

  const handleEditorInput = () => {
    if (editorRef.current) {
      onChange({ ...data, content: editorRef.current.innerHTML });
    }
  };

  useEffect(() => {
    if (editorRef.current && !showHtmlMode) {
      if (editorRef.current.innerHTML !== (data.content || "")) {
        editorRef.current.innerHTML = data.content || "<p>Add your text here...</p>";
      }
    }
  }, [data.content, showHtmlMode]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-xs font-medium text-slate-300">Text Content</Label>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-slate-400">HTML Mode</span>
          <Switch
            checked={showHtmlMode}
            onCheckedChange={setShowHtmlMode}
            className="scale-75"
          />
        </div>
      </div>

      {!showHtmlMode && (
        <div className="flex items-center gap-1 p-1 bg-slate-700 rounded-md mb-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => execCommand("bold")}
            className="h-7 w-7 p-0 text-slate-300 hover:text-white hover:bg-slate-600"
            title="Bold"
          >
            <Bold className="w-3.5 h-3.5" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => execCommand("italic")}
            className="h-7 w-7 p-0 text-slate-300 hover:text-white hover:bg-slate-600"
            title="Italic"
          >
            <Italic className="w-3.5 h-3.5" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => execCommand("underline")}
            className="h-7 w-7 p-0 text-slate-300 hover:text-white hover:bg-slate-600"
            title="Underline"
          >
            <Underline className="w-3.5 h-3.5" />
          </Button>
          <div className="w-px h-4 bg-slate-600 mx-1" />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => { execCommand("justifyLeft"); onChange({ ...data, alignment: "left" }); }}
            className={`h-7 w-7 p-0 ${data.alignment === "left" || !data.alignment ? "bg-slate-600 text-white" : "text-slate-300 hover:text-white hover:bg-slate-600"}`}
            title="Align Left"
          >
            <AlignLeft className="w-3.5 h-3.5" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => { execCommand("justifyCenter"); onChange({ ...data, alignment: "center" }); }}
            className={`h-7 w-7 p-0 ${data.alignment === "center" ? "bg-slate-600 text-white" : "text-slate-300 hover:text-white hover:bg-slate-600"}`}
            title="Align Center"
          >
            <AlignCenter className="w-3.5 h-3.5" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => { execCommand("justifyRight"); onChange({ ...data, alignment: "right" }); }}
            className={`h-7 w-7 p-0 ${data.alignment === "right" ? "bg-slate-600 text-white" : "text-slate-300 hover:text-white hover:bg-slate-600"}`}
            title="Align Right"
          >
            <AlignRight className="w-3.5 h-3.5" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => { execCommand("justifyFull"); onChange({ ...data, alignment: "justify" }); }}
            className={`h-7 w-7 p-0 ${data.alignment === "justify" ? "bg-slate-600 text-white" : "text-slate-300 hover:text-white hover:bg-slate-600"}`}
            title="Justify"
          >
            <AlignJustify className="w-3.5 h-3.5" />
          </Button>
          <div className="w-px h-4 bg-slate-600 mx-1" />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => execCommand("insertUnorderedList")}
            className="h-7 w-7 p-0 text-slate-300 hover:text-white hover:bg-slate-600"
            title="Bullet List"
          >
            <List className="w-3.5 h-3.5" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => execCommand("insertOrderedList")}
            className="h-7 w-7 p-0 text-slate-300 hover:text-white hover:bg-slate-600"
            title="Numbered List"
          >
            <ListOrdered className="w-3.5 h-3.5" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              const url = prompt("Enter link URL:");
              if (url) execCommand("createLink", url);
            }}
            className="h-7 w-7 p-0 text-slate-300 hover:text-white hover:bg-slate-600"
            title="Insert Link"
          >
            <Link className="w-3.5 h-3.5" />
          </Button>
        </div>
      )}

      {showHtmlMode ? (
        <Textarea
          value={data.content || ""}
          onChange={(e) => onChange({ ...data, content: e.target.value })}
          placeholder="<p>Enter HTML content...</p>"
          className="min-h-[200px] text-sm bg-slate-700 border-slate-600 text-white placeholder-slate-400 font-mono"
        />
      ) : (
        <div
          ref={editorRef}
          contentEditable
          onInput={handleEditorInput}
          onBlur={handleEditorInput}
          className="min-h-[200px] p-3 text-sm bg-slate-700 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent prose prose-sm prose-invert max-w-none"
          style={{ 
            whiteSpace: "pre-wrap",
            overflowWrap: "break-word"
          }}
          suppressContentEditableWarning
        />
      )}

      <div className="text-[10px] text-slate-500">
        {showHtmlMode 
          ? "Edit raw HTML directly. Supports p, h1-h6, strong, em, u, a, ul, ol, li tags."
          : "Click in the editor above and use the toolbar to format text. Select text first, then click a formatting button."
        }
      </div>

      <div>
        <Label className="text-xs font-medium text-slate-300 mb-1 block">Drop Cap</Label>
        <div className="flex items-center gap-2">
          <Switch
            checked={data.dropCap || false}
            onCheckedChange={(checked) => onChange({ ...data, dropCap: checked })}
          />
          <span className="text-xs text-slate-400">Enable drop cap for first letter</span>
        </div>
      </div>

      <div>
        <Label className="text-xs font-medium text-slate-300 mb-1 block">Columns</Label>
        <select
          value={data.columns || 1}
          onChange={(e) => onChange({ ...data, columns: parseInt(e.target.value) })}
          className="w-full px-3 py-2 text-sm bg-slate-700 border border-slate-600 rounded-md text-white"
        >
          <option value={1}>1 Column</option>
          <option value={2}>2 Columns</option>
          <option value={3}>3 Columns</option>
        </select>
      </div>
    </div>
  );
}

function TextEditorDesignPanel({ data, onChange, cardData }: { data: any; onChange: (data: any) => void; cardData?: any }) {
  return (
    <div className="space-y-6">
      <div className="border-b border-slate-700 pb-4">
        <h4 className="text-sm font-medium text-slate-200 mb-3">Typography</h4>
        <TypographyPanel data={data} onChange={onChange} cardData={cardData} />
      </div>

      <div className="border-b border-slate-700 pb-4">
        <h4 className="text-sm font-medium text-slate-200 mb-3">Text Options</h4>
        <div className="space-y-3">
          <div>
            <Label className="text-xs text-slate-300 mb-1 block">Line Height</Label>
            <Slider
              value={[data.lineHeight || 1.6]}
              onValueChange={([value]) => onChange({ ...data, lineHeight: value })}
              min={1}
              max={3}
              step={0.1}
              className="w-full"
            />
            <span className="text-[10px] text-slate-500">{data.lineHeight || 1.6}</span>
          </div>

          <div>
            <Label className="text-xs text-slate-300 mb-1 block">Letter Spacing</Label>
            <Input
              value={data.letterSpacing || "normal"}
              onChange={(e) => onChange({ ...data, letterSpacing: e.target.value })}
              placeholder="e.g., 0.5px, 1px, normal"
              className="text-sm bg-slate-700 border-slate-600 text-white"
            />
          </div>

          <div>
            <Label className="text-xs text-slate-300 mb-1 block">Word Spacing</Label>
            <Input
              value={data.wordSpacing || "normal"}
              onChange={(e) => onChange({ ...data, wordSpacing: e.target.value })}
              placeholder="e.g., 2px, normal"
              className="text-sm bg-slate-700 border-slate-600 text-white"
            />
          </div>
        </div>
      </div>

      <div className="border-b border-slate-700 pb-4">
        <h4 className="text-sm font-medium text-slate-200 mb-3">Spacing</h4>
        <SpacingPanel data={data} onChange={onChange} />
      </div>

      <div>
        <h4 className="text-sm font-medium text-slate-200 mb-3">Background</h4>
        <BackgroundPanel data={data} onChange={onChange} />
      </div>
    </div>
  );
}

function TextEditorSettingsPanel({ data, onChange }: { data: any; onChange: (data: any) => void }) {
  return (
    <div className="space-y-6">
      <div className="border-b border-slate-700 pb-4">
        <h4 className="text-sm font-medium text-slate-200 mb-3">Visibility</h4>
        <VisibilitySettingsPanel data={data} onChange={onChange} />
      </div>

      <div className="border-b border-slate-700 pb-4">
        <h4 className="text-sm font-medium text-slate-200 mb-3">Animation</h4>
        <AnimationPanel data={data} onChange={onChange} />
      </div>

      <div>
        <h4 className="text-sm font-medium text-slate-200 mb-3">Advanced</h4>
        <AdvancedSettingsPanel data={data} onChange={onChange} />
      </div>
    </div>
  );
}

export function TextEditorEditor({ element, onUpdate, cardData }: ElementEditorProps) {
  const { activeTab, setActiveTab } = useElementEditorTabs("content");
  const elementIdRef = useRef(element.id);
  const isLocalUpdateRef = useRef(false);

  const [editorData, setEditorData] = useState(() => element.data || {});

  useEffect(() => {
    if (element.id !== elementIdRef.current) {
      elementIdRef.current = element.id;
      setEditorData(element.data || {});
    } else if (!isLocalUpdateRef.current && element.data) {
      setEditorData(element.data);
    }
    isLocalUpdateRef.current = false;
  }, [element.id, element.data]);

  const handleChange = useCallback((updatedData: any) => {
    isLocalUpdateRef.current = true;
    setEditorData(updatedData);
    onUpdate({ ...element, data: updatedData });
  }, [element, onUpdate]);

  return (
    <div className="h-full">
      <ElementEditorPanel
        activeTab={activeTab}
        onTabChange={setActiveTab}
        elementType="textEditor"
        elementTitle="Text Editor"
        compact
        contentPanel={
          <TextEditorContentPanel 
            data={editorData} 
            onChange={handleChange} 
          />
        }
        designPanel={
          <TextEditorDesignPanel 
            data={editorData} 
            onChange={handleChange}
            cardData={cardData}
          />
        }
        settingsPanel={
          <TextEditorSettingsPanel 
            data={editorData} 
            onChange={handleChange} 
          />
        }
      />
    </div>
  );
}
