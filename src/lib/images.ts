import { createClient } from '@/lib/supabase/server'
// Remove Gemini import
// import { GoogleGenerativeAI } from '@google/generative-ai'
import OpenAI from 'openai'; // Import OpenAI

// Initialize OpenAI API
const openai = new OpenAI({
    apiKey: process.env.NEXT_PUBLIC_OPENAI_API, // Use the correct env variable
});

export async function generateAndStoreImages(prompt: string, sceneId: string): Promise<string[]> {
    // Remove Gemini model initialization
    // const model = genAI.getGenerativeModel({ model: "imagen-3.0-generate-002" });
    const supabase = await createClient()

    try {
        // Generate two images with slightly different prompts for variety
        // Keep prompts similar, adjust style guidance if needed for OpenAI
        const imagePrompts = [
            `Create a whimsical, children's storybook style illustration of: ${prompt}. Style: soft pastel colors, gentle shapes, magical atmosphere.`,
            `Create a different angle/perspective of this scene: ${prompt}. Style: children's book illustration, dreamy watercolor effect, enchanting details.`
        ];

        // Start both image generations concurrently using OpenAI
        const imagePromises = imagePrompts.map(async (imagePrompt) => {
            // Replace Gemini call with OpenAI call
            // const result = await model.generateContent({ ... });
            // const response = await result.response;
            const response = await openai.images.generate({
                model: "dall-e-3", // Specify DALL-E 3 model
                prompt: imagePrompt,
                n: 1, // Generate one image per prompt
                size: "1024x1024", // Standard size, can be adjusted
                response_format: "b64_json", // Request base64 encoded image data
                style: "natural", // Or 'vivid'
                quality: "standard" // or 'hd'
            });


            // Log the full response to understand its structure in case of errors
            // console.log('Gemini API Response:', JSON.stringify(response, null, 2));
            console.log('OpenAI API Response:', JSON.stringify(response, null, 2)); // Log OpenAI response


            // Extract base64 data correctly from OpenAI response
            // const firstCandidate = response?.candidates?.[0];
            // if (!firstCandidate || !firstCandidate.content?.parts?.[0]?.inlineData) { ... }
            // const inlineDataPart = firstCandidate.content.parts[0].inlineData;
            // const base64Data = inlineDataPart.data;
            // const mimeType = inlineDataPart.mimeType; // OpenAI b64_json doesn't directly provide mimeType, default to png
            const base64Data = response?.data?.[0]?.b64_json;
            if (!base64Data) {
                console.error('Problematic OpenAI API Response:', JSON.stringify(response, null, 2));
                throw new Error("Invalid response format from OpenAI image generation API or no image data found.");
            }
            const mimeType = 'image/png'; // Assume PNG for b64_json from DALL-E 3
            return { base64Data, mimeType };
        });

        // Wait for both images to be generated
        const imageDataArray = await Promise.all(imagePromises);

        // Upload images to Supabase storage
        const uploadPromises = imageDataArray.map(async (imageData, index) => {
            if (!imageData) return null; // Skip if image generation failed for this prompt

            const { base64Data, mimeType } = imageData;
            const buffer = Buffer.from(base64Data, 'base64'); // Directly use the base64 data
            const fileName = `${sceneId}-${index}.png`; // Assuming PNG, adjust if mimeType varies
            const filePath = `scenes/${fileName}`;

            const { data: uploadData, error: uploadError } = await supabase
                .storage
                .from('images')
                .upload(filePath, buffer, {
                    contentType: mimeType, // Use the actual mimeType (now assumed PNG)
                    cacheControl: '3600',
                    upsert: true
                });

            if (uploadError) {
                console.error('Error uploading image:', uploadError);
                return null;
            }

            // Get the public URL for the uploaded image
            const { data: { publicUrl } } = supabase
                .storage
                .from('images')
                .getPublicUrl(filePath);

            return publicUrl;
        });

        // Wait for all uploads to complete and filter out any failed uploads
        const imageUrls = (await Promise.all(uploadPromises)).filter(url => url !== null) as string[];

        // Update the scene with the image URLs
        const { error: updateError } = await supabase
            .from('scenes')
            .update({ images: imageUrls })
            .eq('id', sceneId);

        if (updateError) {
            console.error('Error updating scene with image URLs:', updateError);
        }

        return imageUrls;
    } catch (error) {
        console.error('Error in generateAndStoreImages:', error);
        return [];
    }
} 