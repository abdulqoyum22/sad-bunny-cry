

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




// ─────────────────────────────────────────
// AI PFP GENERATOR
// ─────────────────────────────────────────

let selectedStyle = 'anime';
let uploadedImageBase64 = null;

function handlePFPUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  const preview = document.getElementById('uploadPreview');
  const placeholder = document.getElementById('uploadPlaceholder');
  const reader = new FileReader();

  reader.onload = function(e) {
    preview.src = e.target.result;
    preview.classList.remove('hidden');
    placeholder.classList.add('hidden');
    uploadedImageBase64 = e.target.result.split(',')[1];
  };

  reader.readAsDataURL(file);
}

function selectStyle(style, btn) {
  selectedStyle = style;

  document.querySelectorAll('.style-btn').forEach(function(b) {
    b.style.border = '1px solid rgba(185,28,28,0.2)';
    b.style.background = '#1a0f0f';
    b.style.color = '#a8a29e';
  });

  btn.style.border = '1px solid #b91c1c';
  btn.style.background = 'rgba(185,28,28,0.15)';
  btn.style.color = '#b91c1c';
}

async function generatePFP() {
  if (!uploadedImageBase64) {
    showPFPError('Please upload a photo first!');
    return;
  }

  const btn = document.getElementById('pfpGenerateBtn');
  const errorEl = document.getElementById('pfpError');
  const resultEl = document.getElementById('pfpResult');
  const extraPrompt = document.getElementById('pfpCustomPrompt').value;

  errorEl.classList.add('hidden');
  resultEl.classList.add('hidden');

  btn.textContent = 'Generating... please wait ⏳';
  btn.disabled = true;
  btn.style.opacity = '0.7';

  try {
    const response = await fetch('http://127.0.0.1:5000/api/generate-pfp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        image: uploadedImageBase64,
        style: selectedStyle,
        extra_prompt: extraPrompt
      })
    });

    const data = await response.json();

    if (!response.ok || data.error) {
      throw new Error(data.error || 'Generation failed. Try again!');
    }

    const output = document.getElementById('pfpOutput');
    output.src = 'data:image/png;base64,' + data.image;
    resultEl.classList.remove('hidden');
    resultEl.scrollIntoView({ behavior: 'smooth' });

  } catch (err) {
    showPFPError(err.message);
  } finally {
    btn.textContent = '✦ Generate PFP';
    btn.disabled = false;
    btn.style.opacity = '1';
  }
}

function downloadPFP() {
  const output = document.getElementById('pfpOutput');
  if (!output.src) return;
  const a = document.createElement('a');
  a.href = output.src;
  a.download = 'sad-bunny-pfp.png';
  a.click();
}

function showPFPError(message) {
  const errorEl = document.getElementById('pfpError');
  errorEl.textContent = '⚠ ' + message;
  errorEl.classList.remove('hidden');
}