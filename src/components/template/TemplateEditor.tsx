
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Template, TemplateSection, Variable, VariableType, CarouselItem } from "@/types/whatsapp-template";
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
  Send,
  Image,
  Video,
  FileText,
  ShoppingCart,
  Globe,
  Plus,
  Trash
} from "lucide-react";
import WhatsAppPreview from "./WhatsAppPreview";
import VariableMenu from "./VariableMenu";
import { useToast } from "@/components/ui/use-toast";

interface TemplateEditorProps {
  template: Template;
  onSave: (template: Template, isDraft: boolean) => void;
}

const RECOMMENDATION_ALGORITHMS = [
  { value: 'best_selling', label: 'Best Selling Products' },
  { value: 'recently_viewed', label: 'Recently Viewed' },
  { value: 'recommended_for_you', label: 'Recommended For You' },
  { value: 'top_sellers', label: 'Top Sellers' },
  { value: 'new_arrivals', label: 'New Arrivals' },
  { value: 'trending', label: 'Trending Products' },
  { value: 'frequently_bought_together', label: 'Frequently Bought Together' },
  { value: 'similar_products', label: 'Similar Products' }
];

export default function TemplateEditor({ template, onSave }: TemplateEditorProps) {
  const [currentTemplate, setCurrentTemplate] = useState<Template>(template);
  const [activeSection, setActiveSection] = useState<'header' | 'body' | 'footer'>('body');
  const [showVariableMenu, setShowVariableMenu] = useState(false);
  const [variableMenuPosition, setVariableMenuPosition] = useState({ x: 0, y: 0 });
  const [selectedVariableType, setSelectedVariableType] = useState<VariableType>('user_attribute');
  const [activeTab, setActiveTab] = useState('content');
  const [sampleData, setSampleData] = useState({
    brandName: 'Sunshine Glow',
    productName: 'Summer Silk Dress',
    productPrice: '$129.99',
    discountCode: 'SUMMER20'
  });
  
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

  const handleAddButton = () => {
    if (!currentTemplate.buttons) {
      setCurrentTemplate({
        ...currentTemplate,
        buttons: [{ type: 'quick_reply', text: 'Reply' }]
      });
    } else if (currentTemplate.buttons.length < 3) { // WhatsApp allows max 3 buttons
      setCurrentTemplate({
        ...currentTemplate,
        buttons: [...currentTemplate.buttons, { type: 'quick_reply', text: 'Reply' }]
      });
    } else {
      toast({
        title: "Button limit reached",
        description: "WhatsApp templates can have a maximum of 3 buttons.",
        variant: "destructive"
      });
    }
  };

  const handleUpdateButton = (index: number, field: 'type' | 'text' | 'value', value: string) => {
    if (!currentTemplate.buttons) return;
    
    const updatedButtons = [...currentTemplate.buttons];
    updatedButtons[index] = {
      ...updatedButtons[index],
      [field]: value
    };
    
    setCurrentTemplate({
      ...currentTemplate,
      buttons: updatedButtons
    });
  };

  const handleRemoveButton = (index: number) => {
    if (!currentTemplate.buttons) return;
    
    setCurrentTemplate({
      ...currentTemplate,
      buttons: currentTemplate.buttons.filter((_, i) => i !== index)
    });
  };

  const handleEnableProductRecommendation = (enabled: boolean) => {
    if (enabled) {
      setCurrentTemplate({
        ...currentTemplate,
        productRecommendation: {
          enabled: true,
          source: 'default',
          algorithm: 'best_selling',
          count: 4
        }
      });
    } else {
      const { productRecommendation, ...rest } = currentTemplate;
      setCurrentTemplate(rest as Template);
    }
  };
  
  const handleUpdateProductRecommendation = (field: string, value: any) => {
    if (!currentTemplate.productRecommendation) return;
    
    setCurrentTemplate({
      ...currentTemplate,
      productRecommendation: {
        ...currentTemplate.productRecommendation,
        [field]: value
      }
    });
  };

  const handleAddCarouselItem = () => {
    if (!currentTemplate.carouselItems) {
      setCurrentTemplate({
        ...currentTemplate,
        carouselItems: [{
          title: 'Product Title',
          description: 'Product Description',
          imageUrl: 'https://placehold.co/600x400/png?text=Product'
        }]
      });
    } else if (currentTemplate.carouselItems.length < 10) { // WhatsApp allows max 10 carousel items
      setCurrentTemplate({
        ...currentTemplate,
        carouselItems: [
          ...currentTemplate.carouselItems,
          {
            title: 'Product Title',
            description: 'Product Description',
            imageUrl: 'https://placehold.co/600x400/png?text=Product'
          }
        ]
      });
    }
  };

  const handleUpdateCarouselItem = (index: number, field: keyof CarouselItem, value: any) => {
    if (!currentTemplate.carouselItems) return;
    
    const updatedItems = [...currentTemplate.carouselItems];
    updatedItems[index] = {
      ...updatedItems[index],
      [field]: value
    } as CarouselItem;
    
    setCurrentTemplate({
      ...currentTemplate,
      carouselItems: updatedItems
    });
  };

  const handleRemoveCarouselItem = (index: number) => {
    if (!currentTemplate.carouselItems) return;
    
    setCurrentTemplate({
      ...currentTemplate,
      carouselItems: currentTemplate.carouselItems.filter((_, i) => i !== index)
    });
  };

  const handleAddCarouselItemButton = (carouselIndex: number) => {
    if (!currentTemplate.carouselItems) return;
    
    const item = currentTemplate.carouselItems[carouselIndex];
    if (!item.buttons) {
      const updatedItems = [...currentTemplate.carouselItems];
      updatedItems[carouselIndex] = {
        ...item,
        buttons: [{ type: 'url', text: 'View Details' }]
      };
      
      setCurrentTemplate({
        ...currentTemplate,
        carouselItems: updatedItems
      });
    }
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
          
          <Tabs defaultValue="content" value={activeTab} onValueChange={setActiveTab} className="w-full mb-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="content">Content</TabsTrigger>
              <TabsTrigger value="products">Products</TabsTrigger>
              <TabsTrigger value="buttons">Buttons</TabsTrigger>
              <TabsTrigger value="sample-data">Sample Data</TabsTrigger>
            </TabsList>
            
            <TabsContent value="content">
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
                <Label className="mb-2 block">Language</Label>
                <Select 
                  value={currentTemplate.language} 
                  onValueChange={(value) => setCurrentTemplate({...currentTemplate, language: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="hi">Hindi</SelectItem>
                    <SelectItem value="th">Thai</SelectItem>
                    <SelectItem value="multi">Multi-language</SelectItem>
                  </SelectContent>
                </Select>
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
                          className={`w-full min-h-[150px] p-3 border border-gray-200 rounded-b-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${
                            isOverLimit(activeTemplateSection) ? 'border-red-500' : ''
                          }`}
                          placeholder={`Enter ${sectionType} content here...`}
                        />
                        
                        <div className={`text-sm mt-1 text-right ${isOverLimit(activeTemplateSection) ? 'text-red-500' : 'text-gray-500'}`}>
                          {getCharacterCount(activeTemplateSection)} / {activeTemplateSection?.characterLimit || 0} characters
                        </div>
                      </div>
                    </TabsContent>
                  ))}
                </Tabs>
              </div>
            </TabsContent>
            
            <TabsContent value="products">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-medium">Product Recommendations</Label>
                  <div className="flex items-center space-x-2">
                    <Label htmlFor="enable-recommendations" className="text-sm">Enable</Label>
                    <input 
                      type="checkbox"
                      id="enable-recommendations"
                      checked={!!currentTemplate.productRecommendation?.enabled}
                      onChange={(e) => handleEnableProductRecommendation(e.target.checked)}
                      className="h-4 w-4"
                    />
                  </div>
                </div>
                
                {currentTemplate.productRecommendation?.enabled && (
                  <div className="space-y-4 border rounded-md p-4">
                    <div>
                      <Label htmlFor="recommendation-algorithm">Recommendation Algorithm</Label>
                      <Select 
                        value={currentTemplate.productRecommendation.algorithm} 
                        onValueChange={(value: any) => handleUpdateProductRecommendation('algorithm', value)}
                      >
                        <SelectTrigger id="recommendation-algorithm">
                          <SelectValue placeholder="Select algorithm" />
                        </SelectTrigger>
                        <SelectContent>
                          {RECOMMENDATION_ALGORITHMS.map(algo => (
                            <SelectItem key={algo.value} value={algo.value}>{algo.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground mt-1">
                        Select the algorithm to determine which products to recommend
                      </p>
                    </div>
                    
                    <div>
                      <Label htmlFor="product-count">Number of Products</Label>
                      <Select 
                        value={currentTemplate.productRecommendation.count.toString()} 
                        onValueChange={(value) => handleUpdateProductRecommendation('count', parseInt(value))}
                      >
                        <SelectTrigger id="product-count">
                          <SelectValue placeholder="Select count" />
                        </SelectTrigger>
                        <SelectContent>
                          {[1, 2, 3, 4, 5, 6].map(num => (
                            <SelectItem key={num} value={num.toString()}>{num}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground mt-1">
                        Number of products to display in the recommendation
                      </p>
                    </div>
                    
                    <div>
                      <Label htmlFor="product-source">Product Source</Label>
                      <Select 
                        value={currentTemplate.productRecommendation.source} 
                        onValueChange={(value) => handleUpdateProductRecommendation('source', value)}
                      >
                        <SelectTrigger id="product-source">
                          <SelectValue placeholder="Select source" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="default">Default Catalog</SelectItem>
                          <SelectItem value="unbxd">Unbxd Product Feed</SelectItem>
                          <SelectItem value="custom">Custom Feed</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground mt-1">
                        Where the product data will be sourced from
                      </p>
                    </div>
                  </div>
                )}
                
                {currentTemplate.type === 'carousel' && (
                  <div className="mt-6">
                    <div className="flex items-center justify-between mb-3">
                      <Label className="text-base font-medium">Carousel Items</Label>
                      <Button size="sm" onClick={handleAddCarouselItem} className="h-8">
                        <Plus className="h-4 w-4 mr-1" />
                        Add Item
                      </Button>
                    </div>
                    
                    {currentTemplate.carouselItems && currentTemplate.carouselItems.length > 0 ? (
                      <div className="space-y-4">
                        {currentTemplate.carouselItems.map((item, index) => (
                          <div key={index} className="border rounded-md p-4 relative">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="absolute top-2 right-2 h-6 w-6 p-0"
                              onClick={() => handleRemoveCarouselItem(index)}
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                            
                            <div className="space-y-3">
                              <div>
                                <Label htmlFor={`carousel-item-${index}-title`}>Title</Label>
                                <Input
                                  id={`carousel-item-${index}-title`}
                                  value={item.title}
                                  onChange={(e) => handleUpdateCarouselItem(index, 'title', e.target.value)}
                                  placeholder="Product title"
                                />
                              </div>
                              
                              <div>
                                <Label htmlFor={`carousel-item-${index}-description`}>Description</Label>
                                <Textarea
                                  id={`carousel-item-${index}-description`}
                                  value={item.description}
                                  onChange={(e) => handleUpdateCarouselItem(index, 'description', e.target.value)}
                                  placeholder="Product description"
                                  className="min-h-[60px]"
                                />
                              </div>
                              
                              <div>
                                <Label htmlFor={`carousel-item-${index}-image`}>Image URL</Label>
                                <Input
                                  id={`carousel-item-${index}-image`}
                                  value={item.imageUrl}
                                  onChange={(e) => handleUpdateCarouselItem(index, 'imageUrl', e.target.value)}
                                  placeholder="https://example.com/product-image.jpg"
                                />
                              </div>
                              
                              {item.buttons ? (
                                <div>
                                  <Label className="mb-2 block">Button</Label>
                                  <div className="flex space-x-2">
                                    <Select 
                                      value={item.buttons[0].type} 
                                      onValueChange={(value: any) => {
                                        const updatedButtons = [...item.buttons!];
                                        updatedButtons[0] = { ...updatedButtons[0], type: value };
                                        handleUpdateCarouselItem(index, 'buttons', updatedButtons);
                                      }}
                                    >
                                      <SelectTrigger className="w-1/3">
                                        <SelectValue placeholder="Type" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="quick_reply">Quick Reply</SelectItem>
                                        <SelectItem value="url">URL</SelectItem>
                                        <SelectItem value="phone">Phone</SelectItem>
                                        <SelectItem value="flow">Flow</SelectItem>
                                      </SelectContent>
                                    </Select>
                                    
                                    <Input
                                      value={item.buttons[0].text}
                                      onChange={(e) => {
                                        const updatedButtons = [...item.buttons!];
                                        updatedButtons[0] = { ...updatedButtons[0], text: e.target.value };
                                        handleUpdateCarouselItem(index, 'buttons', updatedButtons);
                                      }}
                                      placeholder="Button text"
                                      className="flex-1"
                                    />
                                  </div>
                                </div>
                              ) : (
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="w-full mt-2"
                                  onClick={() => handleAddCarouselItemButton(index)}
                                >
                                  <Plus className="h-4 w-4 mr-1" />
                                  Add Button
                                </Button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="border rounded-md p-6 text-center text-muted-foreground">
                        <ShoppingCart className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p>No carousel items added yet.</p>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={handleAddCarouselItem}
                          className="mt-2"
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Add First Item
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="buttons">
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-3">
                  <Label className="text-base font-medium">Call-to-Action Buttons</Label>
                  <Button size="sm" onClick={handleAddButton} className="h-8">
                    <Plus className="h-4 w-4 mr-1" />
                    Add Button
                  </Button>
                </div>
                
                {currentTemplate.buttons && currentTemplate.buttons.length > 0 ? (
                  <div className="space-y-3">
                    {currentTemplate.buttons.map((button, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <Select 
                          value={button.type} 
                          onValueChange={(value: any) => handleUpdateButton(index, 'type', value)}
                        >
                          <SelectTrigger className="w-1/3">
                            <SelectValue placeholder="Type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="quick_reply">Quick Reply</SelectItem>
                            <SelectItem value="url">URL</SelectItem>
                            <SelectItem value="phone">Phone</SelectItem>
                            <SelectItem value="flow">Flow</SelectItem>
                          </SelectContent>
                        </Select>
                        
                        <Input
                          value={button.text}
                          onChange={(e) => handleUpdateButton(index, 'text', e.target.value)}
                          placeholder="Button text"
                          className="flex-1"
                        />
                        
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-10 w-10 p-0"
                          onClick={() => handleRemoveButton(index)}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="border rounded-md p-6 text-center text-muted-foreground">
                    <p>No buttons added yet.</p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleAddButton}
                      className="mt-2"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add First Button
                    </Button>
                  </div>
                )}
                
                <div className="mt-3 bg-blue-50 p-3 rounded-md">
                  <p className="text-sm text-blue-700">
                    <strong>WhatsApp Button Rules:</strong>
                  </p>
                  <ul className="text-xs text-blue-700 list-disc pl-4 mt-1 space-y-1">
                    <li>Maximum 3 buttons per template</li>
                    <li>Button text limited to 20 characters (except Flow buttons)</li>
                    <li>URL buttons must begin with https:// or http://</li>
                    <li>Phone numbers should include country code (e.g., +1234567890)</li>
                  </ul>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="sample-data">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="sample-brand">Brand Name</Label>
                  <Input 
                    id="sample-brand" 
                    value={sampleData.brandName}
                    onChange={e => setSampleData({...sampleData, brandName: e.target.value})}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Used in preview to simulate your brand name
                  </p>
                </div>
                
                <div>
                  <Label htmlFor="sample-product">Sample Product Name</Label>
                  <Input 
                    id="sample-product" 
                    value={sampleData.productName}
                    onChange={e => setSampleData({...sampleData, productName: e.target.value})}
                  />
                </div>
                
                <div>
                  <Label htmlFor="sample-price">Sample Price</Label>
                  <Input 
                    id="sample-price" 
                    value={sampleData.productPrice}
                    onChange={e => setSampleData({...sampleData, productPrice: e.target.value})}
                  />
                </div>
                
                <div>
                  <Label htmlFor="sample-discount">Sample Discount Code</Label>
                  <Input 
                    id="sample-discount" 
                    value={sampleData.discountCode}
                    onChange={e => setSampleData({...sampleData, discountCode: e.target.value})}
                  />
                </div>
                
                <div className="mt-3 bg-yellow-50 p-3 rounded-md">
                  <p className="text-sm text-yellow-700">
                    <strong>Note:</strong> This sample data will be used in the template preview for testing purposes only.
                    It will not be saved with the template or sent to customers.
                  </p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
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
          <WhatsAppPreview 
            template={currentTemplate} 
            sampleData={sampleData}
          />
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
