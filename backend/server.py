import os, base64, io, requests, time, hashlib
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from PIL import Image
from openai import OpenAI

load_dotenv()

app = Flask(__name__)
CORS(app)

client = OpenAI(api_key=os.getenv("OPENAI_KEY"))

# -----------------------------
# MEMORY STORES (simple + cheap)
# -----------------------------
RATE_LIMIT = {}      # ip → [timestamps]
COOLDOWN = {}        # ip → last request time
CACHE = {}           # hash → image base64
TOTAL_GENERATED = 0  # cost tracking

# -----------------------------
# SETTINGS
# -----------------------------
MAX_PER_MINUTE = 5
COOLDOWN_SECONDS = 2

STYLE_PROMPTS = {
    "anime": "anime style, cel shaded",
    "cartoon": "cartoon style, pixar lighting",
    "cyberpunk": "cyberpunk neon",
    "fantasy": "fantasy portrait",
    "custom": ""
}

POSES = {
    "crying_awards": "sitting, head down, hand covering face, crying",
    "thinking": "hand on chin thinking",
    "victory": "arms raised celebrating"
}

# -----------------------------
# HELPERS
# -----------------------------
def rate_limit_ok(ip):
    now = time.time()
    timestamps = RATE_LIMIT.get(ip, [])

    # remove old
    timestamps = [t for t in timestamps if now - t < 60]
    RATE_LIMIT[ip] = timestamps

    if len(timestamps) >= MAX_PER_MINUTE:
        return False

    timestamps.append(now)
    RATE_LIMIT[ip] = timestamps
    return True


def cooldown_ok(ip):
    now = time.time()
    last = COOLDOWN.get(ip, 0)

    if now - last < COOLDOWN_SECONDS:
        return False

    COOLDOWN[ip] = now
    return True


def make_cache_key(img_bytes, style, pose, extra):
    h = hashlib.sha256()
    h.update(img_bytes)
    h.update(style.encode())
    h.update(pose.encode())
    h.update(extra.encode())
    return h.hexdigest()


def convert_to_png(b64):
    raw = base64.b64decode(b64)
    img = Image.open(io.BytesIO(raw)).convert("RGBA")
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    buf.seek(0)
    return buf.read()

# -----------------------------
# ROUTE
# -----------------------------
@app.route("/api/generate-pfp", methods=["POST"])
def generate_pfp():
    global TOTAL_GENERATED

    ip = request.remote_addr

    if not rate_limit_ok(ip):
        return jsonify({"error": "Rate limit reached"}), 429

    if not cooldown_ok(ip):
        return jsonify({"error": "Slow down"}), 429

    data = request.json
    user_image_b64 = data.get("image")
    style = data.get("style", "cartoon")
    pose = data.get("pose", "crying_awards")
    extra_prompt = data.get("extra_prompt", "")

    if not user_image_b64:
        return jsonify({"error": "No image"}), 400

    try:
        png_bytes = convert_to_png(user_image_b64)

        # cache check
        key = make_cache_key(png_bytes, style, pose, extra_prompt)
        if key in CACHE:
            print("CACHE HIT")
            return jsonify({
                "image": CACHE[key],
                "cached": True
            })

        style_base = STYLE_PROMPTS.get(style, STYLE_PROMPTS["cartoon"])
        style_text = extra_prompt if style == "custom" else f"{style_base}, {extra_prompt}"
        pose_text = POSES.get(pose, POSES["crying_awards"])

        prompt = f"""
Keep same character and colors.
Apply pose: {pose_text}
Style: {style_text}
high detail
"""

        # ---------------------
        # TRY MODERN MODEL
        # ---------------------
        try:
            result = client.images.edit(
                model="gpt-image-1",
                image=("input.png", png_bytes, "image/png"),
                prompt=prompt,
                size="1024x1024"
            )

            image_base64 = result.data[0].b64_json
            model_used = "gpt-image-1"

        except Exception:
            result = client.images.edit(
                model="dall-e-2",
                image=("input.png", png_bytes, "image/png"),
                prompt=prompt,
                size="1024x1024"
            )

            image_url = result.data[0].url
            img_bytes = requests.get(image_url).content
            image_base64 = base64.b64encode(img_bytes).decode()
            model_used = "dall-e-2"

        CACHE[key] = image_base64
        TOTAL_GENERATED += 1

        print(f"Generated: {TOTAL_GENERATED}")

        return jsonify({
            "image": image_base64,
            "model": model_used,
            "cached": False
        })

    except Exception as e:
        print("ERROR:", e)
        return jsonify({"error": str(e)}), 500


@app.route("/stats")
def stats():
    return jsonify({
        "generated": TOTAL_GENERATED,
        "cache_size": len(CACHE)
    })


@app.route("/health")
def health():
    return jsonify({"status": "ok"})


if __name__ == "__main__":
    app.run(debug=True, port=5000)
