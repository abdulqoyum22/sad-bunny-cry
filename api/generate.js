import multer from "multer";
import { Configuration, OpenAIApi } from "openai";
import dotenv from "dotenv";

dotenv.config();

// multer memory storage for image-to-image
const upload = multer({ storage: multer.memoryStorage() });

export const config = { api: { bodyParser: false } };

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

const BASE_PROMPT = `
Subject is in a dramatic seated pose at a gala, head bowed with their right hand pressed firmly over their eyes in a gesture of deep grief. Subject is wearing a luxury black velvet tuxedo, a crisp white dress shirt with a black bow tie, and a large white floral carnation boutonniere on the left lapel. A high-end silver watch is prominent on the wrist of the hand covering the face. Cinematic lighting with a warm, blurry background of an awards ceremony audience and theater lights. 35mm film photography style, high contrast, moody atmosphere
`;

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method Not Allowed" });

  try {
    // process uploaded image if exists
    await new Promise((resolve, reject) => {
      upload.single("image")(req, res, (err) => (err ? reject(err) : resolve()));
    });

    // use extra prompt if user types one
    const extraPrompt = req.body.prompt || "";
    const finalPrompt = BASE_PROMPT + (extraPrompt ? ` Additional edits: ${extraPrompt}` : "");

    let imageUrl;

    if (req.file) {
      // image-to-image
      const response = await openai.images.edit({
        image: req.file.buffer,
        prompt: finalPrompt,
        size: "512x512",
      });
      imageUrl = response.data.data[0].url;
    } else {
      // text-to-image (if no file, still uses base prompt)
      const response = await openai.images.generate({
        prompt: finalPrompt,
        size: "512x512",
      });
      imageUrl = response.data.data[0].url;
    }

    res.status(200).json({ image: imageUrl });
  } catch (err) {
    console.error("generate error", err);
    res.status(500).json({ error: "Error generating image", detail: String(err) });
  }
}