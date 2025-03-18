
import { Template, TemplateSection, Variable, VariableType } from "../types/whatsapp-template";

export const TEMPLATE_SECTION_LIMITS = {
  header: 60,
  body: 1024,
  footer: 60,
  buttons: {
    quick_reply: 20,
    url: 20,
    phone: 20,
    flow: 256
  }
};

export const MAX_VARIABLES_PER_SECTION = 10;

export function generateTemplateId(): string {
  return `template_${Math.random().toString(36).substring(2, 11)}`;
}

export function createEmptyTemplate(type: Template['type']): Template {
  const now = new Date().toISOString();
  
  return {
    id: generateTemplateId(),
    name: `Untitled_${Math.floor(Math.random() * 1000)}`,
    type,
    category: 'marketing',
    status: 'draft',
    isStatic: false,
    sections: [
      {
        type: 'header',
        content: '',
        variables: [],
        characterLimit: TEMPLATE_SECTION_LIMITS.header
      },
      {
        type: 'body',
        content: '',
        variables: [],
        characterLimit: TEMPLATE_SECTION_LIMITS.body
      },
      {
        type: 'footer',
        content: '',
        variables: [],
        characterLimit: TEMPLATE_SECTION_LIMITS.footer
      }
    ],
    createdAt: now,
    updatedAt: now,
    language: 'en',
    buttons: []
  };
}

export function validateVariableName(name: string): boolean {
  // Variable names should be alphanumeric with underscores only, no spaces, start with letter
  return /^[a-zA-Z][a-zA-Z0-9_]*$/.test(name);
}

export function createVariable(name: string, type: VariableType, defaultValue: string = ''): Variable {
  return {
    id: `var_${Math.random().toString(36).substring(2, 9)}`,
    name,
    type,
    defaultValue
  };
}

export function parseVariablesInText(text: string): string[] {
  const variableRegex = /{{([^{}]+)}}/g;
  const matches = text.match(variableRegex) || [];
  return matches.map(match => match.replace(/{{|}}/g, ''));
}

export function replaceVariablesWithValues(text: string, variables: Record<string, string>): string {
  return text.replace(/{{([^{}]+)}}/g, (match, variableName) => {
    return variables[variableName] || match;
  });
}

export function countCharacters(text: string): number {
  // Special handling for WhatsApp character counting
  // Removes variable placeholders from count since WhatsApp counts the actual values
  const withoutVariables = text.replace(/{{[^{}]+}}/g, '');
  return withoutVariables.length;
}

export function isOverCharacterLimit(section: TemplateSection): boolean {
  const textWithoutVars = section.content.replace(/{{[^{}]+}}/g, '');
  return textWithoutVars.length > section.characterLimit;
}

export const TEMPLATE_TYPE_LABELS: Record<Template['type'], string> = {
  text: 'Text Message',
  media: 'Media Message',
  carousel: 'Carousel',
  catalogue: 'Catalogue',
  'multi-product': 'Multi-Product',
  'order-details': 'Order Details',
  'order-status': 'Order Status'
};

export const VARIABLE_TYPE_LABELS: Record<VariableType, string> = {
  user_attribute: 'User Attribute',
  payload_param: 'Payload Parameter',
  product_property: 'Product Property'
};

export const TEMPLATE_EXAMPLES: Record<Template['type'], string> = {
  text: "Hi {{customer_name}}, thank you for your order! Your order {{order_id}} has been confirmed and will be shipped soon.",
  media: "Check out our new collection! {{product_name}} is now available at {{price}}.",
  carousel: "Trending products you might like based on your recent purchase.",
  catalogue: "Browse our catalogue for items similar to {{product_name}}.",
  'multi-product': "Here are some products that pair well with {{purchased_product}}.",
  'order-details': "Your order {{order_id}} contains: {{product_list}}. Total: {{order_total}}.",
  'order-status': "Order status update: Your order {{order_id}} is now {{order_status}}."
};
