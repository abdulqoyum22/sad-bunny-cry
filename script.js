// ===============================
// Scroll Animations & Styles
// ===============================
const style = document.createElement('style');
style.textContent = `
  .fade-in-up { opacity: 0; transform: translateY(30px); transition: opacity 0.8s ease, transform 0.8s ease; }
  .fade-in-up.visible { opacity: 1; transform: translateY(0); }
  .slide-up { opacity: 0; transform: translateY(50px); transition: opacity 0.8s ease, transform 0.8s ease; }
  .slide-up.visible { opacity: 1; transform: translateY(0); }
  .gallery-img { opacity: 0; transform: scale(0.9); transition: opacity 0.6s ease, transform 0.6s ease; }
  .gallery-img.visible { opacity: 1; transform: scale(1); }
  .step-box { opacity: 0; transform: scale(0.8); transition: opacity 0.6s ease, transform 0.6s ease; }
  .step-box.visible { opacity: 1; transform: scale(1); }
  .footer-slide { opacity: 0; transform: translateY(60px); transition: opacity 0.8s ease, transform 0.8s ease; }
  .footer-slide.visible { opacity: 1; transform: translateY(0); }
`;
document.head.appendChild(style);

const observerOptions = { threshold: 0.1, rootMargin: '0px 0px -50px 0px' };
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry, index) => {
    if (entry.isIntersecting) {
      if (entry.target.classList.contains('step-box')) {
        setTimeout(() => entry.target.classList.add('visible'), index * 150);
      } else {
        entry.target.classList.add('visible');
      }
    }
  });
}, observerOptions);

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.fade-in-up, .slide-up, .gallery-img, .step-box, .footer-slide')
    .forEach(el => observer.observe(el));
});

// ===============================
// Crypto Token Data
// ===============================
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

// ===============================
// Copy Contract Address
// ===============================
function copyCA(evt) {
  const text = document.getElementById("contractAddress").innerText;
  navigator.clipboard.writeText(text).catch(() => {});
  const btn = (evt && (evt.currentTarget || evt.target)) || document.querySelector('button[onclick^="copyCA"]');
  if (btn) {
    const prev = btn.innerText;
    btn.innerText = "COPIED";
    setTimeout(() => btn.innerText = prev || "COPY", 1500);
  }
}

// ===============================
// Lightbox
// ===============================
document.querySelectorAll('section img').forEach(img => {
  img.addEventListener('click', () => {
    document.getElementById('lightboxImg').src = img.src;
    document.getElementById('lightbox').classList.remove('hidden');
  });
});

const lightboxEl = document.getElementById('lightbox');
if (lightboxEl) {
  lightboxEl.addEventListener('click', () => lightboxEl.classList.add('hidden'));
}

// ===============================
// Menu Toggle
// ===============================
const menuToggle = document.getElementById("menuToggle");
const menuContent = document.getElementById("menuContent");
const openPfp = document.getElementById("openPfp");
const closePfp = document.getElementById("closePfp");
const pfpBackdrop = document.getElementById("pfpBackdrop");
let menuOpen = false;

if (menuToggle && menuContent) {
  menuToggle.addEventListener("click", () => {
    menuOpen = !menuOpen;
    menuContent.classList.toggle("-translate-x-full", !menuOpen);
    menuContent.classList.toggle("translate-x-0", menuOpen);
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

// ===============================
// Local Layer-Based PFP Generator
// ===============================
const generateBtn = document.getElementById("generateBtn");
const seedInput = document.getElementById("seedInput");
const uploadFile = document.getElementById("uploadFile");
const avatarImg = document.getElementById("avatarImg");
const downloadBtn = document.getElementById("downloadBtn");

// Define assets
const bodyImages = ["body1.png","body2.png"];    // /assets/bodies/
const traitImages = ["hat1.png","hat2.png"];    // /assets/traits/
const backgroundImage = "/assets/background.png"; // custom background

// Populate dropdowns dynamically if selects exist
const bodySelect = document.getElementById("bodySelect");
const traitSelect = document.getElementById("traitSelect");

if (bodySelect) bodyImages.forEach(file => {
  const opt = document.createElement("option");
  opt.value = file;
  opt.textContent = file.replace(".png","");
  bodySelect.appendChild(opt);
});

if (traitSelect) traitImages.forEach(file => {
  const opt = document.createElement("option");
  opt.value = file;
  opt.textContent = file.replace(".png","");
  traitSelect.appendChild(opt);
}

// Generate PFP locally
async function generatePFPLocal() {
  const size = 1024;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  const bg = new Image();
  bg.src = backgroundImage;
  bg.onload = () => {
    ctx.drawImage(bg, 0, 0, size, size);

    const body = new Image();
    body.src = bodySelect ? `/assets/bodies/${bodySelect.value}` : `/assets/bodies/body1.png`;
    body.onload = () => {
      ctx.drawImage(body, 0, 0, size, size);

      const trait = new Image();
      trait.src = traitSelect ? `/assets/traits/${traitSelect.value}` : `/assets/traits/hat1.png`;
      trait.onload = () => {
        ctx.drawImage(trait, 0, 0, size, size);

        // optional prompt overlay
        const prompt = seedInput ? seedInput.value : '';
        if (prompt) {
          ctx.fillStyle = 'white';
          ctx.font = 'bold 36px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(prompt, size/2, size - 60);
        }

        const dataUrl = canvas.toDataURL('image/png');
        if (avatarImg) avatarImg.src = dataUrl;
        if (downloadBtn) {
          downloadBtn.href = dataUrl;
          downloadBtn.download = 'pfp.png';
          downloadBtn.classList.remove('hidden');
        }
      };
    };
  };
}

// Bind generate button
if (generateBtn) {
  generateBtn.addEventListener('click', generatePFPLocal);
}

// Draw first preview on load
generatePFPLocal();