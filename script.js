

// Add scroll animation styles
const style = document.createElement('style');
style.textContent = `
  .fade-in-up {
    opacity: 0;
    transform: translateY(30px);
    transition: opacity 0.8s ease, transform 0.8s ease;
  }
  
  .fade-in-up.visible {
    opacity: 1;
    transform: translateY(0);
  }
  
  .slide-up {
    opacity: 0;
    transform: translateY(50px);
    transition: opacity 0.8s ease, transform 0.8s ease;
  }
  
  .slide-up.visible {
    opacity: 1;
    transform: translateY(0);
  }
  
  .gallery-img {
    opacity: 0;
    transform: scale(0.9);
    transition: opacity 0.6s ease, transform 0.6s ease;
  }
  
  .gallery-img.visible {
    opacity: 1;
    transform: scale(1);
  }
  
  .step-box {
    opacity: 0;
    transform: scale(0.8);
    transition: opacity 0.6s ease, transform 0.6s ease;
  }
  
  .step-box.visible {
    opacity: 1;
    transform: scale(1);
  }
  
  .footer-slide {
    opacity: 0;
    transform: translateY(60px);
    transition: opacity 0.8s ease, transform 0.8s ease;
  }
  
  .footer-slide.visible {
    opacity: 1;
    transform: translateY(0);
  }
`;
document.head.appendChild(style);

// Initialize scroll observer
const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry, index) => {
    if (entry.isIntersecting) {
      if (entry.target.classList.contains('step-box')) {
        // Stagger animation for step boxes
        setTimeout(() => {
          entry.target.classList.add('visible');
        }, index * 150);
      } else {
        entry.target.classList.add('visible');
      }
    }
  });
}, observerOptions);

// Observe all animated elements
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.fade-in-up, .slide-up, .gallery-img, .step-box, .footer-slide').forEach(el => {
    observer.observe(el);
  });
});

const pairAddress = "2vZ69t7nupP6FDSM6ykCJHGKYEmqEbTq72YNmL2MKuPx";

async function loadTokenData() {
    try {
        const res = await fetch(`https://api.dexscreener.com/latest/dex/pairs/solana/${pairAddress}`);

        const data = await res.json();
        const pair = data.pairs[0];

            if (pair) {
        document.getElementById("price").textContent = "$" + Number(pair.priceUsd).toFixed(6);
        document.getElementById("liquidity").textContent = "$" + Math.round(pair.liquidity.usd).toLocaleString();
        document.getElementById("mc").textContent = "$" + Math.round(pair.fdv).toLocaleString();
        document.getElementById("vol").textContent = "$" + Math.round(pair.volume.h24).toLocaleString();
            }
    } catch (err) {
        console.log("error loading token data", err);
    }
}

loadTokenData();
setInterval(loadTokenData, 10000);


function copyCA(evt) {
  const text = document.getElementById("contractAddress").innerText;
  navigator.clipboard.writeText(text).catch(() => {});

  const btn = (evt && (evt.currentTarget || evt.target)) || document.querySelector('button[onclick^="copyCA"]');
  if (btn) {
    const prev = btn.innerText;
    btn.innerText = "COPIED";
    setTimeout(() => {
      btn.innerText = prev || "COPY";
    }, 1500);
  }
}

document.querySelectorAll('section img').forEach(img => {
  img.addEventListener('click', () => {
    document.getElementById('lightboxImg').src = img.src;
    document.getElementById('lightbox').classList.remove('hidden');
  });
});

const lightboxEl = document.getElementById('lightbox');
if (lightboxEl) {
  lightboxEl.addEventListener('click', () => {
    lightboxEl.classList.add('hidden');
  });
}

const menuToggle = document.getElementById("menuToggle");
const menuContent = document.getElementById("menuContent");
const openPfp = document.getElementById("openPfp");
const closePfp = document.getElementById("closePfp");
const pfpBackdrop = document.getElementById("pfpBackdrop");

let menuOpen = false;

if (menuToggle && menuContent) {
  menuToggle.addEventListener("click", () => {
    menuOpen = !menuOpen;
    if (menuOpen) {
      menuContent.classList.remove("-translate-x-full");
      menuContent.classList.add("translate-x-0");
    } else {
      menuContent.classList.remove("translate-x-0");
      menuContent.classList.add("-translate-x-full");
    }
  });
}

if (openPfp && menuContent) {
  openPfp.addEventListener("click", () => {
    menuContent.classList.remove("-translate-x-full");
    menuContent.classList.add("translate-x-0");
    menuOpen = true;
  });
}

if (closePfp && menuContent) {
  closePfp.addEventListener("click", () => {
    menuContent.classList.remove("translate-x-0");
    menuContent.classList.add("-translate-x-full");
    menuOpen = false;
  });
}

if (pfpBackdrop && closePfp) {
  pfpBackdrop.addEventListener('click', () => closePfp.click());
}

const generateBtn = document.getElementById("generateBtn");
const seedInput = document.getElementById("seedInput");
const uploadFile = document.getElementById("uploadFile");
const avatarImg = document.getElementById("avatarImg");
const downloadBtn = document.getElementById("downloadBtn");

// No client-side preview: local generator will read the uploaded file when needed.

// Simple local PFP generator: composite preview + small crying tear + prompt label
async function generatePFPLocal() {
  const size = 1024;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  // background dark
  ctx.fillStyle = '#0f0a0a';
  ctx.fillRect(0,0,size,size);

  // load source image: use uploaded file if present, otherwise fallback image
  let src = './images/sadbunny3.jpeg';
  if (uploadFile && uploadFile.files && uploadFile.files[0]) {
    src = await new Promise((res, rej) => {
      const r = new FileReader();
      r.onload = () => res(r.result);
      r.onerror = rej;
      r.readAsDataURL(uploadFile.files[0]);
    }).catch(() => './images/sadbunny3.jpeg');
  } else if (avatarImg && avatarImg.src) {
    src = avatarImg.src;
  }

  const img = await new Promise((res, rej) => {
    const i = new Image();
    i.crossOrigin = 'anonymous';
    i.onload = () => res(i);
    i.onerror = rej;
    i.src = src;
  }).catch(() => null);

  if (img) {
    // cover-fit draw
    const sw = img.width, sh = img.height;
    const sr = Math.max(size/sw, size/sh);
    const dw = sw * sr, dh = sh * sr;
    const dx = (size - dw)/2, dy = (size - dh)/2;
    ctx.drawImage(img, dx, dy, dw, dh);
  }

  // vignette
  const grad = ctx.createRadialGradient(size*0.5, size*0.4, size*0.2, size*0.5, size*0.5, size*0.9);
  grad.addColorStop(0, 'rgba(0,0,0,0)');
  grad.addColorStop(1, 'rgba(0,0,0,0.45)');
  ctx.fillStyle = grad;
  ctx.fillRect(0,0,size,size);

  // draw a simple red tear in lower-right quadrant to evoke "crying" (stylized)
  ctx.fillStyle = 'rgba(185,28,28,0.9)';
  ctx.beginPath();
  const tx = size * 0.65, ty = size * 0.55;
  ctx.ellipse(tx, ty, size*0.035, size*0.06, Math.PI*0.15, 0, Math.PI*2);
  ctx.fill();

  // prompt text overlay
  const prompt = (seedInput && seedInput.value) ? seedInput.value : '';
  if (prompt) {
    ctx.fillStyle = 'rgba(243,243,243,0.95)';
    ctx.font = 'bold 36px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(prompt, size/2, size - 60);
  }

  // set preview + download
  const dataUrl = canvas.toDataURL('image/png');
  if (avatarImg) avatarImg.src = dataUrl;
  if (downloadBtn) {
    downloadBtn.href = dataUrl;
    downloadBtn.download = 'sad-bunny-pfp.png';
    downloadBtn.classList.remove('hidden');
  }
}

async function generatePFPCloud() {
  if (!uploadFile || !uploadFile.files || !uploadFile.files[0]) {
    alert("Please upload an image first.");
    return;
  }

  const file = uploadFile.files[0];

  // Convert image to base64
  const base64 = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result.split(',')[1]; // remove data:image/... prefix
      resolve(result);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  // Call your Vercel API
  const response = await fetch('/api/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      imageBase64: base64,
      prompt: seedInput ? seedInput.value : ""
    })
  });

  const data = await response.json();

  if (!response.ok || !data.imageUrl) {
    throw new Error(data.error || "Generation failed");
  }

  // Update preview
  if (avatarImg) avatarImg.src = data.imageUrl;

  // Enable download
  if (downloadBtn) {
    downloadBtn.href = data.imageUrl;
    downloadBtn.download = "sad-bunny-pfp.jpg";
    downloadBtn.classList.remove('hidden');
  }
}

// Replace your generateBtn listener with this:
if (generateBtn) {
  generateBtn.addEventListener('click', async () => {
    generateBtn.disabled = true;
    generateBtn.innerText = "Generating...";

    // Show status under button if element exists
    const statusEl = document.getElementById("generateStatus");
    if (statusEl) {
      statusEl.textContent = "Warming up model, this can take 20–40s...";
      statusEl.classList.remove("hidden");
    }

    try {
      await generatePFPCloud();
      if (statusEl) statusEl.textContent = "Done!";
    } catch (err) {
      console.error("Generation error:", err);
      if (statusEl) {
        statusEl.textContent = "Failed: " + err.message;
      } else {
        alert("Generation failed: " + err.message);
      }
    } finally {
      generateBtn.disabled = false;
      generateBtn.innerText = "Generate PFP";
    }
  });
}
