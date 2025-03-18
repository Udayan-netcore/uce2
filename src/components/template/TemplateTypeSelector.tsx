
import { Card } from "@/components/ui/card";
import { TEMPLATE_TYPE_LABELS } from "@/utils/template-utils";
import { TemplateType } from "@/types/whatsapp-template";
import { 
  MessageSquare, 
  Image, 
  Layout, 
  ShoppingCart, 
  ListChecks, 
  Package, 
  Truck 
} from "lucide-react";

interface TemplateTypeSelectorProps {
  onSelectType: (type: TemplateType) => void;
}

const TEMPLATE_TYPE_ICONS = {
  text: <MessageSquare className="h-10 w-10 text-blue-500" />,
  media: <Image className="h-10 w-10 text-purple-500" />,
  carousel: <Layout className="h-10 w-10 text-green-500" />,
  catalogue: <ShoppingCart className="h-10 w-10 text-amber-500" />,
  'multi-product': <ListChecks className="h-10 w-10 text-pink-500" />,
  'order-details': <Package className="h-10 w-10 text-indigo-500" />,
  'order-status': <Truck className="h-10 w-10 text-orange-500" />
};

export default function TemplateTypeSelector({ onSelectType }: TemplateTypeSelectorProps) {
  const templateTypes = Object.keys(TEMPLATE_TYPE_LABELS) as TemplateType[];

  return (
    <div className="w-full">
      <h2 className="text-2xl font-semibold mb-4">Select a template type</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {templateTypes.map((type) => (
          <Card 
            key={type}
            className="p-4 cursor-pointer hover:border-primary hover:shadow-md transition-all"
            onClick={() => onSelectType(type)}
          >
            <div className="flex flex-col items-center text-center p-4">
              {TEMPLATE_TYPE_ICONS[type]}
              <h3 className="mt-3 font-medium text-lg">{TEMPLATE_TYPE_LABELS[type]}</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {type === 'text' ? 'Simple text message template' : 
                 type === 'media' ? 'Template with image, video or document' :
                 type === 'carousel' ? 'Scrollable product cards' :
                 type === 'catalogue' ? 'Product catalogue display' :
                 type === 'multi-product' ? 'Multiple product showcase' :
                 type === 'order-details' ? 'Order details template' :
                 'Order status updates template'}
              </p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
