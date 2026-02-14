// api/generate.js  (plain Node.js for Vercel serverless)

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    // Vercel gives req as a readable stream for multipart; we need to parse it manually or use a lib.
    // For simplicity: Assume frontend sends base64 image (easier, no extra deps).
    // If you want full multipart parsing, add 'formidable' to deps (see below).

    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', async () => {
      let data;
      try {
        data = JSON.parse(body);
      } catch (e) {
        res.status(400).json({ error: 'Invalid JSON' });
        return;
      }

      const { imageBase64, prompt = '' } = data;

      if (!imageBase64) {
        res.status(400).json({ error: 'No image provided' });
        return;
      }

      const basePrompt = `Subject is in a dramatic seated pose at a gala, head bowed with their right hand pressed firmly over their eyes in a gesture of deep grief. Subject is wearing a luxury black velvet tuxedo, a crisp white dress shirt with a black bow tie, and a large white floral carnation boutonniere on the left lapel. A high-end silver watch is prominent on the wrist of the hand covering the face. Cinematic lighting with a warm, blurry background of an awards ceremony audience and theater lights. 35mm film photography style, high contrast, moody atmosphere. Preserve the exact face and identity from the input image. ${prompt}`;

      const model = 'runwayml/stable-diffusion-v1-5';
      const apiUrl = `https://api-inference.huggingface.co/models/${model}`;

      const hfResponse = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.HUGGINGFACE_API_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: imageBase64,  // base64 without 'data:image/...;base64,' prefix
          parameters: {
            prompt: basePrompt,
            negative_prompt: 'blurry, low quality, deformed, extra limbs, bad anatomy, watermark, text',
            strength: 0.55,
            guidance_scale: 7.5,
            num_inference_steps: 30,
          },
        }),
      });

      if (!hfResponse.ok) {
        const err = await hfResponse.text();
        console.error(err);
        res.status(500).json({ error: 'HF generation failed' });
        return;
      }

      const blob = await hfResponse.blob();
      const arrayBuffer = await blob.arrayBuffer();
      const generatedBase64 = Buffer.from(arrayBuffer).toString('base64');

      res.status(200).json({ imageUrl: `data:image/jpeg;base64,${generatedBase64}` });
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Optional: If you want Vercel to not parse body (for large/multipart), add this at bottom
module.exports.config = {
  api: {
    bodyParser: false,  // Let us handle raw body for streams
  },
};