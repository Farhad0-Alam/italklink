import { Input } from "@/components/ui/input";
import { KnowledgeManager } from "@/components/KnowledgeManager";
import { ElementEditorProps } from "../registry/types";

export function RAGKnowledgeEditor({ element, onUpdate, cardData }: ElementEditorProps) {
  const elementData = element.data || {};

  const handleDataUpdate = (newData: any) => {
    onUpdate({ ...element, data: { ...(element.data || {}), ...newData } });
  };

  return (
    <div className="mb-4">
      <div className="p-4 bg-white rounded-lg border border-slate-200 space-y-4">
        <h4 className="text-md font-semibold text-slate-800">RAG Knowledge Base</h4>
        
        <div>
          <label className="text-sm font-medium text-slate-700 block mb-1">Input Placeholder</label>
          <Input
            value={elementData.placeholder || "Ask a question about our services..."}
            onChange={(e) => handleDataUpdate({ placeholder: e.target.value })}
            placeholder="Input placeholder"
          />
        </div>

        <div className="border-t pt-4">
          <KnowledgeManager cardId={cardData?.id} />
        </div>

        <div className="p-3 bg-purple-50 border border-purple-200 rounded-md">
          <p className="text-sm text-purple-800">
            <i className="fas fa-info-circle mr-2"></i>
            RAG-powered chatbot that answers questions using your knowledge base.
          </p>
        </div>
      </div>
    </div>
  );
}
