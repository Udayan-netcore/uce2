
import { useState } from "react";
import TemplateTypeSelector from "@/components/template/TemplateTypeSelector";
import TemplateEditor from "@/components/template/TemplateEditor";
import TemplateList from "@/components/template/TemplateList";
import { TemplateType, Template } from "@/types/whatsapp-template";
import { createEmptyTemplate } from "@/utils/template-utils";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

// Sample data for templates
const SAMPLE_TEMPLATES: Template[] = [
  createEmptyTemplate('text'),
  createEmptyTemplate('media'),
  createEmptyTemplate('carousel')
].map((template, index) => ({
  ...template,
  name: `Sample Template ${index + 1}`,
  status: index === 0 ? 'approved' : index === 1 ? 'draft' : 'rejected',
  sections: template.sections.map(section => ({
    ...section,
    content: section.type === 'body' 
      ? 'Hi {{customer_name}}, thank you for your order! Your order {{order_id}} has been confirmed and will be shipped soon.'
      : section.type === 'header'
      ? 'Order Confirmation'
      : 'Thanks for shopping with us!'
  }))
}));

// Application states
type EditorState = 
  | { state: 'list' }
  | { state: 'type-selection' }
  | { state: 'editor', template: Template };

export default function Index() {
  const [editorState, setEditorState] = useState<EditorState>({ state: 'list' });
  const [templates, setTemplates] = useState<Template[]>(SAMPLE_TEMPLATES);
  const { toast } = useToast();

  const handleSelectTemplateType = (type: TemplateType) => {
    const newTemplate = createEmptyTemplate(type);
    setEditorState({ state: 'editor', template: newTemplate });
  };

  const handleSelectExistingTemplate = (template: Template) => {
    setEditorState({ state: 'editor', template });
  };

  const handleSaveTemplate = (template: Template, isDraft: boolean) => {
    // Update if exists, add if new
    setTemplates(prev => {
      const existingIndex = prev.findIndex(t => t.id === template.id);
      if (existingIndex !== -1) {
        const updated = [...prev];
        updated[existingIndex] = template;
        return updated;
      } else {
        return [...prev, template];
      }
    });
    
    // Navigate back to list view after saving
    if (!isDraft) {
      setEditorState({ state: 'list' });
    }
  };

  const handleCreateNew = () => {
    setEditorState({ state: 'type-selection' });
  };

  const handleBackToList = () => {
    setEditorState({ state: 'list' });
  };

  // Render different content based on editor state
  const renderContent = () => {
    switch (editorState.state) {
      case 'list':
        return (
          <TemplateList
            templates={templates}
            onSelectTemplate={handleSelectExistingTemplate}
            onCreateNew={handleCreateNew}
          />
        );
      
      case 'type-selection':
        return (
          <>
            <div className="mb-4 flex items-center">
              <Button variant="ghost" onClick={handleBackToList} className="mr-2">
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back
              </Button>
              <h1 className="text-2xl font-bold">Create New Template</h1>
            </div>
            <TemplateTypeSelector onSelectType={handleSelectTemplateType} />
          </>
        );
      
      case 'editor':
        return (
          <>
            <div className="mb-6 flex items-center">
              <Button variant="ghost" onClick={handleBackToList} className="mr-2">
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back to templates
              </Button>
              <h1 className="text-xl font-bold">
                {editorState.template.name || 'Untitled Template'}
              </h1>
            </div>
            <TemplateEditor
              template={editorState.template}
              onSave={handleSaveTemplate}
            />
          </>
        );
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      {renderContent()}
    </div>
  );
}
