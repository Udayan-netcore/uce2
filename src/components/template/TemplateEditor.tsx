
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Template, TemplateSection, Variable, VariableType } from "@/types/whatsapp-template";
import { 
  createVariable, 
  TEMPLATE_SECTION_LIMITS, 
  countCharacters, 
  isOverCharacterLimit 
} from "@/utils/template-utils";
import { 
  Bold, 
  Italic, 
  Smile, 
  Variable as VariableIcon,
  Save,
  Send
} from "lucide-react";
import WhatsAppPreview from "./WhatsAppPreview";
import VariableMenu from "./VariableMenu";
import { useToast } from "@/components/ui/use-toast";

interface TemplateEditorProps {
  template: Template;
  onSave: (template: Template, isDraft: boolean) => void;
}

export default function TemplateEditor({ template, onSave }: TemplateEditorProps) {
  const [currentTemplate, setCurrentTemplate] = useState<Template>(template);
  const [activeSection, setActiveSection] = useState<'header' | 'body' | 'footer'>('body');
  const [showVariableMenu, setShowVariableMenu] = useState(false);
  const [variableMenuPosition, setVariableMenuPosition] = useState({ x: 0, y: 0 });
  const [selectedVariableType, setSelectedVariableType] = useState<VariableType>('user_attribute');
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();

  const handleSectionChange = (content: string) => {
    setCurrentTemplate(prev => {
      const newTemplate = { ...prev };
      const sectionIndex = newTemplate.sections.findIndex(s => s.type === activeSection);
      
      if (sectionIndex !== -1) {
        newTemplate.sections[sectionIndex] = {
          ...newTemplate.sections[sectionIndex],
          content
        };
      }
      
      return newTemplate;
    });
  };

  const handleAddVariable = (variableName: string, type: VariableType) => {
    // Only add if we have a textarea to insert into
    if (!textAreaRef.current) return;
    
    const textarea = textAreaRef.current;
    const cursorPos = textarea.selectionStart;
    const textBefore = textarea.value.substring(0, cursorPos);
    const textAfter = textarea.value.substring(cursorPos);
    
    // Create the variable placeholder
    const variablePlaceholder = `{{${variableName}}}`;
    
    // Insert at cursor position
    const newText = textBefore + variablePlaceholder + textAfter;
    
    // Update the section
    handleSectionChange(newText);
    
    // Add the variable to the section's variables array if it's not already there
    setCurrentTemplate(prev => {
      const sectionIndex = prev.sections.findIndex(s => s.type === activeSection);
      
      if (sectionIndex === -1) return prev;
      
      const sectionVariables = [...prev.sections[sectionIndex].variables];
      if (!sectionVariables.some(v => v.name === variableName)) {
        sectionVariables.push(createVariable(variableName, type));
      }
      
      const newSections = [...prev.sections];
      newSections[sectionIndex] = {
        ...newSections[sectionIndex],
        variables: sectionVariables
      };
      
      return {
        ...prev,
        sections: newSections
      };
    });
    
    // Hide the variable menu
    setShowVariableMenu(false);
    
    // Focus back on textarea and set cursor after the inserted variable
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = cursorPos + variablePlaceholder.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  const handleOpenVariableMenu = () => {
    if (!textAreaRef.current) return;
    
    const textarea = textAreaRef.current;
    const textareaRect = textarea.getBoundingClientRect();
    
    setVariableMenuPosition({ 
      x: textareaRect.x + textareaRect.width / 2,
      y: textareaRect.y
    });
    
    setShowVariableMenu(true);
  };

  const handleSaveDraft = () => {
    onSave(currentTemplate, true);
    toast({
      title: "Template saved as draft",
      description: "Your template has been saved. You can continue editing it later.",
    });
  };

  const handleSendForApproval = () => {
    // Validate the template first
    const emptySection = currentTemplate.sections.find(section => 
      section.content.trim() === '' && section.type === 'body'
    );
    
    if (emptySection) {
      toast({
        title: "Validation Error",
        description: "Body section cannot be empty when submitting for approval.",
        variant: "destructive"
      });
      return;
    }
    
    const overLimitSection = currentTemplate.sections.find(section => 
      isOverCharacterLimit(section)
    );
    
    if (overLimitSection) {
      toast({
        title: "Validation Error",
        description: `${overLimitSection.type.charAt(0).toUpperCase() + overLimitSection.type.slice(1)} exceeds character limit.`,
        variant: "destructive"
      });
      return;
    }
    
    onSave({
      ...currentTemplate,
      status: 'pending'
    }, false);
    
    toast({
      title: "Template submitted for approval",
      description: "Your template has been submitted and is pending approval.",
    });
  };

  // Get the current section for display
  const activeTemplateSection = currentTemplate.sections.find(
    section => section.type === activeSection
  );

  const getCharacterCount = (section?: TemplateSection) => {
    if (!section) return 0;
    return countCharacters(section.content);
  };

  const isOverLimit = (section?: TemplateSection) => {
    if (!section) return false;
    return isOverCharacterLimit(section);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-7 gap-6">
      <div className="lg:col-span-4">
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Configure template</h2>
          
          <div className="mb-6">
            <Label htmlFor="template-name">Template Name</Label>
            <Input
              id="template-name"
              value={currentTemplate.name}
              onChange={(e) => setCurrentTemplate({...currentTemplate, name: e.target.value})}
              className="mt-1"
              placeholder="Enter template name"
            />
          </div>
          
          <div className="mb-6">
            <Label className="mb-2 block">Template Type</Label>
            <div className="flex">
              <Button
                variant={currentTemplate.isStatic ? "default" : "outline"}
                className="rounded-l-md rounded-r-none flex-1"
                onClick={() => setCurrentTemplate({...currentTemplate, isStatic: true})}
              >
                Static
              </Button>
              <Button
                variant={!currentTemplate.isStatic ? "default" : "outline"}
                className="rounded-r-md rounded-l-none flex-1"
                onClick={() => setCurrentTemplate({...currentTemplate, isStatic: false})}
              >
                Dynamic
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              {currentTemplate.isStatic 
                ? "A template where the message content remains the same for all recipients, but personalization can be added (e.g., customer name)."
                : "A flexible message template allowing the content to be personalized or updated dynamically based on user-specific data or context."}
            </p>
          </div>
          
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-3">Message content</h3>
            
            <Tabs defaultValue="body" onValueChange={(v) => setActiveSection(v as any)}>
              <TabsList className="mb-2">
                <TabsTrigger value="header">Header</TabsTrigger>
                <TabsTrigger value="body">Body</TabsTrigger>
                <TabsTrigger value="footer">Footer</TabsTrigger>
              </TabsList>
              
              {['header', 'body', 'footer'].map((sectionType) => (
                <TabsContent key={sectionType} value={sectionType}>
                  {sectionType === 'header' && (
                    <p className="text-sm text-muted-foreground mb-2">
                      Maximum 60 characters. Can contain one variable for media headers.
                    </p>
                  )}
                  
                  {sectionType === 'body' && (
                    <p className="text-sm text-muted-foreground mb-2">
                      The main message content. Maximum 1024 characters. Required.
                    </p>
                  )}
                  
                  {sectionType === 'footer' && (
                    <p className="text-sm text-muted-foreground mb-2">
                      Optional footer text. Maximum 60 characters.
                    </p>
                  )}
                  
                  <div className="relative">
                    <div className="flex items-center space-x-2 mb-2 bg-gray-50 p-2 rounded-t-md border border-b-0 border-gray-200">
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <Bold className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <Italic className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <Smile className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 px-2"
                        onClick={handleOpenVariableMenu}
                      >
                        <VariableIcon className="h-4 w-4 mr-1" />
                        <span>Variable</span>
                      </Button>
                    </div>
                    
                    <textarea
                      ref={textAreaRef}
                      value={activeTemplateSection?.content || ''}
                      onChange={(e) => handleSectionChange(e.target.value)}
                      className="w-full min-h-[150px] p-3 border border-gray-200 rounded-b-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder={`Enter ${sectionType} content here...`}
                    />
                    
                    <div className={`character-counter ${isOverLimit(activeTemplateSection) ? 'over-limit' : ''}`}>
                      {getCharacterCount(activeTemplateSection)} / {activeTemplateSection?.characterLimit || 0} characters
                    </div>
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </div>
        </Card>
        
        <div className="flex justify-between mt-4">
          <Button variant="outline" onClick={handleSaveDraft}>
            <Save className="h-4 w-4 mr-2" />
            Save as Draft
          </Button>
          <Button onClick={handleSendForApproval}>
            <Send className="h-4 w-4 mr-2" />
            Send for Approval
          </Button>
        </div>
      </div>
      
      <div className="lg:col-span-3">
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Preview</h2>
          <WhatsAppPreview template={currentTemplate} />
        </Card>
      </div>
      
      {showVariableMenu && (
        <VariableMenu 
          position={variableMenuPosition}
          onSelectVariable={handleAddVariable}
          onClose={() => setShowVariableMenu(false)}
          selectedType={selectedVariableType}
          onChangeType={setSelectedVariableType}
        />
      )}
    </div>
  );
}
