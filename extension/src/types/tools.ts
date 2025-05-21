type Property = {
  type: string;
  items?: Property;
  description?: string;
  enum?: string[];
  properties?: PropertyMap;
};

type PropertyMap = Record<string, Property>;

export interface ToolDescription {
  name: string;
  description: string;
  parameters?: {
    type: string;
    properties: PropertyMap;
    required?: string[];
  };
  returns?: {
    type: string;
    description: string;
    properties?: PropertyMap;
  };
}

export type WebInteractionResult<T> =
  | {
      success: true;
      data: T;
    }
  | {
      success: false;
      data?: object;
      error?: string;
    };
