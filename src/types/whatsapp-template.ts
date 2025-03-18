
export type TemplateType = 
  | 'text'
  | 'media'
  | 'carousel'
  | 'catalogue'
  | 'multi-product'
  | 'order-details'
  | 'order-status';

export type TemplateCategory = 
  | 'marketing'
  | 'utility'
  | 'authentication';

export type TemplateStatus = 
  | 'draft'
  | 'pending'
  | 'approved'
  | 'rejected';

export type VariableType = 
  | 'user_attribute'
  | 'payload_param'
  | 'product_property';

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
    type: 'image' | 'video' | 'document';
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
    algorithm: 'best_selling' | 'recently_viewed' | 'recommended_for_you';
    count: number;
  };
}
