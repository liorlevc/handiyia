/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenAI } from "@google/genai";
import type { Product } from "../data/products";
import type { GeneratedLookState } from "../context/AppContext";

let aiInstance: GoogleGenAI | null = null;

function getAi() {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY || '';
    aiInstance = new GoogleGenAI({ apiKey });
  }
  return aiInstance;
}

/** Converts a base64 data URL to plain base64 + mimeType */
function dataUrlToBase64(dataUrl: string): { data: string; mimeType: string } {
  const [header, data] = dataUrl.split(',');
  const mimeType = header.match(/:(.*?);/)?.[1] ?? 'image/jpeg';
  return { data, mimeType };
}

/** Fetches an external image URL and converts it to base64 inline data */
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
 * Generates a single lifestyle fashion photo of the user wearing the catalog item.
 */
export async function generateLook(
  userPhotoDataUrl: string,
  product: Product,
  scene: { id: string; label: string; prompt: string }
): Promise<string> {
  const ai = getAi();
  const userPhoto = dataUrlToBase64(userPhotoDataUrl);
  const outfitPhoto = await fetchImageAsBase64(product.image);

  const prompt = `You are a professional fashion photographer and AI stylist working for a luxury fashion app.

I am giving you TWO reference images:
1. PERSON PHOTO — the exact person who wants to try on the outfit
2. OUTFIT PHOTO — the exact clothing item from the catalog

Your task: Generate a single high-quality, photorealistic lifestyle fashion photo of THIS EXACT PERSON (from image 1) wearing the clothing item extracted from the OUTFIT PHOTO (image 2).

The photo should be set in: ${scene.prompt}

CRITICAL — preserve ALL of the following from the PERSON PHOTO exactly as they appear:
- Face: same facial features, face shape, skin texture, expression style
- Facial hair: exact same beard, stubble, or clean-shaven look — do NOT add, remove, or trim beard/stubble
- Hair: exact same hair color, length, style, texture, and hairline
- Body: same body type, build, height proportions, and weight — do NOT slim down, bulk up, or change body shape
- Skin tone: exact same complexion, undertone, and skin color
- Age appearance: same apparent age — do NOT make the person look younger or older
- Ethnicity: must match exactly — no changes

OUTFIT rules:
- The OUTFIT PHOTO may contain a model, mannequin, or hanger — IGNORE that completely
- Extract ONLY the clothing item itself: its color, cut, fabric texture, pattern, drape, and style details
- Dress THIS PERSON (from the PERSON PHOTO) in that exact garment
- Show full-body or 3/4 body shot so the outfit is clearly visible
- Item: ${product.name} by ${product.brand}

PHOTO quality requirements:
- Magazine-quality editorial/lookbook photography
- Natural, flattering lighting appropriate for: ${scene.label}
- The person looks confident, natural, and stylish
- Background matches the scene description
- Photorealistic — NOT illustrated, NOT cartoon, NOT CGI-looking
- No text, watermarks, logos, or graphic overlays in the final image
- Sharp, crisp image with professional color grading

The result must look like a real high-end fashion photo shoot of THIS SPECIFIC PERSON wearing that outfit.`;

  const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-image-preview",
    contents: [
      {
        role: "user",
        parts: [
          {
            inlineData: { mimeType: userPhoto.mimeType, data: userPhoto.data },
          },
          { text: "PERSON PHOTO — this is the exact person who wants to try on the outfit:" },
          {
            inlineData: { mimeType: outfitPhoto.mimeType, data: outfitPhoto.data },
          },
          { text: `OUTFIT PHOTO — this is the exact clothing item (${product.name} by ${product.brand}):` },
          { text: prompt },
        ],
      },
    ],
    config: {
      responseModalities: ["IMAGE", "TEXT"],
    },
  });

  const parts = response.candidates?.[0]?.content?.parts;
  if (!parts) throw new Error("No response parts from Gemini");

  for (const part of parts) {
    if (part.inlineData?.data) {
      return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
    }
  }

  throw new Error("No image returned in Gemini response");
}

/**
 * Generates all lifestyle looks for a product.
 * Calls onProgress after each look completes so the UI can update progressively.
 */
export async function generateAllLooks(
  userPhotoDataUrl: string,
  product: Product,
  onProgress: (results: GeneratedLookState[]) => void
): Promise<GeneratedLookState[]> {
  const results: GeneratedLookState[] = product.scenes.map((s) => ({
    sceneLabel: s.label,
    imageDataUrl: '',
    isLoading: true,
  }));

  onProgress([...results]);

  await Promise.allSettled(
    product.scenes.map(async (scene, index) => {
      try {
        const imageDataUrl = await generateLook(userPhotoDataUrl, product, scene);
        results[index] = {
          sceneLabel: scene.label,
          imageDataUrl,
          isLoading: false,
        };
      } catch (error) {
        console.error(`Error generating look for scene ${scene.id}:`, error);
        results[index] = {
          sceneLabel: scene.label,
          imageDataUrl: '',
          isLoading: false,
          error: 'שגיאה בייצור התמונה',
        };
      }
      onProgress([...results]);
    })
  );

  return results;
}
