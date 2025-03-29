// types/image.ts
export interface Image {
    id: string;
    user_id: string;
    type: 'uploaded' | 'headshot';
    url: string;
    created_at: string;
    status?: 'pending' | 'processing' | 'completed' | 'failed';
    prompt?: string;
    generated_image_id?: string;
    updated_at?: string;
  }
  
  export interface Headshot {
    id: string;
    user_id: string;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    prompt: string | null;
    generated_image_id: string | null;
    created_at: string;
    updated_at: string;
    generated_image?: Image;
  }
  
  export interface UploadedImage {
    file: File;
    preview: string;
    id?: string;
    uploaded?: boolean;
  }
  
  export interface HeadshotWithImages extends Headshot {
    generated_image?: Image;
    uploaded_images?: Image[];
  }
  
  export interface GenerationPreference {
    background?: string;
    style?: string;
    clothing?: string;
    lighting?: string;
    mood?: string;
    customInstructions?: string;
  }