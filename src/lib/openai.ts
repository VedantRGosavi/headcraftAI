// lib/openai.ts
import OpenAI from 'openai';
import { GenerationPreference } from '../types/image';

// Initialize the OpenAI client with API key
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Analyze user-uploaded images to generate a base description for headshot generation
 * @param imageUrls Array of URLs to the uploaded images
 * @returns The generated base description
 */
export async function analyzeImages(imageUrls: string[]): Promise<string> {
  try {
    const messages = [
      {
        role: 'system' as const,
        content: 'You are an expert photographer and image analyst. Your task is to analyze the provided images of a person and create a detailed description that captures their facial features, hair style, and overall appearance. This description will be used to generate a professional headshot.',
      },
      {
        role: 'user' as const,
        content: [
          { type: 'text' as const, text: 'Analyze these images and provide a detailed description of the person for generating a professional headshot:' },
          ...imageUrls.map(url => ({
            type: 'image_url' as const,
            image_url: { url },
          })),
        ],
      },
    ];

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages,
      max_tokens: 500,
    });

    return response.choices[0].message.content || '';
  } catch (error) {
    console.error('Error analyzing images with OpenAI:', error);
    throw new Error('Failed to analyze images');
  }
}

/**
 * Generate a prompt for image generation based on user preferences and base description
 * @param baseDescription The base description generated from analyzing images
 * @param preferences User's preferences for the headshot
 * @returns The final prompt for image generation
 */
export async function generateHeadshotPrompt(
  baseDescription: string,
  preferences: GenerationPreference
): Promise<string> {
  try {
    const prefString = JSON.stringify(preferences);
    
    const messages = [
      {
        role: 'system' as const,
        content: 'You are an expert at creating prompts for AI image generation. Your task is to take a base description of a person and their preferences for a headshot, and create a detailed prompt that will result in a realistic, professional headshot.',
      },
      {
        role: 'user' as const,
        content: `Base description: ${baseDescription}\n\nUser preferences: ${prefString}\n\nCreate a detailed prompt to generate a professional headshot.`,
      },
    ];

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages,
      max_tokens: 500,
    });

    return response.choices[0].message.content || '';
  } catch (error) {
    console.error('Error generating headshot prompt with OpenAI:', error);
    throw new Error('Failed to generate headshot prompt');
  }
}

/**
 * Generate a headshot using DALL-E 3 based on the prompt
 * @param prompt The prompt for image generation
 * @returns The URL of the generated image
 */
export async function generateHeadshot(prompt: string): Promise<string> {
  try {
    const response = await openai.images.generate({
      model: 'dall-e-3',
      prompt: `Professional headshot: ${prompt}`,
      n: 1,
      size: '1024x1024',
      quality: 'hd',
      style: 'natural',
    });

    return response.data[0].url || '';
  } catch (error) {
    console.error('Error generating headshot with DALL-E 3:', error);
    throw new Error('Failed to generate headshot');
  }
}

export default openai;