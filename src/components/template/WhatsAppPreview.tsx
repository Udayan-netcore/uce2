
import { Template } from "@/types/whatsapp-template";
import { replaceVariablesWithValues } from "@/utils/template-utils";
import { MessageSquare, Check } from "lucide-react";

interface WhatsAppPreviewProps {
  template: Template;
}

export default function WhatsAppPreview({ template }: WhatsAppPreviewProps) {
  // Sample data for variable replacement in preview
  const sampleVariables: Record<string, string> = {
    customer_name: 'John',
    order_id: 'ORD12345',
    product_name: 'Summer T-shirt',
    price: '$29.99',
    tracking_link: 'https://track.example.com/ORD12345',
    discount_code: 'SUMMER20',
    store_name: 'Fashion Store',
    coupon_code: 'WELCOME10',
    store_address: '123 Main St, City',
    store_phone: '+1 234 567 8901',
    order_total: '$59.99',
    order_status: 'Shipped',
    delivery_date: 'June 15, 2023',
    product_list: '1x T-shirt, 2x Socks',
    purchased_product: 'Denim Jeans',
    customer_phone: '+1 987 654 3210',
    booking_id: 'BK789012',
    appointment_time: 'Tomorrow at 2 PM'
  };

  // Function to render the preview content with variables replaced
  const renderContent = (sectionType: 'header' | 'body' | 'footer') => {
    const section = template.sections.find(s => s.type === sectionType);
    if (!section || !section.content) return null;
    
    const replacedContent = replaceVariablesWithValues(section.content, sampleVariables);
    
    return (
      <div className="mb-2">
        {replacedContent}
      </div>
    );
  };

  // Function to render buttons if present
  const renderButtons = () => {
    if (!template.buttons || template.buttons.length === 0) return null;
    
    return (
      <div className="mt-3 border-t border-gray-200 pt-2">
        {template.buttons.map((button, index) => (
          <button 
            key={index}
            className="w-full text-center py-1 text-blue-600 hover:bg-gray-50 rounded mb-1"
          >
            {button.text}
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="whatsapp-phone-frame mx-auto">
      <div className="whatsapp-chat-header">
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 mr-2">
            SG
          </div>
          <div>
            <div className="font-medium text-sm">Sunshine Glow</div>
            <div className="text-xs opacity-80 flex items-center">
              <Check className="h-3 w-3 mr-1" /> Online
            </div>
          </div>
        </div>
        <div className="text-white">
          <span className="px-1">⋮</span>
        </div>
      </div>
      
      <div className="whatsapp-chat-body">
        <div className="flex justify-center mb-3">
          <div className="bg-white/80 text-gray-500 text-xs py-1 px-3 rounded-full">
            Today
          </div>
        </div>
        
        <div className="whatsapp-message whatsapp-message-sent">
          <MessageSquare className="h-4 w-4 text-gray-500 mb-1" />
          <div className="text-xs text-gray-500 mb-1">Template Preview</div>
          
          <div className="whatsapp-message-content text-sm">
            {renderContent('header')}
            {renderContent('body')}
            {renderContent('footer')}
            {renderButtons()}
          </div>
          
          <div className="text-right text-xs text-gray-500 mt-1">
            10:30 AM <Check className="h-3 w-3 inline ml-1 text-blue-500" />
          </div>
        </div>
        
        <div className="absolute bottom-0 left-0 right-0 p-2 bg-gray-100 border-t border-gray-200 flex items-center">
          <div className="flex-1 bg-white rounded-full p-2 text-gray-400 text-sm">
            Type a message
          </div>
        </div>
      </div>
    </div>
  );
}
