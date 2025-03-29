import { GenerationPreference } from '../types/image';
import { analyzeImages, generateHeadshotPrompt, generateHeadshot } from './openai';
import { createHeadshot, storeGeneratedImage, updateHeadshot } from './images';
import { Image } from '../types/image';

export async function generateHeadshots(images: Image[], preferences: GenerationPreference) {
  try {
    // Create a headshot record
    const headshot = await createHeadshot();

    // Start the generation process
    const imageUrls = images.map((img) => img.url);

    // Analyze images and generate base description
    const baseDescription = await analyzeImages(imageUrls);

    // Generate final prompt incorporating user preferences
    const prompt = await generateHeadshotPrompt(baseDescription, preferences);

    // Generate the headshot using DALL-E 3
    const generatedImageUrl = await generateHeadshot(prompt);

    // Store the generated image
    await storeGeneratedImage(headshot.id, generatedImageUrl);

    // Update status to completed
    await updateHeadshot(headshot.id, { status: 'completed' });

    return { success: true, headshot };
  } catch (error) {
    console.error('Error generating headshots:', error);
    throw error;
  }
} 