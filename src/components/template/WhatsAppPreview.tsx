
import { Template, CarouselItem } from "@/types/whatsapp-template";
import { replaceVariablesWithValues } from "@/utils/template-utils";
import { MessageSquare, Check, MapPin, Image, FileText, Video, ChevronRight, ChevronLeft, ShoppingCart } from "lucide-react";
import { useState } from "react";

interface WhatsAppPreviewProps {
  template: Template;
  sampleData?: {
    brandName?: string;
    productName?: string;
    productPrice?: string;
    discountCode?: string;
  };
}

export default function WhatsAppPreview({ template, sampleData }: WhatsAppPreviewProps) {
  const [activeCarouselItem, setActiveCarouselItem] = useState(0);

  // Sample data for variable replacement in preview
  const sampleVariables: Record<string, string> = {
    customer_name: 'John',
    order_id: 'ORD12345',
    product_name: sampleData?.productName || 'Summer T-shirt',
    price: sampleData?.productPrice || '$29.99',
    tracking_link: 'https://track.example.com/ORD12345',
    discount_code: sampleData?.discountCode || 'SUMMER20',
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
    appointment_time: 'Tomorrow at 2 PM',
    event_topic: 'AI in Marketing',
    event_date: 'October 15, 2023',
    event_time: '2:00 PM EST',
    first_name: 'John',
    last_name: 'Doe',
    user_name: 'John Doe',
    brand_name: sampleData?.brandName || 'Sunshine Glow',
    store_hours: '9 AM - 9 PM daily'
  };

  // Function to render the preview content with variables replaced
  const renderContent = (sectionType: 'header' | 'body' | 'footer') => {
    const section = template.sections.find(s => s.type === sectionType);
    if (!section || !section.content) return null;
    
    const replacedContent = replaceVariablesWithValues(section.content, sampleVariables);
    
    return (
      <div className="mb-2 whitespace-pre-wrap">
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

  // Function to render media if present
  const renderMedia = () => {
    if (!template.media) return null;

    let mediaContent;
    switch (template.media.type) {
      case 'image':
        mediaContent = (
          <div className="relative mb-3 bg-gray-100 rounded-lg overflow-hidden">
            <div className="aspect-w-16 aspect-h-9 flex items-center justify-center">
              <Image className="h-6 w-6 text-gray-400" />
              <span className="text-xs text-gray-500 mt-1">Image preview</span>
            </div>
          </div>
        );
        break;
      case 'video':
        mediaContent = (
          <div className="relative mb-3 bg-gray-100 rounded-lg overflow-hidden">
            <div className="aspect-w-16 aspect-h-9 flex items-center justify-center">
              <Video className="h-6 w-6 text-gray-400" />
              <span className="text-xs text-gray-500 mt-1">Video preview</span>
            </div>
          </div>
        );
        break;
      case 'document':
        mediaContent = (
          <div className="relative mb-3 bg-gray-100 p-3 rounded-lg flex items-center">
            <FileText className="h-5 w-5 text-gray-400 mr-2" />
            <span className="text-xs text-gray-700">Document.pdf</span>
          </div>
        );
        break;
      case 'location':
        mediaContent = (
          <div className="relative mb-3 bg-gray-100 rounded-lg overflow-hidden">
            <div className="aspect-w-16 aspect-h-9 flex flex-col items-center justify-center">
              <MapPin className="h-6 w-6 text-gray-400" />
              <span className="text-xs text-gray-500 mt-1">Location preview</span>
            </div>
          </div>
        );
        break;
    }

    return mediaContent;
  };

  // Function to render carousel if present
  const renderCarousel = () => {
    if (!template.carouselItems || template.carouselItems.length === 0) {
      // If there's product recommendation but no carousel items, show placeholder
      if (template.productRecommendation?.enabled) {
        return renderProductRecommendations();
      }
      return null;
    }
    
    const totalItems = template.carouselItems.length;
    const currentItem = template.carouselItems[activeCarouselItem];
    
    const handlePrev = () => {
      setActiveCarouselItem(prev => (prev - 1 + totalItems) % totalItems);
    };
    
    const handleNext = () => {
      setActiveCarouselItem(prev => (prev + 1) % totalItems);
    };
    
    return (
      <div className="relative mb-3 border border-gray-200 rounded-lg overflow-hidden">
        <div className="bg-gray-100 aspect-w-1 aspect-h-1 flex items-center justify-center">
          {currentItem.imageUrl ? (
            <img 
              src={currentItem.imageUrl} 
              alt={currentItem.title}
              className="object-cover w-full h-full"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = 'https://placehold.co/600x400/png?text=Product';
              }}
            />
          ) : (
            <>
              <Image className="h-6 w-6 text-gray-400" />
              <span className="text-xs text-gray-500 mt-1">{currentItem.title}</span>
            </>
          )}
        </div>
        
        <div className="p-2 bg-white">
          <h4 className="font-medium text-sm">{currentItem.title}</h4>
          <p className="text-xs text-gray-600">{currentItem.description}</p>
          
          {currentItem.buttons && currentItem.buttons.length > 0 && (
            <button className="w-full text-center py-1 text-blue-600 text-sm mt-2 border-t border-gray-100 pt-1">
              {currentItem.buttons[0].text}
            </button>
          )}
        </div>
        
        {totalItems > 1 && (
          <div className="absolute inset-y-0 left-0 right-0 flex justify-between items-center">
            <button 
              onClick={handlePrev}
              className="bg-white/70 p-1 rounded-full shadow-sm ml-1"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button 
              onClick={handleNext}
              className="bg-white/70 p-1 rounded-full shadow-sm mr-1"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
        
        {totalItems > 1 && (
          <div className="absolute bottom-0 left-0 right-0 flex justify-center pb-1">
            {template.carouselItems.map((_, index) => (
              <div 
                key={index}
                className={`h-1.5 w-1.5 rounded-full mx-0.5 ${
                  index === activeCarouselItem ? 'bg-blue-500' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    );
  };

  // Function to render product recommendations if present
  const renderProductRecommendations = () => {
    if (!template.productRecommendation?.enabled) return null;
    
    const count = template.productRecommendation.count || 4;
    const productItems: CarouselItem[] = [];
    
    // Generate sample product items based on count
    for (let i = 0; i < count; i++) {
      productItems.push({
        title: `${sampleData?.productName || 'Product'} ${i+1}`,
        description: `${sampleData?.productPrice || '$29.99'}`,
        imageUrl: `https://placehold.co/600x400/png?text=Product${i+1}`
      });
    }
    
    return (
      <div className="relative mb-3 border border-gray-200 rounded-lg overflow-hidden">
        <div className="bg-gray-100 aspect-w-1 aspect-h-1 flex items-center justify-center">
          <img 
            src={productItems[activeCarouselItem]?.imageUrl} 
            alt={productItems[activeCarouselItem]?.title}
            className="object-cover w-full h-full"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = 'https://placehold.co/600x400/png?text=Product';
            }}
          />
        </div>
        
        <div className="p-2 bg-white">
          <h4 className="font-medium text-sm">{productItems[activeCarouselItem]?.title}</h4>
          <p className="text-xs text-gray-600">{productItems[activeCarouselItem]?.description}</p>
          
          <button className="w-full text-center py-1 text-blue-600 text-sm mt-2 border-t border-gray-100 pt-1">
            View Product
          </button>
        </div>
        
        {productItems.length > 1 && (
          <div className="absolute inset-y-0 left-0 right-0 flex justify-between items-center">
            <button 
              onClick={() => setActiveCarouselItem(prev => (prev - 1 + productItems.length) % productItems.length)}
              className="bg-white/70 p-1 rounded-full shadow-sm ml-1"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button 
              onClick={() => setActiveCarouselItem(prev => (prev + 1) % productItems.length)}
              className="bg-white/70 p-1 rounded-full shadow-sm mr-1"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
        
        {productItems.length > 1 && (
          <div className="absolute bottom-0 left-0 right-0 flex justify-center pb-1">
            {productItems.map((_, index) => (
              <div 
                key={index}
                className={`h-1.5 w-1.5 rounded-full mx-0.5 ${
                  index === activeCarouselItem ? 'bg-blue-500' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="whatsapp-phone-frame mx-auto">
      <div className="whatsapp-chat-header">
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 mr-2">
            {sampleData?.brandName ? sampleData.brandName.substring(0, 2).toUpperCase() : 'SG'}
          </div>
          <div>
            <div className="font-medium text-sm">{sampleData?.brandName || 'Sunshine Glow'}</div>
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
            
            {template.type === 'carousel' ? 
              renderCarousel() : 
              template.productRecommendation?.enabled ? 
                renderProductRecommendations() : 
                renderMedia()
            }
            
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
