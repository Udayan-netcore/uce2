
export type TemplateType = 
  | 'text'
  | 'media'
  | 'carousel'
  | 'catalogue'
  | 'multi-product'
  | 'order-details'
  | 'order-status'
  | 'location'
  | 'multi-language'
  | 'interactive'
  | 'sequential';

export type TemplateCategory = 
  | 'marketing'
  | 'utility'
  | 'authentication'
  | 'support'
  | 'onboarding'
  | 'feedback';

export type TemplateStatus = 
  | 'draft'
  | 'pending'
  | 'approved'
  | 'rejected';

export type VariableType = 
  | 'user_attribute'
  | 'payload_param'
  | 'product_property'
  | 'event_data'
  | 'order_data'
  | 'location_data';

export interface Variable {
  id: string;
  name: string;
  type: VariableType;
  defaultValue: string;
}

export interface TemplateSection {
  type: 'header' | 'body' | 'footer' | 'buttons';
  content: string;
  variables: Variable[];
  characterLimit: number;
}

export interface CarouselItem {
  title: string;
  description: string;
  imageUrl: string;
  buttons?: {
    type: 'quick_reply' | 'url' | 'phone' | 'flow';
    text: string;
    value?: string;
  }[];
}

export interface ProductRecommendation {
  algorithm: 'best_selling' | 'recently_viewed' | 'recommended_for_you' | 'top_sellers' | 'new_arrivals' | 'trending' | 'frequently_bought_together' | 'similar_products';
  source: string;
  count: number;
  fallbackAlgorithm?: string;
}

export interface Template {
  id: string;
  name: string;
  type: TemplateType;
  category: TemplateCategory;
  status: TemplateStatus;
  isStatic: boolean;
  sections: TemplateSection[];
  createdAt: string;
  updatedAt: string;
  language: string;
  media?: {
    type: 'image' | 'video' | 'document' | 'location';
    url: string;
  };
  buttons?: {
    type: 'quick_reply' | 'url' | 'phone' | 'flow';
    text: string;
    value?: string;
  }[];
  productRecommendation?: {
    enabled: boolean;
    source: string;
    algorithm: 'best_selling' | 'recently_viewed' | 'recommended_for_you' | 'top_sellers' | 'new_arrivals' | 'trending' | 'frequently_bought_together' | 'similar_products';
    count: number;
  };
  carouselItems?: CarouselItem[];
  languages?: string[];
  triggerKeywords?: string[];
  useCase?: string;
}
