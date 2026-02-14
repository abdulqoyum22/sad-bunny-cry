// Serverless endpoint for Vercel that proxies image-to-image requests to Replicate.
// Expects JSON POST: { image: '<data-url>', prompt: '...' }
// Environment variables required:
// - REPLICATE_API_TOKEN : your Replicate API token
// - REPLICATE_MODEL_VERSION : the Replicate model version id (not the model name)
// Example: set these in Vercel Project Settings -> Environment Variables.

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  const token = process.env.REPLICATE_API_TOKEN;
  const modelVersion = process.env.REPLICATE_MODEL_VERSION;
  if (!token || !modelVersion) {
    return res.status(500).json({ error: 'Missing REPLICATE_API_TOKEN or REPLICATE_MODEL_VERSION in env' });
  }

  const { image, prompt } = req.body || {};
  if (!image) return res.status(400).json({ error: 'Missing image in request body' });

  try {
    const createRes = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        version: modelVersion,
        input: { image, prompt }
      })
    });

    if (!createRes.ok) {
      const txt = await createRes.text();
      return res.status(502).json({ error: 'Replicate create failed', detail: txt });
    }

    let prediction = await createRes.json();

    // poll prediction until finished
    const headers = { 'Authorization': `Token ${token}`, 'Content-Type': 'application/json' };
    const timeout = 60 * 1000; // 60s
    const started = Date.now();
    while (prediction.status !== 'succeeded' && prediction.status !== 'failed') {
      if (Date.now() - started > timeout) break;
      await new Promise(r => setTimeout(r, 2000));
      const statusRes = await fetch(`https://api.replicate.com/v1/predictions/${prediction.id}`, { headers });
      prediction = await statusRes.json();
    }

    if (prediction.status === 'failed') return res.status(502).json({ error: 'Prediction failed', detail: prediction });
    if (!prediction.output || prediction.output.length === 0) return res.status(502).json({ error: 'No output from prediction', detail: prediction });

    // fetch first output URL (usually a publicly accessible image link)
    const outUrl = prediction.output[0];
    const imgRes = await fetch(outUrl);
    const buffer = await imgRes.arrayBuffer();
    const b64 = Buffer.from(buffer).toString('base64');
    const contentType = imgRes.headers.get('content-type') || 'image/png';
    const dataUrl = `data:${contentType};base64,${b64}`;

    return res.status(200).json({ image: dataUrl });
  } catch (err) {
    console.error('generate error', err);
    return res.status(500).json({ error: 'Server error', detail: String(err) });
  }
}
import multer from "multer";
import { Configuration, OpenAIApi } from "openai";
import dotenv from "dotenv";

dotenv.config();

export const config = {
  api: { bodyParser: false },
};

const upload = multer();

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

export default async function handler(req, res) {
  try {
    await new Promise((resolve, reject) => {
      upload.single("image")(req, res, (err) => (err ? reject(err) : resolve()));
    });

    const prompt = req.body.prompt || "";

    const response = await openai.images.generate({
      prompt: `Crying bunny cartoon in dark cinematic style, based on: ${prompt}`,
      size: "512x512",
    });

    const imageUrl = response.data.data[0].url;
    res.status(200).json({ image: imageUrl });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error generating image");
  }
}
