# sad-bunny-cry

Deployment (Vercel)
1. Push this repository to GitHub.
2. Create a new Vercel project and import the repo (or run `vercel` from the project directory).
3. In the Vercel project settings add these Environment Variables:
	 - `REPLICATE_API_TOKEN` = your Replicate API token
	 - `REPLICATE_MODEL_VERSION` = the model *version id* you want to use (see Replicate docs)

Notes on Replicate integration
- The serverless endpoint `api/generate.js` forwards your uploaded image (data URL) and prompt to Replicate.
- You must pick an image-to-image / pose-transfer model on Replicate and set its version id in `REPLICATE_MODEL_VERSION`.
- Example workflow:
	- Upload an avatar image in the modal, check "Use cloud generator", enter a prompt, click Generate.
	- The client POSTs `{ image, prompt }` to `/api/generate`, which proxies the request to Replicate and returns a generated image data URL.

If you want, I can implement a default model choice for you (Replicate model/version id) — tell me which Replicate model you'd like to use and I will set it in the README and example env value.
# sad-bunny-cry