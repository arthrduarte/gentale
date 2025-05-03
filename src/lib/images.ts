import { createClient } from '@/lib/supabase/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API!)

export async function generateAndStoreImages(prompt: string, sceneId: string): Promise<string[]> {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp-image-generation" });
    const supabase = await createClient()

    try {
        // Generate two images with slightly different prompts for variety
        const imagePrompts = [
            `Create a whimsical, children's storybook style illustration of: ${prompt}. Style: soft pastel colors, gentle shapes, magical atmosphere.`,
            `Create a different angle/perspective of this scene: ${prompt}. Style: children's book illustration, dreamy watercolor effect, enchanting details.`
        ];

        // Start both image generations concurrently
        const imagePromises = imagePrompts.map(async (imagePrompt) => {
            const result = await model.generateContent({
                contents: [{ role: 'user', parts: [{ text: imagePrompt }] }],
                generationConfig: {
                    temperature: 0.9,
                }
            });
            const response = await result.response;
            const imageData = response.text(); // This will be base64 image data
            return imageData;
        });

        // Wait for both images to be generated
        const imageDataArray = await Promise.all(imagePromises);

        // Upload images to Supabase storage
        const uploadPromises = imageDataArray.map(async (base64Data, index) => {
            const buffer = Buffer.from(base64Data.split(',')[1], 'base64');
            const fileName = `${sceneId}-${index}.png`;
            const filePath = `scenes/${fileName}`;

            const { data: uploadData, error: uploadError } = await supabase
                .storage
                .from('images')
                .upload(filePath, buffer, {
                    contentType: 'image/png',
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