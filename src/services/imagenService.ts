/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenAI } from "@google/genai";
import type { ClothingItem, Scene } from "../data/catalog";

let aiInstance: GoogleGenAI | null = null;

function getAi() {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY || '';
    aiInstance = new GoogleGenAI({ apiKey });
  }
  return aiInstance;
}

export interface GeneratedLook {
  scene: Scene;
  imageBase64: string;
  isLoading: boolean;
  error?: string;
}

/**
 * Converts a base64 data URL to a plain base64 string + mimeType.
 */
function dataUrlToBase64(dataUrl: string): { data: string; mimeType: string } {
  const [header, data] = dataUrl.split(',');
  const mimeType = header.match(/:(.*?);/)?.[1] ?? 'image/jpeg';
  return { data, mimeType };
}

/**
 * Fetches an external image URL and converts it to base64 inline data.
 */
async function fetchImageAsBase64(url: string): Promise<{ data: string; mimeType: string }> {
  const response = await fetch(url);
  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUrl = reader.result as string;
      resolve(dataUrlToBase64(dataUrl));
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * Generates a lifestyle fashion image of the user wearing the EXACT catalog item,
 * using both the user's photo and the catalog item's image as visual references.
 */
export async function generateLook(
  userPhotoDataUrl: string,
  item: ClothingItem,
  scene: Scene
): Promise<string> {
  const ai = getAi();

  const userPhoto = dataUrlToBase64(userPhotoDataUrl);

  // Fetch the catalog item image as base64 so Gemini sees the exact garment
  const outfitPhoto = await fetchImageAsBase64(item.imageUrl);

  const prompt = `You are a professional fashion photographer and AI stylist.

I am giving you TWO reference images:
1. PERSON PHOTO — the exact person who wants to try on the outfit
2. OUTFIT PHOTO — the exact clothing item from our catalog

Your task: Generate a single high-quality, photorealistic lifestyle fashion photo of THIS EXACT PERSON (from image 1) wearing the clothing item extracted from the OUTFIT PHOTO (image 2).
The person in the final image must be the person from image 1 — NOT the model or mannequin shown in image 2.

The photo should be set in: ${scene.prompt}

CRITICAL — preserve ALL of the following from the PERSON PHOTO exactly as they are:
- Face: same facial features, face shape, expression style
- Facial hair: same beard, stubble, or clean-shaven — do NOT add or remove beard/stubble
- Hair: exact same hair color, length, style, and texture
- Body: same body type, build, height proportions, weight — do NOT slim down or bulk up the body
- Skin tone: exact same complexion and skin color
- Age appearance: same apparent age — do NOT make the person look younger or older
- Ethnicity: must match exactly

OUTFIT rules:
- The OUTFIT PHOTO may contain a model or mannequin wearing the garment — IGNORE that model/mannequin completely
- Extract ONLY the clothing item itself from the OUTFIT PHOTO: its color, cut, fabric texture, pattern, and style
- Place that exact garment on the PERSON from the PERSON PHOTO — not on the model from the outfit photo
- Show the full outfit clearly (full or 3/4 body shot)

PHOTO quality:
- Magazine-quality editorial photography
- Natural, flattering lighting appropriate to ${scene.label}
- The person looks confident, natural and stylish
- Photorealistic — NOT illustrated, NOT cartoon-like
- No text, logos, or watermarks in the image

The result must look like a real photo of THIS SPECIFIC PERSON wearing that outfit in that location.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-image-preview",
      contents: [
        {
          role: "user",
          parts: [
            // Image 1: the person
            {
              inlineData: {
                mimeType: userPhoto.mimeType,
                data: userPhoto.data,
              },
            },
            { text: "PERSON PHOTO — this is the person who wants to try on the outfit:" },
            // Image 2: the exact outfit from the catalog
            {
              inlineData: {
                mimeType: outfitPhoto.mimeType,
                data: outfitPhoto.data,
              },
            },
            { text: `OUTFIT PHOTO — this is the EXACT clothing item to use (${item.name} by ${item.brand}):` },
            // The actual generation prompt
            { text: prompt },
          ],
        },
      ],
      config: {
        responseModalities: ["IMAGE", "TEXT"],
      },
    });

    const parts = response.candidates?.[0]?.content?.parts;
    if (!parts) throw new Error("No response parts");

    for (const part of parts) {
      if (part.inlineData?.data) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }

    throw new Error("No image in response");
  } catch (error) {
    console.error(`Error generating look for scene ${scene.id}:`, error);
    throw error;
  }
}

/**
 * Generates all 4 lifestyle looks for a given user photo and clothing item.
 * Returns results progressively via callback.
 */
export async function generateAllLooks(
  userPhotoDataUrl: string,
  item: ClothingItem,
  onProgress: (results: GeneratedLook[]) => void
): Promise<GeneratedLook[]> {
  const results: GeneratedLook[] = item.scenes.map((scene) => ({
    scene,
    imageBase64: '',
    isLoading: true,
  }));

  onProgress([...results]);

  // Generate all scenes in parallel
  await Promise.allSettled(
    item.scenes.map(async (scene, index) => {
      try {
        const imageDataUrl = await generateLook(userPhotoDataUrl, item, scene);
        results[index] = {
          scene,
          imageBase64: imageDataUrl,
          isLoading: false,
        };
      } catch (error) {
        results[index] = {
          scene,
          imageBase64: '',
          isLoading: false,
          error: 'שגיאה בייצור התמונה',
        };
      }
      onProgress([...results]);
    })
  );

  return results;
}
