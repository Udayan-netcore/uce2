
import { useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { VariableType } from "@/types/whatsapp-template";
import { VARIABLE_TYPE_LABELS, validateVariableName } from "@/utils/template-utils";
import { useState } from 'react';
import { X, Check, AlertCircle } from 'lucide-react';

interface VariableMenuProps {
  position: { x: number; y: number };
  onSelectVariable: (name: string, type: VariableType) => void;
  onClose: () => void;
  selectedType: VariableType;
  onChangeType: (type: VariableType) => void;
}

const COMMON_VARIABLES: Record<VariableType, string[]> = {
  user_attribute: [
    'customer_name',
    'first_name',
    'last_name',
    'phone_number',
    'email',
    'city',
    'country'
  ],
  payload_param: [
    'order_id',
    'tracking_link',
    'store_name',
    'coupon_code',
    'appointment_date',
    'booking_id',
    'transaction_id'
  ],
  product_property: [
    'product_name',
    'product_price',
    'product_image',
    'product_description',
    'discount_percentage',
    'availability',
    'category'
  ],
  event_data: [
    'event_name',
    'event_date',
    'event_time',
    'event_location',
    'event_duration',
    'event_speaker',
    'event_topic'
  ],
  order_data: [
    'order_id',
    'order_date',
    'order_status',
    'order_total',
    'delivery_date',
    'shipping_method',
    'payment_method'
  ],
  location_data: [
    'store_name',
    'store_address',
    'store_city',
    'store_phone',
    'store_hours',
    'distance',
    'coordinates'
  ]
};

export default function VariableMenu({ 
  position, 
  onSelectVariable, 
  onClose,
  selectedType,
  onChangeType
}: VariableMenuProps) {
  const [customVariable, setCustomVariable] = useState('');
  const [isValid, setIsValid] = useState(true);
  const [validationMessage, setValidationMessage] = useState('');
  const menuRef = useRef<HTMLDivElement>(null);

  const handleAddCustomVariable = () => {
    if (!customVariable.trim()) {
      setIsValid(false);
      setValidationMessage('Variable name cannot be empty');
      return;
    }
    
    if (!validateVariableName(customVariable)) {
      setIsValid(false);
      setValidationMessage('Variable name must start with a letter and contain only letters, numbers, and underscores');
      return;
    }
    
    onSelectVariable(customVariable, selectedType);
    setCustomVariable('');
  };

  const handleSelectCommonVariable = (variable: string) => {
    onSelectVariable(variable, selectedType);
  };

  // Close when clicking outside the menu
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  const menuStyle = {
    top: `${position.y}px`,
    left: `${position.x}px`,
    transform: 'translate(-50%, -105%)'
  };

  return (
    <div 
      ref={menuRef} 
      className="variable-menu"
      style={menuStyle}
    >
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-medium">Insert Variable</h3>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-6 w-6 p-0" 
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      <Tabs 
        value={selectedType} 
        onValueChange={(value) => onChangeType(value as VariableType)}
        className="w-full"
      >
        <TabsList className="w-full mb-2 flex flex-wrap">
          <TabsTrigger value="user_attribute" className="flex-1">User</TabsTrigger>
          <TabsTrigger value="payload_param" className="flex-1">Payload</TabsTrigger>
          <TabsTrigger value="product_property" className="flex-1">Product</TabsTrigger>
          <TabsTrigger value="event_data" className="flex-1">Event</TabsTrigger>
          <TabsTrigger value="order_data" className="flex-1">Order</TabsTrigger>
          <TabsTrigger value="location_data" className="flex-1">Location</TabsTrigger>
        </TabsList>
        
        {(Object.keys(COMMON_VARIABLES) as VariableType[]).map((type) => (
          <TabsContent key={type} value={type}>
            <div className="mb-3">
              <p className="text-xs text-muted-foreground mb-1">
                {type === 'user_attribute' 
                  ? 'User attributes like name, email, etc.'
                  : type === 'payload_param'
                  ? 'Parameters passed in the payload'
                  : type === 'product_property'
                  ? 'Product-specific properties'
                  : type === 'event_data'
                  ? 'Event-related data like date, time, etc.'
                  : type === 'order_data'
                  ? 'Order details like ID, status, etc.'
                  : 'Location information like store details, etc.'}
              </p>
              
              <div className="grid grid-cols-1 gap-1 max-h-[180px] overflow-y-auto">
                {COMMON_VARIABLES[type].map(variable => (
                  <Button
                    key={variable}
                    variant="ghost"
                    size="sm"
                    className="justify-start text-sm h-8"
                    onClick={() => handleSelectCommonVariable(variable)}
                  >
                    <span className="truncate">{variable}</span>
                  </Button>
                ))}
              </div>
            </div>
            
            <div className="pt-2 border-t border-gray-200">
              <p className="text-xs font-medium mb-1">Custom Variable</p>
              <div className="flex space-x-1">
                <div className="flex-1">
                  <Input
                    value={customVariable}
                    onChange={(e) => {
                      setCustomVariable(e.target.value);
                      setIsValid(true);
                      setValidationMessage('');
                    }}
                    placeholder="custom_variable_name"
                    className={`text-sm h-8 ${!isValid ? 'border-red-500' : ''}`}
                  />
                  {!isValid && (
                    <p className="text-xs text-red-500 mt-1 flex items-center">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      {validationMessage}
                    </p>
                  )}
                </div>
                <Button 
                  size="sm" 
                  className="h-8" 
                  onClick={handleAddCustomVariable}
                >
                  <Check className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
