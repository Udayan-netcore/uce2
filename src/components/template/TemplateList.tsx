
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Template } from "@/types/whatsapp-template";
import { TEMPLATE_TYPE_LABELS } from "@/utils/template-utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Search, Filter, PlusCircle } from "lucide-react";

interface TemplateListProps {
  templates: Template[];
  onSelectTemplate: (template: Template) => void;
  onCreateNew: () => void;
}

export default function TemplateList({ 
  templates, 
  onSelectTemplate, 
  onCreateNew 
}: TemplateListProps) {
  const [activeTab, setActiveTab] = useState<'gallery' | 'saved' | 'archived'>('gallery');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Filter templates based on active tab and search term
  const filteredTemplates = templates.filter(template => {
    const matchesTab = 
      (activeTab === 'gallery' && template.status === 'approved') ||
      (activeTab === 'saved' && template.status === 'draft') ||
      (activeTab === 'archived' && template.status === 'rejected');
      
    const matchesSearch = 
      template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.type.toLowerCase().includes(searchTerm.toLowerCase());
      
    return matchesTab && matchesSearch;
  });
  
  const getTemplateStatusClass = (status: Template['status']) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-amber-100 text-amber-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">WhatsApp Templates</h1>
        <Button onClick={onCreateNew}>
          <PlusCircle className="h-4 w-4 mr-2" />
          Create Template
        </Button>
      </div>
      
      <Tabs 
        defaultValue="gallery" 
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as any)}
        className="mb-6"
      >
        <div className="flex justify-between items-center mb-4">
          <TabsList>
            <TabsTrigger value="gallery">
              Template gallery ({templates.filter(t => t.status === 'approved').length})
            </TabsTrigger>
            <TabsTrigger value="saved">
              Saved templates ({templates.filter(t => t.status === 'draft').length})
            </TabsTrigger>
            <TabsTrigger value="archived">
              Archived templates ({templates.filter(t => t.status === 'rejected').length})
            </TabsTrigger>
          </TabsList>
          
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search templates"
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="mb-6">
          <h2 className="text-lg font-medium mb-3">
            {activeTab === 'gallery' ? 'Create a template by selecting a type' : 
             activeTab === 'saved' ? 'Your saved drafts' : 
             'Archived templates'}
          </h2>
          
          {filteredTemplates.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">
                {activeTab === 'gallery' ? 'No approved templates found.' : 
                 activeTab === 'saved' ? 'No saved drafts found.' : 
                 'No archived templates found.'}
              </p>
              <Button 
                variant="outline" 
                onClick={onCreateNew}
                className="mt-4"
              >
                Create your first template
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTemplates.map((template) => (
                <Card 
                  key={template.id}
                  className="p-4 cursor-pointer hover:border-primary hover:shadow-md transition-all"
                  onClick={() => onSelectTemplate(template)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">{template.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {TEMPLATE_TYPE_LABELS[template.type]}
                      </p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${getTemplateStatusClass(template.status)}`}>
                      {template.status.charAt(0).toUpperCase() + template.status.slice(1)}
                    </span>
                  </div>
                  
                  <div className="mt-3 text-sm border-t border-gray-100 pt-3">
                    <p className="truncate text-muted-foreground">
                      {template.sections.find(s => s.type === 'body')?.content.substring(0, 60)}...
                    </p>
                  </div>
                  
                  <div className="mt-3 text-xs text-muted-foreground flex justify-between">
                    <span>Created: {new Date(template.createdAt).toLocaleDateString()}</span>
                    <span>{template.isStatic ? 'Static' : 'Dynamic'}</span>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </Tabs>
    </div>
  );
}
