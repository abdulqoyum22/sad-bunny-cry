// Vercel serverless function for PFP generation
// Uses HuggingFace Inference API for image-to-image generation

const BASE_PROMPT = `
Subject is in a dramatic seated pose at a gala, head bowed with their right hand pressed firmly over their eyes in a gesture of deep grief. 
Subject is wearing a luxury black velvet tuxedo, a crisp white dress shirt with a black bow tie, and a large white floral carnation boutonniere on the left lapel. 
A high-end silver watch is prominent on the wrist of the hand covering the face. 
Cinematic lighting with a warm, blurry background of an awards ceremony audience and theater lights. 
35mm film photography style, high contrast, moody atmosphere. 
Preserve the exact face and identity from the input image.
`;

// Vercel serverless function handler
export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  // Check for HuggingFace API token
  const hfToken = process.env.HUGGINGFACE_API_TOKEN;
  if (!hfToken) {
    return res.status(500).json({ error: 'Server configuration error: Missing API token. Please set HUGGINGFACE_API_TOKEN environment variable.' });
  }

  try {
    const { imageBase64, prompt = '' } = req.body;
    
    if (!imageBase64) {
      return res.status(400).json({ error: 'No image provided. Please upload an image.' });
    }

    // Clean up base64 string
    const rawBase64 = imageBase64
      .replace(/^data:image\/\w+;base64,/, '')
      .replace(/\s/g, '');

    const finalPrompt = `${BASE_PROMPT} ${prompt}`.trim();

    // Use HuggingFace Inference API for image-to-image
    // Using stabilityai/stable-diffusion-xl-base-1.0 with img2img
    // Replace your current fetch body with this:
const hfResponse = await fetch(
  'https://api-inference.huggingface.co',
  {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${hfToken}`,
      // The API uses the 'inputs' header or specific params for the prompt
      'X-Wait-For-Model': 'true', 
    },
    body: Buffer.from(rawBase64, 'base64'), 
  }
);

        body: JSON.stringify({
          inputs: finalPrompt,
          parameters: {
            image: rawBase64,
            strength: 0.55,
            guidance_scale: 7.5,
            num_inference_steps: 30,
            negative_prompt: 'blurry, low quality, deformed, extra limbs, bad anatomy, watermark, text, distortion',
          },
        }),
      }
    );

    if (!hfResponse.ok) {
      const errText = await hfResponse.text();
      console.error('HuggingFace API Error:', errText);
      return res.status(500).json({ error: `AI generation failed: ${errText}` });
    }

    // Get the image buffer
    const arrayBuffer = await hfResponse.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);
    const base64Image = Buffer.from(buffer).toString('base64');
    const contentType = hfResponse.headers.get('content-type') || 'image/png';

    return res.status(200).json({
      imageUrl: `data:${contentType};base64,${base64Image}`,
    });
  } catch (err) {
    console.error('Server Error:', err);
    return res.status(500).json({ error: `Internal server error: ${err.message}` });
  }
}
