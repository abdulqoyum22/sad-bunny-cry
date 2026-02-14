const BASE_PROMPT = `
Subject is in a dramatic seated pose at a gala, head bowed with their right hand pressed firmly over their eyes in a gesture of deep grief. 
Subject is wearing a luxury black velvet tuxedo, a crisp white dress shirt with a black bow tie, and a large white floral carnation boutonniere on the left lapel. 
A high-end silver watch is prominent on the wrist of the hand covering the face. 
Cinematic lighting with a warm, blurry background of an awards ceremony audience and theater lights. 
35mm film photography style, high contrast, moody atmosphere. 
Preserve the exact face and identity from the input image.
`;

export default async function handler(req, res) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  try {
    const { imageBase64, prompt = "" } = req.body;
    if (!imageBase64)
      return res.status(400).json({ error: "No image provided" });

    const rawBase64 = imageBase64
      .replace(/^data:image\/\w+;base64,/, "")
      .replace(/\s/g, "");

    const finalPrompt = `${BASE_PROMPT} ${prompt}`.trim();

    const hfResponse = await fetch(
      "https://router.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.HUGGINGFACE_API_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputs: {
            image: rawBase64,
            prompt: finalPrompt,
          },
          parameters: {
            strength: 0.55,
            guidance_scale: 7.5,
            num_inference_steps: 30,
            negative_prompt:
              "blurry, low quality, deformed, extra limbs, bad anatomy, watermark, text",
          },
        }),
      }
    );

    if (!hfResponse.ok) {
      const errText = await hfResponse.text();
      console.error("HF Error:", errText);
      return res.status(500).json({ error: errText });
    }

    const arrayBuffer = await hfResponse.arrayBuffer();
    const base64Image = Buffer.from(arrayBuffer).toString("base64");
    const contentType = hfResponse.headers.get("content-type") || "image/png";

    return res.status(200).json({
      imageUrl: `data:${contentType};base64,${base64Image}`,
    });
  } catch (err) {
    console.error("Server Error:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}