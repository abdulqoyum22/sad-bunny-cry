// app/api/generate.js
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('image') as File | null;
    // Optional: user can add extra text, but we use your base prompt mainly
    const userPrompt = formData.get('prompt') as string || '';

    if (!file) {
      return NextResponse.json({ error: 'No image uploaded' }, { status: 400 });
    }

    // Convert uploaded file to base64
    const arrayBuffer = await file.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString('base64');

    // Your full dramatic Sad Bunny gala prompt
    const basePrompt = `Subject is in a dramatic seated pose at a gala, head bowed with their right hand pressed firmly over their eyes in a gesture of deep grief. Subject is wearing a luxury black velvet tuxedo, a crisp white dress shirt with a black bow tie, and a large white floral carnation boutonniere on the left lapel. A high-end silver watch is prominent on the wrist of the hand covering the face. Cinematic lighting with a warm, blurry background of an awards ceremony audience and theater lights. 35mm film photography style, high contrast, moody atmosphere. Preserve the exact face and identity from the input image. ${userPrompt}`;

    // Hugging Face img2img endpoint (using a good free model)
    // You can swap model: e.g. 'stabilityai/stable-diffusion-2-1' or 'runwayml/stable-diffusion-v1-5'
    const model = 'runwayml/stable-diffusion-v1-5'; // classic, works free
    const apiUrl = `https://api-inference.huggingface.co/models/${model}`;

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.HUGGINGFACE_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: base64,  // base64 image as starting point
        parameters: {
          prompt: basePrompt,
          negative_prompt: 'blurry, low quality, deformed, extra limbs, bad anatomy, watermark, text',
          strength: 0.55,       // 0.0-1.0; higher = more change, lower = keep more original face
          guidance_scale: 7.5,  // how strongly to follow prompt
          num_inference_steps: 30,
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('HF error:', errorText);
      return NextResponse.json({ error: 'Generation failed - check token or queue' }, { status: 500 });
    }

    const blob = await response.blob();
    const generatedUrl = URL.createObjectURL(blob); // for preview (client will handle better)

    // But to return proper URL/base64 for your frontend preview/download
    // Convert blob to base64 for easy <img src>
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    const base64Generated = await new Promise<string>((resolve) => {
      reader.onloadend = () => resolve(reader.result as string);
    });

    return NextResponse.json({ imageUrl: base64Generated });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}