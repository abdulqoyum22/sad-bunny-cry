import os, base64, io, requests
from openai import OpenAI

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

CORS_HEADERS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json"
}


STYLE_PROMPTS = {
    "anime": "anime style, studio ghibli, cel shaded, vibrant colors",
    "cartoon": "cartoon style, pixar 3d render, smooth shading, colorful",
    "cyberpunk": "cyberpunk style, neon lights, futuristic, dark city background",
    "fantasy": "fantasy portrait, magical lighting, ethereal atmosphere, high detail",
    "oilpaint": "oil painting style, classic portrait, thick brush strokes, fine art",
    "pixel": "pixel art style, 16-bit retro game, sharp pixels",
    "sketch": "pencil sketch, detailed line art, black and white illustration",
    "custom": ""
}

def handler(request):
    if request.method == "OPTIONS":
        return {"statusCode": 200, "headers": CORS_HEADERS, "body": ""}
    
    if request.method != "POST":
        return {"statusCode": 405, "headers": CORS_HEADERS, "body": "Method not allowed"}


    try:
        data = request.get_json()
        user_image_b64 = data.get("image")
        style = data.get("style", "anime")
        extra_prompt = data.get("extra_prompt", "")

        if not user_image_b64:
            return {"statusCode": 400, "body": "No image provided"}

        # decode user image
        user_image_bytes = base64.b64decode(user_image_b64)

        # load pose reference
        BASE_DIR = os.path.dirname(__file__)
        pose_path = os.path.join(BASE_DIR, "pose_reference.jpeg")

        with open(pose_path, "rb") as f:
            pose_bytes = f.read()

        # build style text
        style_prompt = STYLE_PROMPTS.get(style, STYLE_PROMPTS["anime"])
        if style == "custom":
            style_text = extra_prompt
        else:
            style_text = f"{style_prompt}, {extra_prompt}".strip(", ")

        # -------- ANALYZE USER IMAGE (same as server.py) --------
        analysis = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": "Describe this subject in extreme detail - all visual features, colors, style, type, clothing:"},
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:image/png;base64,{base64.b64encode(user_image_bytes).decode()}"
                            }
                        },
                    ],
                }
            ],
            max_tokens=400,
        )

        subject = analysis.choices[0].message.content

        # -------- SAME PROMPT AS YOUR server.py --------
        prompt = (
            f"{subject}, sitting down crying at the Grammy Awards ceremony, "
            f"one hand raised covering face with fingers spread across eyes, head tilted down, "
            f"emotional moment, tears, sad expression, "
            f"Grammy award ceremony background with audience and stage lights, "
            f"{style_text}, "
            f"high quality, detailed, cinematic"
        )

        # -------- GENERATE IMAGE (fallback model) --------
        response = client.images.generate(
            model="dall-e-2",
            prompt=prompt[:1000],
            size="1024x1024",
            n=1,
        )

        image_url = response.data[0].url
        img = requests.get(image_url).content
        result_b64 = base64.b64encode(img).decode()

        return {
            "statusCode": 200,
            "headers": {"Content-Type": "application/json"},
            "body": '{"image":"' + result_b64 + '"}'
        }

    except Exception as e:
        return {
            "statusCode": 500,
            "body": str(e)
        }