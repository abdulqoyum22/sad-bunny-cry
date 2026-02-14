// Local dev server to serve static site and proxy to Replicate for /api/generate
// Usage: copy .env.example to .env and set REPLICATE_API_TOKEN and REPLICATE_MODEL_VERSION

require('dotenv').config();
const express = require('express');
const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

app.post('/api/generate', async (req, res) => {
  const token = process.env.REPLICATE_API_TOKEN;
  const modelVersion = process.env.REPLICATE_MODEL_VERSION;
  if (!token || !modelVersion) {
    return res.status(500).json({ error: 'Missing REPLICATE_API_TOKEN or REPLICATE_MODEL_VERSION in env' });
  }

  const { image, prompt } = req.body || {};
  if (!image) return res.status(400).json({ error: 'Missing image in request body' });

  // attach reference image (sadbunny logo) from disk if present
  let referenceDataUrl = null;
  try {
    const referencePath = process.env.REFERENCE_PATH || path.join(process.cwd(), 'images', 'sadbunny-logo.jpeg');
    if (fs.existsSync(referencePath)) {
      const buf = fs.readFileSync(referencePath);
      // determine content-type from extension
      const ext = path.extname(referencePath).toLowerCase();
      const mime = ext === '.png' ? 'image/png' : ext === '.webp' ? 'image/webp' : 'image/jpeg';
      referenceDataUrl = `data:${mime};base64,${buf.toString('base64')}`;
    }
  } catch (err) {
    console.warn('Could not read reference image', err);
  }

  try {
    const createRes = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        version: modelVersion,
        input: Object.assign({ image, prompt }, referenceDataUrl ? { reference: referenceDataUrl } : {})
      })
    });

    if (!createRes.ok) {
      const txt = await createRes.text();
      return res.status(502).json({ error: 'Replicate create failed', detail: txt });
    }

    let prediction = await createRes.json();

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
});

// ChatGPT prompt refinement endpoint
app.post('/api/chat', async (req, res) => {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return res.status(500).json({ error: 'Missing OPENAI_API_KEY in env' });

  const { prompt } = req.body || {};
  if (!prompt) return res.status(400).json({ error: 'Missing prompt in request body' });

  try {
    const resp = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${key}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'You are a helpful image prompt engineer. Refine the user prompt for an image-to-image pose transfer that maps the user photo to the posture and style of the reference Sad Bunny logo. Output only the single final prompt.' },
          { role: 'user', content: prompt }
        ],
        max_tokens: 300
      })
    });

    if (!resp.ok) {
      const txt = await resp.text();
      return res.status(502).json({ error: 'OpenAI chat failed', detail: txt });
    }

    const j = await resp.json();
    const content = j.choices && j.choices[0] && j.choices[0].message && j.choices[0].message.content;
    return res.status(200).json({ prompt: content });
  } catch (err) {
    console.error('chat error', err);
    return res.status(500).json({ error: 'Server error', detail: String(err) });
  }
});

// Serve static files (index.html, css, images, script.js)
app.use(express.static(path.join(process.cwd())));

app.listen(PORT, () => {
  console.log(`Dev server listening on http://localhost:${PORT}`);
});
