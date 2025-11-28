import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Using gemini-2.5-flash for fast text generation (scripts, descriptions)
const TEXT_MODEL = "gemini-2.5-flash";
// Using gemini-2.5-flash-image for image generation capabilities as per guidelines
const IMAGE_MODEL = "gemini-2.5-flash-image";

export const generateStoryIdea = async (prompt: string): Promise<string> => {
  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: TEXT_MODEL,
      contents: `You are a creative director for an AI comic video platform called Sparkreel.
      Generate a short, exciting synopsis for a comic video based on this keyword: "${prompt}".
      Keep it under 100 words.`,
    });
    return response.text || "Failed to generate story.";
  } catch (error) {
    console.error("Gemini Text Error:", error);
    return "An error occurred while communicating with the AI muse.";
  }
};

export const generateCharacterConcept = async (name: string, type: string): Promise<string> => {
  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: TEXT_MODEL,
      contents: `Describe a visual character design for an anime/comic style character named "${name}" who is a "${type}". 
      Include details about hair, eyes, clothing, and distinct accessories. 
      Format as a single paragraph suitable for an image generation prompt.`,
    });
    return response.text || "No description generated.";
  } catch (error) {
    console.error("Gemini Character Error:", error);
    return "Error generating character concept.";
  }
};

export const optimizeVideoPrompt = async (originalPrompt: string): Promise<string> => {
    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: TEXT_MODEL,
            contents: `Optimize and expand the following short video description into a detailed AI video generation prompt (Midjourney/Runway style). 
            Include details about lighting, camera movement, style (Cinematic, Anime), and atmosphere.
            Original: "${originalPrompt}"
            
            Return ONLY the prompt text.`,
        });
        return response.text || originalPrompt;
    } catch (error) {
        console.error("Gemini Prompt Optimization Error:", error);
        return originalPrompt; // Fallback to original
    }
}

// Function to simulate image generation using Gemini 2.5 Flash Image
// Note: In a real production environment, this would handle the binary response.
// For this demo, we assume the model returns a description or we handle the image part if returned.
export const generateSceneImage = async (description: string): Promise<string | null> => {
  try {
     // Using gemini-2.5-flash-image as requested in guidelines for image generation
    const response = await ai.models.generateContent({
      model: IMAGE_MODEL,
      contents: {
        parts: [
          {
            text: `Generate a high-quality anime style illustration of: ${description}`,
          },
        ],
      },
      config: {
         // imageConfig settings would go here if using gemini-3-pro-image-preview
         // For 2.5-flash-image we parse the response parts
      }
    });

    // Check for inline image data in response
    if (response.candidates && response.candidates[0].content.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
            return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        }
      }
    }
    
    // If no image returned (e.g. model decided to just talk), fallback or return null
    return null;

  } catch (error) {
    console.error("Gemini Image Error:", error);
    return null;
  }
};