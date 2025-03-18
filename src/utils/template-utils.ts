import { Template, TemplateSection, Variable, VariableType, CarouselItem } from "../types/whatsapp-template";

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
  'order-status': 'Order Status',
  location: 'Location',
  'multi-language': 'Multi-Language',
  interactive: 'Interactive',
  sequential: 'Sequential'
};

export const VARIABLE_TYPE_LABELS: Record<VariableType, string> = {
  user_attribute: 'User Attribute',
  payload_param: 'Payload Parameter',
  product_property: 'Product Property',
  event_data: 'Event Data',
  order_data: 'Order Data',
  location_data: 'Location Data'
};

export const TEMPLATE_EXAMPLES: Record<Template['type'], string> = {
  text: "Hi {{customer_name}}, thank you for your order! Your order {{order_id}} has been confirmed and will be shipped soon.",
  media: "Check out our new collection! {{product_name}} is now available at {{price}}.",
  carousel: "Trending products you might like based on your recent purchase.",
  catalogue: "Browse our catalogue for items similar to {{product_name}}.",
  'multi-product': "Here are some products that pair well with {{purchased_product}}.",
  'order-details': "Your order {{order_id}} contains: {{product_list}}. Total: {{order_total}}.",
  'order-status': "Order status update: Your order {{order_id}} is now {{order_status}}.",
  location: "Our nearest store to you is located at: {{store_address}}",
  'multi-language': "How can we assist you today? / कैसे मदद कर सकते हैं?",
  interactive: "Please select an option to proceed further.",
  sequential: "Welcome to our step-by-step guide. Let's get started!"
};

export const SAMPLE_TEMPLATES: Template[] = [
  {
    id: generateTemplateId(),
    name: "FAQ - Pricing",
    type: "text",
    category: "utility",
    status: "approved",
    isStatic: true,
    sections: [
      {
        type: "header",
        content: "Pricing Information",
        variables: [],
        characterLimit: TEMPLATE_SECTION_LIMITS.header
      },
      {
        type: "body",
        content: "Here's our pricing for WhatsApp services:\n\n💰 Basic Plan: $19/month\n💰 Pro Plan: $49/month\n💰 Enterprise: Custom Pricing",
        variables: [],
        characterLimit: TEMPLATE_SECTION_LIMITS.body
      },
      {
        type: "footer",
        content: "Reply with 'Support' for assistance",
        variables: [],
        characterLimit: TEMPLATE_SECTION_LIMITS.footer
      }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    language: "en",
    buttons: [
      {
        type: "url",
        text: "View Full Pricing",
        value: "https://example.com/pricing"
      },
      {
        type: "quick_reply",
        text: "Need help?",
        value: "Support"
      }
    ],
    triggerKeywords: ["pricing", "cost", "plans"],
    useCase: "FAQs, Quick Info Requests"
  },

  {
    id: generateTemplateId(),
    name: "Onboarding Sequence",
    type: "sequential",
    category: "onboarding",
    status: "approved",
    isStatic: false,
    sections: [
      {
        type: "header",
        content: "Welcome to Our Service",
        variables: [],
        characterLimit: TEMPLATE_SECTION_LIMITS.header
      },
      {
        type: "body",
        content: "👋 Welcome {{customer_name}}! To sign up, please share your full name.",
        variables: [
          createVariable("customer_name", "user_attribute", "there")
        ],
        characterLimit: TEMPLATE_SECTION_LIMITS.body
      },
      {
        type: "footer",
        content: "Follow the prompts to complete signup",
        variables: [],
        characterLimit: TEMPLATE_SECTION_LIMITS.footer
      }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    language: "en",
    buttons: [
      {
        type: "flow",
        text: "Start Signup",
        value: "signup_flow"
      }
    ],
    triggerKeywords: ["signup", "register", "join"],
    useCase: "Step-by-Step Onboarding, Form Completion"
  },

  {
    id: generateTemplateId(),
    name: "Product Deals Carousel",
    type: "carousel",
    category: "marketing",
    status: "approved",
    isStatic: true,
    sections: [
      {
        type: "header",
        content: "Special Deals",
        variables: [],
        characterLimit: TEMPLATE_SECTION_LIMITS.header
      },
      {
        type: "body",
        content: "🛍 Check out our latest deals!\n👀 Scroll to explore!",
        variables: [],
        characterLimit: TEMPLATE_SECTION_LIMITS.body
      },
      {
        type: "footer",
        content: "Limited time offers",
        variables: [],
        characterLimit: TEMPLATE_SECTION_LIMITS.footer
      }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    language: "en",
    carouselItems: [
      {
        title: "Wireless Earbuds",
        description: "Price: $99",
        imageUrl: "https://placehold.co/600x400/png?text=Earbuds",
        buttons: [
          {
            type: "url",
            text: "View Details",
            value: "https://example.com/product1"
          }
        ]
      },
      {
        title: "Smart Watch",
        description: "Price: $149",
        imageUrl: "https://placehold.co/600x400/png?text=SmartWatch",
        buttons: [
          {
            type: "url",
            text: "View Details",
            value: "https://example.com/product2"
          }
        ]
      },
      {
        title: "Bluetooth Speaker",
        description: "Price: $79",
        imageUrl: "https://placehold.co/600x400/png?text=Speaker",
        buttons: [
          {
            type: "url",
            text: "View Details",
            value: "https://example.com/product3"
          }
        ]
      }
    ],
    triggerKeywords: ["deals", "offers", "products"],
    useCase: "Product Catalog, Service Packages"
  },

  {
    id: generateTemplateId(),
    name: "Store Finder",
    type: "location",
    category: "utility",
    status: "approved",
    isStatic: false,
    sections: [
      {
        type: "header",
        content: "Store Locator",
        variables: [],
        characterLimit: TEMPLATE_SECTION_LIMITS.header
      },
      {
        type: "body",
        content: "📍 Our nearest store to you is:\n\n🏬 {{store_name}}\n📌 Address: {{store_address}}\n🕒 Open: {{store_hours}}",
        variables: [
          createVariable("store_name", "location_data", "ABC Electronics - Downtown Branch"),
          createVariable("store_address", "location_data", "123 Main St, New York"),
          createVariable("store_hours", "location_data", "10 AM - 9 PM")
        ],
        characterLimit: TEMPLATE_SECTION_LIMITS.body
      },
      {
        type: "footer",
        content: "Tap the button below to get directions",
        variables: [],
        characterLimit: TEMPLATE_SECTION_LIMITS.footer
      }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    language: "en",
    media: {
      type: "location",
      url: "https://maps.google.com/?q=40.7128,-74.0060"
    },
    buttons: [
      {
        type: "url",
        text: "View on Google Maps",
        value: "https://maps.google.com/?q=40.7128,-74.0060"
      }
    ],
    triggerKeywords: ["find store", "location", "directions"],
    useCase: "Store Finder, Service Areas"
  },

  {
    id: generateTemplateId(),
    name: "Support Routing",
    type: "interactive",
    category: "support",
    status: "approved",
    isStatic: true,
    sections: [
      {
        type: "header",
        content: "Customer Support",
        variables: [],
        characterLimit: TEMPLATE_SECTION_LIMITS.header
      },
      {
        type: "body",
        content: "🔧 Please choose your issue type:\n\n1️⃣ Technical Issue\n2️⃣ Billing Inquiry\n3️⃣ General Question\n\n💬 Reply with 1, 2, or 3 to connect to the right team!",
        variables: [],
        characterLimit: TEMPLATE_SECTION_LIMITS.body
      },
      {
        type: "footer",
        content: "Our support team is available 24/7",
        variables: [],
        characterLimit: TEMPLATE_SECTION_LIMITS.footer
      }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    language: "en",
    buttons: [
      {
        type: "quick_reply",
        text: "Technical Issue",
        value: "1"
      },
      {
        type: "quick_reply",
        text: "Billing Inquiry",
        value: "2"
      },
      {
        type: "quick_reply",
        text: "General Question",
        value: "3"
      }
    ],
    triggerKeywords: ["support", "help", "issue"],
    useCase: "Assigning to Different Teams"
  },

  {
    id: generateTemplateId(),
    name: "Multi-Language Help",
    type: "multi-language",
    category: "support",
    status: "approved",
    isStatic: true,
    sections: [
      {
        type: "header",
        content: "Customer Assistance",
        variables: [],
        characterLimit: TEMPLATE_SECTION_LIMITS.header
      },
      {
        type: "body",
        content: "🇮🇳 Hindi: कैसे मदद कर सकते हैं? कृपया अपना प्रश्न टाइप करें।\n🇸🇬 English: How can we assist you? Please type your query.\n🇹🇭 Thai: ต้องการความช่วยเหลืออะไร? กรุณาพิมพ์คำถามของคุณ",
        variables: [],
        characterLimit: TEMPLATE_SECTION_LIMITS.body
      },
      {
        type: "footer",
        content: "We speak your language",
        variables: [],
        characterLimit: TEMPLATE_SECTION_LIMITS.footer
      }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    language: "multi",
    languages: ["en", "hi", "th"],
    buttons: [
      {
        type: "quick_reply",
        text: "English",
        value: "english"
      },
      {
        type: "quick_reply",
        text: "हिंदी",
        value: "hindi"
      },
      {
        type: "quick_reply",
        text: "ไทย",
        value: "thai"
      }
    ],
    triggerKeywords: ["help", "assistance", "support"],
    useCase: "Regional Language Support"
  },

  {
    id: generateTemplateId(),
    name: "Webinar Reminder",
    type: "text",
    category: "utility",
    status: "approved",
    isStatic: false,
    sections: [
      {
        type: "header",
        content: "Webinar Reminder",
        variables: [],
        characterLimit: TEMPLATE_SECTION_LIMITS.header
      },
      {
        type: "body",
        content: "📅 Your upcoming webinar is scheduled!\n📌 Topic: {{event_topic}}\n📅 Date: {{event_date}}\n⏰ Time: {{event_time}}",
        variables: [
          createVariable("event_topic", "event_data", "AI in Marketing"),
          createVariable("event_date", "event_data", "October 15, 2023"),
          createVariable("event_time", "event_data", "2:00 PM EST")
        ],
        characterLimit: TEMPLATE_SECTION_LIMITS.body
      },
      {
        type: "footer",
        content: "Click below to join",
        variables: [],
        characterLimit: TEMPLATE_SECTION_LIMITS.footer
      }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    language: "en",
    buttons: [
      {
        type: "url",
        text: "Join Webinar",
        value: "https://example.com/webinar"
      },
      {
        type: "quick_reply",
        text: "Reschedule",
        value: "reschedule"
      }
    ],
    triggerKeywords: ["webinar", "event", "reminder"],
    useCase: "Appointment Reminders, Webinars"
  },

  {
    id: generateTemplateId(),
    name: "Order Tracking",
    type: "order-status",
    category: "utility",
    status: "approved",
    isStatic: false,
    sections: [
      {
        type: "header",
        content: "Order Status",
        variables: [],
        characterLimit: TEMPLATE_SECTION_LIMITS.header
      },
      {
        type: "body",
        content: "📦 Your order #{{order_id}} is currently {{order_status}}.\n\nEstimated delivery: {{delivery_date}}",
        variables: [
          createVariable("order_id", "order_data", "ORD12345"),
          createVariable("order_status", "order_data", "Out for Delivery"),
          createVariable("delivery_date", "order_data", "October 10, 2023")
        ],
        characterLimit: TEMPLATE_SECTION_LIMITS.body
      },
      {
        type: "footer",
        content: "Track anytime with your order ID",
        variables: [],
        characterLimit: TEMPLATE_SECTION_LIMITS.footer
      }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    language: "en",
    buttons: [
      {
        type: "url",
        text: "Track Your Order",
        value: "https://example.com/track?id={{order_id}}"
      }
    ],
    triggerKeywords: ["track order", "delivery status", "where is my order"],
    useCase: "Order Tracking"
  },

  {
    id: generateTemplateId(),
    name: "Customer Feedback",
    type: "interactive",
    category: "feedback",
    status: "approved",
    isStatic: true,
    sections: [
      {
        type: "header",
        content: "We Value Your Feedback",
        variables: [],
        characterLimit: TEMPLATE_SECTION_LIMITS.header
      },
      {
        type: "body",
        content: "⭐ How would you rate your experience with us?\n\n1️⃣ Excellent\n2️⃣ Good\n3️⃣ Okay\n4️⃣ Bad\n\n💬 Reply with the number to share your feedback!",
        variables: [],
        characterLimit: TEMPLATE_SECTION_LIMITS.body
      },
      {
        type: "footer",
        content: "Your feedback helps us improve",
        variables: [],
        characterLimit: TEMPLATE_SECTION_LIMITS.footer
      }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    language: "en",
    buttons: [
      {
        type: "quick_reply",
        text: "Excellent",
        value: "1"
      },
      {
        type: "quick_reply",
        text: "Good",
        value: "2"
      },
      {
        type: "quick_reply",
        text: "Okay",
        value: "3"
      },
      {
        type: "quick_reply",
        text: "Bad",
        value: "4"
      }
    ],
    triggerKeywords: ["feedback", "survey", "review"],
    useCase: "Customer Satisfaction Survey"
  }
];
