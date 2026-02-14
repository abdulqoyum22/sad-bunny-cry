// api/generate.js 

export default async function handler(req, res) {
  // 1. Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Vercel handles body parsing automatically
    const { imageBase64, prompt = '' } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: 'No image provided' });
    }

    // This is your full original base prompt
    const basePrompt = `Subject is in a dramatic seated pose at a gala, head bowed with their right hand pressed firmly over their eyes in a gesture of deep grief. Subject is wearing a luxury black velvet tuxedo, a crisp white dress shirt with a black bow tie, and a large white floral carnation boutonniere on the left lapel. A high-end silver watch is prominent on the wrist of the hand covering the face. Cinematic lighting with a warm, blurry background of an awards ceremony audience and theater lights. 35mm film photography style, high contrast, moody atmosphere. Preserve the exact face and identity from the input image. ${prompt}`;

    // 2. Call Hugging Face
    const hfResponse = await fetch(
      "https://api-inference.huggingface.co/models/runwayml/stable-diffusion-v1-5",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.HUGGINGFACE_API_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputs: basePrompt, 
          parameters: {
            // Passing the image for Image-to-Image transformation
            image: imageBase64,
            negative_prompt: 'blurry, low quality, deformed, extra limbs, bad anatomy, watermark, text',
            strength: 0.55,
            guidance_scale: 7.5,
            num_inference_steps: 30,
          },
        }),
      }
    );

    if (!hfResponse.ok) {
      const errorText = await hfResponse.text();
      console.error("HF Error:", errorText);
      return res.status(500).json({ error: 'HF generation failed' });
    }

    // 3. Convert binary response to Base64 to send back to your frontend
    const arrayBuffer = await hfResponse.arrayBuffer();
    const generatedBase64 = Buffer.from(arrayBuffer).toString('base64');

    return res.status(200).json({ 
      imageUrl: `data:image/jpeg;base64,${generatedBase64}` 
    });

  } catch (error) {
    console.error("Server Error:", error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
