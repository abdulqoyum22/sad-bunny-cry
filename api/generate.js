import fetch from "node-fetch";

const BASE_PROMPT = `
Subject is in a dramatic seated pose at a gala, head bowed with their right hand pressed firmly over their eyes in a gesture of deep grief. 
Subject is wearing a luxury black velvet tuxedo, a crisp white dress shirt with a black bow tie, and a large white floral carnation boutonniere on the left lapel. 
A high-end silver watch is prominent on the wrist of the hand covering the face. 
Cinematic lighting with a warm, blurry background of an awards ceremony audience and theater lights. 
35mm film photography style, high contrast, moody atmosphere. 
Preserve the exact face and identity from the input image.
`;

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { imageBase64, prompt = "" } = req.body;
    if (!imageBase64) return res.status(400).json({ error: "No image provided" });

    // Remove spaces/newlines, ensure proper data URL
    const cleanBase64 = imageBase64.replace(/\s/g, "");
    const dataUrl = `data:image/png;base64,${cleanBase64}`;
    const finalPrompt = `${BASE_PROMPT} ${prompt}`;

    const hfResponse = await fetch(
      "https://api-inference.huggingface.co/models/runwayml/stable-diffusion-v1-5",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.HUGGINGFACE_API_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputs: finalPrompt,
          parameters: {
            init_image: dataUrl,
            strength: 0.55,
            guidance_scale: 7.5,
            num_inference_steps: 30,
            negative_prompt: "blurry, low quality, deformed, extra limbs, bad anatomy, watermark, text",
          },
        }),
      }
    );

    const output = await hfResponse.json();

    if (output.error) {
      console.error("HF Error:", output.error);
      return res.status(500).json({ error: output.error });
    }

    const generatedBase64 = output[0]?.generated_image;
    if (!generatedBase64) return res.status(500).json({ error: "No image returned from HF" });

    return res.status(200).json({ imageUrl: `data:image/png;base64,${generatedBase64}` });
  } catch (err) {
    console.error("Server Error:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}