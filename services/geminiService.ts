/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import { GoogleGenAI, GenerateContentResponse, Modality } from "@google/genai";

// Compress image to reduce payload size and improve reliability
const compressImage = async (file: File, maxWidth: number = 1024, quality: number = 0.8): Promise<File> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
            reject(new Error('Could not get canvas context'));
            return;
        }

        img.onload = () => {
            let width = img.width;
            let height = img.height;

            // Scale down if too large
            if (width > maxWidth) {
                height = (height * maxWidth) / width;
                width = maxWidth;
            }

            canvas.width = width;
            canvas.height = height;
            ctx.drawImage(img, 0, 0, width, height);

            canvas.toBlob(
                (blob) => {
                    if (!blob) {
                        reject(new Error('Failed to compress image'));
                        return;
                    }
                    const compressedFile = new File([blob], file.name, {
                        type: 'image/jpeg',
                        lastModified: Date.now(),
                    });
                    resolve(compressedFile);
                },
                'image/jpeg',
                quality
            );
        };

        img.onerror = () => reject(new Error('Failed to load image for compression'));
        img.src = URL.createObjectURL(file);
    });
};

const fileToPart = async (file: File) => {
    // Compress image before sending to API
    const compressedFile = await compressImage(file);
    
    const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(compressedFile);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
    });
    const { mimeType, data } = dataUrlToParts(dataUrl);
    return { inlineData: { mimeType, data } };
};

const dataUrlToParts = (dataUrl: string) => {
    const arr = dataUrl.split(',');
    if (arr.length < 2) throw new Error("Invalid data URL");
    const mimeMatch = arr[0].match(/:(.*?);/);
    if (!mimeMatch || !mimeMatch[1]) throw new Error("Could not parse MIME type from data URL");
    return { mimeType: mimeMatch[1], data: arr[1] };
}

const dataUrlToPart = (dataUrl: string) => {
    const { mimeType, data } = dataUrlToParts(dataUrl);
    return { inlineData: { mimeType, data } };
}

const handleApiResponse = (response: GenerateContentResponse): string => {
    if (response.promptFeedback?.blockReason) {
        const { blockReason, blockReasonMessage } = response.promptFeedback;
        const errorMessage = `Request was blocked. Reason: ${blockReason}. ${blockReasonMessage || ''}`;
        throw new Error(errorMessage);
    }

    // Find the first image part in any candidate
    for (const candidate of response.candidates ?? []) {
        const imagePart = candidate.content?.parts?.find(part => part.inlineData);
        if (imagePart?.inlineData) {
            const { mimeType, data } = imagePart.inlineData;
            return `data:${mimeType};base64,${data}`;
        }
    }

    const finishReason = response.candidates?.[0]?.finishReason;
    if (finishReason && finishReason !== 'STOP') {
        const errorMessage = `Image generation stopped unexpectedly. Reason: ${finishReason}. This often relates to safety settings.`;
        throw new Error(errorMessage);
    }
    const textFeedback = response.text?.trim();
    const errorMessage = `The AI model did not return an image. ` + (textFeedback ? `The model responded with text: "${textFeedback}"` : "This can happen due to safety filters or if the request is too complex. Please try a different image.");
    throw new Error(errorMessage);
};

const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY! });
const model = 'gemini-2.5-flash-image';

// Retry helper for network failures
const retryWithBackoff = async <T>(
    fn: () => Promise<T>,
    maxRetries: number = 3,
    baseDelay: number = 1000
): Promise<T> => {
    for (let i = 0; i < maxRetries; i++) {
        try {
            return await fn();
        } catch (error: any) {
            const isLastAttempt = i === maxRetries - 1;
            const isNetworkError = error?.message?.includes('network') || 
                                   error?.message?.includes('Load failed') ||
                                   error?.message?.includes('fetch');
            
            if (isLastAttempt || !isNetworkError) {
                throw error;
            }
            
            // Exponential backoff
            const delay = baseDelay * Math.pow(2, i);
            console.log(`Network error, retrying in ${delay}ms... (attempt ${i + 1}/${maxRetries})`);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
    throw new Error('Max retries exceeded');
};

export const generateModelImage = async (userImage: File): Promise<string> => {
    return retryWithBackoff(async () => {
        const userImagePart = await fileToPart(userImage);
        const prompt = "You are an expert fashion photographer AI. Transform the person in this image into a full-body fashion model photo suitable for an e-commerce website. The background must be a clean, neutral studio backdrop (light gray, #f0f0f0). The person should have a neutral, professional model expression. Preserve the person's identity, unique features, and body type, but place them in a standard, relaxed standing model pose. The final image must be photorealistic. Return ONLY the final image.";
        const response = await ai.models.generateContent({
            model,
            contents: { parts: [userImagePart, { text: prompt }] },
            config: {
                responseModalities: [Modality.IMAGE, Modality.TEXT],
            },
        });
        return handleApiResponse(response);
    });
};

export const generateVirtualTryOnImage = async (modelImageUrl: string, garmentImage: File, garmentType?: string): Promise<string> => {
    return retryWithBackoff(async () => {
        const modelImagePart = dataUrlToPart(modelImageUrl);
        const garmentImagePart = await fileToPart(garmentImage);
        
        const garmentTypeInfo = garmentType ? ` The garment is a ${garmentType}.` : '';
        const prompt = `You are an expert virtual try-on AI. You will be given a 'model image' and a 'garment image'. Your task is to create a new photorealistic image where the person from the 'model image' is wearing the clothing from the 'garment image'.${garmentTypeInfo}

**Crucial Rules:**
1.  **Complete Garment Replacement:** You MUST completely REMOVE and REPLACE the clothing item worn by the person in the 'model image' with the new garment. No part of the original clothing (e.g., collars, sleeves, patterns) should be visible in the final image.
2.  **Preserve the Model:** The person's face, hair, body shape, and pose from the 'model image' MUST remain unchanged.
3.  **Preserve the Background:** The entire background from the 'model image' MUST be preserved perfectly.
4.  **Apply the Garment:** Realistically fit the new garment onto the person. It should adapt to their pose with natural folds, shadows, and lighting consistent with the original scene.
5.  **Output:** Return ONLY the final, edited image. Do not include any text.`;
        const response = await ai.models.generateContent({
            model,
            contents: { parts: [modelImagePart, garmentImagePart, { text: prompt }] },
            config: {
                responseModalities: [Modality.IMAGE, Modality.TEXT],
            },
        });
        return handleApiResponse(response);
    });
};

export const generatePoseVariation = async (tryOnImageUrl: string, poseInstruction: string): Promise<string> => {
    return retryWithBackoff(async () => {
        const tryOnImagePart = dataUrlToPart(tryOnImageUrl);
        const prompt = `You are an expert fashion photographer AI. Take this image and regenerate it from a different perspective. The person, clothing, and background style must remain identical. The new perspective should be: "${poseInstruction}". Return ONLY the final image.`;
        const response = await ai.models.generateContent({
            model,
            contents: { parts: [tryOnImagePart, { text: prompt }] },
            config: {
                responseModalities: [Modality.IMAGE, Modality.TEXT],
            },
        });
        return handleApiResponse(response);
    });
};