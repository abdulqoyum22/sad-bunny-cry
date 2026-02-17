import os
import base64
import json
import requests
import io
from openai import OpenAI
from PIL import Image  # REQUIRED: Add 'Pillow' to your requirements.txt

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

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
    if request.method != "POST":
        return {
            "statusCode": 405,
            "headers": {"Content-Type": "application/json"},
            "body": json.dumps({"error": "Method not allowed"})
        }

    try:
        data = request.get_json() or {}
        user_image_b64 = data.get("image")
        style = data.get("style", "anime")
        extra_prompt = data.get("extra_prompt", "")

        if not user_image_b64:
            return {
                "statusCode": 400,
                "headers": {"Content-Type": "application/json"},
                "body": json.dumps({"error": "No image provided"})
            }

        # 1. Decode user image (for GPT analysis)
        user_image_bytes = base64.b64decode(user_image_b64)

        # 2. Process Pose Reference (CRITICAL FIX)
        # OpenAI REQUIRES images to be PNG and Square for edits.
        BASE_DIR = os.path.dirname(__file__)
        pose_path = os.path.join(BASE_DIR, "pose_reference.jpeg")

        # Convert JPEG to PNG byte stream in memory
        with Image.open(pose_path) as img:
            # Resize to 1024x1024 to match DALL-E requirements (or 512x512)
            img = img.convert("RGBA").resize((1024, 1024))
            
            # Save pose as PNG bytes
            pose_byte_arr = io.BytesIO()
            img.save(pose_byte_arr, format='PNG')
            pose_byte_arr = pose_byte_arr.getvalue()

            # Create a transparent mask (Required for edit endpoint)
            # We make it fully transparent so the AI can regenerate the whole area 
            # while using the pose image as a "guide".
            mask_byte_arr = io.BytesIO()
            # A fully transparent mask allows DALL-E to draw over the whole image
            mask_img = Image.new("RGBA", (1024, 1024), (0, 0, 0, 0)) 
            mask_img.save(mask_byte_arr, format='PNG')
            mask_byte_arr = mask_byte_arr.getvalue()

        # Build style text
        style_prompt = STYLE_PROMPTS.get(style, STYLE_PROMPTS["anime"])
        if style == "custom":
            style_text = extra_prompt
        else:
            style_text = f"{style_prompt}, {extra_prompt}".strip(", ")

        # 3. Analyze user image to get character description
        analysis = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": "Describe the person in this image concisely (hair color, eye color, clothing, gender, accessories):"},
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:image/png;base64,{base64.b64encode(user_image_bytes).decode()}"
                            }
                        },
                    ],
                }
            ],
            max_tokens=150,
        )

        subject = analysis.choices[0].message.content

        # Generate prompt incorporating the pose description
        # We still describe the pose in text to reinforce the image guide
        prompt = (
            f"{subject}, sitting down crying at the Grammy Awards ceremony, "
            f"one hand raised covering face, "
            f"emotional moment, "
            f"Grammy award ceremony background, "
            f"{style_text}, "
            f"high quality"
        )

        # 4. Generate Image using EDIT (Img2Img)
        # We pass the pose as the 'image' and the prompt.
        response = client.images.edit(
            model="dall-e-2",
            image=pose_byte_arr,
            mask=mask_byte_arr,
            prompt=prompt[:1000],
            n=1,
            size="1024x1024"
        )

        image_url = response.data[0].url
        img = requests.get(image_url).content
        result_b64 = base64.b64encode(img).decode()

        return {
            "statusCode": 200,
            "headers": {"Content-Type": "application/json"},
            "body": json.dumps({"image": result_b64})
        }

    except Exception as e:
        print(f"ERROR: {str(e)}")
        return {
            "statusCode": 500,
            "headers": {"Content-Type": "application/json"},
            "body": json.dumps({"error": str(e)})
        }